import { NextRequest, NextResponse } from 'next/server';
import { serverDebugger } from '@/lib/serverDebugger';
import { emailService } from '@/lib/emailService';
import { EmailValidator } from '@/lib/emailValidation';

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  const debugContext = serverDebugger.middleware(request);
  
  try {
    const body = await request.json();
    const { name, email, company, phone, service, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    console.log('[ContactAPI] Contact form submission received');
    serverDebugger.info('Contact form submission received', { name, email, company, service }, debugContext);

    // Send email notification to contact@softdev-solutions.com
    const adminEmail = 'contact@softdev-solutions.com';
    
    // Validate target email address before sending
    console.log('[ContactAPI] Validating target email address:', adminEmail);
    const validation = await EmailValidator.validate(adminEmail);
    
    if (!validation.isValid) {
      console.error('[ContactAPI] Target email validation failed:', validation.error);
      return NextResponse.json(
        { 
          error: `The recipient email address is not valid: ${validation.error}. Please contact us at (+65) 9155 6241.`,
          details: validation.details
        },
        { status: 400 }
      );
    }
    
    console.log('[ContactAPI] Target email validated successfully:', validation.details);
    
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      ${service ? `<p><strong>Service Interested In:</strong> ${service}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message}</p>
      <p><strong>Submission Date:</strong> ${new Date().toLocaleString()}</p>
    `;

    const mailOptions = {
      from: `"SoftDev Solutions" <${process.env.SMTP_FROM || 'contact@softdev-solutions.com'}>`,
      to: adminEmail,
      subject: `New Contact Form: ${name}`,
      html: emailContent,
      text: `
        New Contact Form Submission
        
        Name: ${name}
        Email: ${email}
        ${company ? `Company: ${company}` : ''}
        ${phone ? `Phone: ${phone}` : ''}
        ${service ? `Service: ${service}` : ''}
        
        Message:
        ${message}
        
        Submission Date: ${new Date().toLocaleString()}
      `
    };

    const testConnection = await emailService.testConnection();
    if (!testConnection.success) {
      console.error('[ContactAPI] Email service not available');
      return NextResponse.json(
        { error: 'Email service is not available. Please try again later.' },
        { status: 503 }
      );
    }

    try {
      // Get the transporter from emailService
      const transporter = (emailService as any).transporter;
      if (!transporter) {
        throw new Error('Email transporter not initialized');
      }

      console.log('[ContactAPI] Sending email to:', adminEmail);
      
      const info = await transporter.sendMail(mailOptions);
      
      console.log('[ContactAPI] Email sent successfully');
      console.log('[ContactAPI] Message ID:', info.messageId);
      
      serverDebugger.info('Contact form email accepted by SMTP', { 
        messageId: info.messageId,
        to: adminEmail,
        response: info.response 
      });

      return NextResponse.json({
        success: true,
        message: 'Your message has been submitted. We will review and respond soon.',
        messageId: info.messageId
      });

    } catch (emailError) {
      const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
      console.error('[ContactAPI] Failed to send contact email:', errorMessage);
      serverDebugger.error('Failed to send contact email', { error: errorMessage });
      
      // Detect specific error types
      let errorMsg = 'Failed to send message. Please try again later.';
      
      if (errorMessage.includes('550') || errorMessage.includes('550')) {
        errorMsg = 'The recipient email address is invalid or unreachable. Please contact support at contact@softdev-solutions.com.';
      } else if (errorMessage.includes('550-5.1.1')) {
        errorMsg = 'The recipient email address does not exist. Please contact support directly.';
      } else if (errorMessage.includes('451') || errorMessage.includes('temporarily')) {
        errorMsg = 'Email service is temporarily unavailable. Please try again in a few minutes.';
      } else if (errorMessage.includes('550') || errorMessage.includes('invalid') || errorMessage.includes('unreachable')) {
        errorMsg = 'Unable to reach the recipient email address. Please try again later or contact us via phone.';
      } else if (errorMessage.includes('connection') || errorMessage.includes('network')) {
        errorMsg = 'Network connection error. Please check your internet connection and try again.';
      }
      
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ContactAPI] Contact form submission failed:', errorMessage);
    serverDebugger.error('Contact form submission failed', { error: errorMessage }, debugContext);
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

