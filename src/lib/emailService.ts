import * as nodemailer from 'nodemailer';
import { serverDebugger } from './serverDebugger';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email template interface
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email data interface
interface EmailData {
  to: string;
  firstName: string;
  lastName: string;
  company: string;
  confirmationToken?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Check for real SMTP configuration first
      const hasRealSMTP = process.env.SMTP_USER && process.env.SMTP_PASS && 
                         process.env.SMTP_USER !== 'ethereal.user@ethereal.email' &&
                         process.env.SMTP_PASS !== 'ethereal.pass';

      if (hasRealSMTP) {
        // Use real SMTP configuration
        const config: EmailConfig = {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
          }
        };

        this.transporter = nodemailer.createTransport(config);
        this.isConfigured = true;
        
        console.log('[EmailService] Real SMTP transporter initialized');
        console.log('[EmailService] SMTP Host:', config.host);
        console.log('[EmailService] SMTP Port:', config.port);
        console.log('[EmailService] SMTP User:', config.auth.user);
        
        serverDebugger.info('Real SMTP transporter initialized', { 
          host: config.host, 
          port: config.port,
          user: config.auth.user
        });
        return;
      }

      // Fallback to test account for development
      console.log('[EmailService] No real SMTP configured, using test account');
      console.log('[EmailService] To use real emails, set SMTP_USER and SMTP_PASS environment variables');
      this.createTestAccount();
      
    } catch (error) {
      console.error('[EmailService] Failed to initialize email transporter:', error);
      serverDebugger.error('Failed to initialize email transporter', { error });
    }
  }

  private async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      this.isConfigured = true;
      
      console.log('[EmailService] Test account created for development');
      console.log('[EmailService] Test account user:', testAccount.user);
      console.log('[EmailService] Test account pass:', testAccount.pass);
      
      serverDebugger.info('Test email account created', {
        user: testAccount.user,
        pass: testAccount.pass
      });
    } catch (error) {
      console.error('[EmailService] Failed to create test account:', error);
      serverDebugger.error('Failed to create test account', { error });
    }
  }

  // Generate confirmation token
  private generateConfirmationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Create welcome email template
  private createWelcomeEmailTemplate(data: EmailData): EmailTemplate {
    const confirmationToken = data.confirmationToken || this.generateConfirmationToken();
    
    return {
      subject: `Welcome to SoftDev Solutions, ${data.firstName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SoftDev Solutions</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .highlight { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to SoftDev Solutions!</h1>
              <p>Your registration has been confirmed</p>
            </div>
            <div class="content">
              <h2>Hello ${data.firstName} ${data.lastName},</h2>
              
              <p>Thank you for registering with SoftDev Solutions! We're excited to have you on board and look forward to helping transform your business with our software solutions.</p>
              
              <div class="highlight">
                <h3>Registration Details:</h3>
                <ul>
                  <li><strong>Name:</strong> ${data.firstName} ${data.lastName}</li>
                  <li><strong>Company:</strong> ${data.company}</li>
                  <li><strong>Email:</strong> ${data.to}</li>
                  <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
                </ul>
              </div>
              
              <h3>What's Next?</h3>
              <p>Our team will contact you within 24 hours to discuss your project requirements and provide a customized consultation. In the meantime, feel free to explore our services:</p>
              
              <ul>
                <li>Custom Web Development</li>
                <li>Mobile App Development</li>
                <li>Cloud Solutions & Migration</li>
                <li>Technology Consulting</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="http://localhost:3000/services" class="button">Explore Our Services</a>
              </p>
              
              <h3>Need Immediate Assistance?</h3>
              <p>If you have any questions or need immediate assistance, please don't hesitate to contact us:</p>
              <ul>
                <li>📧 Email: contact@softdev-solutions.com</li>
                <li>📞 WhatsApp: (+65) 9155 6241</li>
                <li>🌐 Website: <a href="http://localhost:3000">softdev-solutions.com</a></li>
              </ul>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.to} because you registered on our website.</p>
              <p>© 2024 SoftDev Solutions. All rights reserved.</p>
              <p>Confirmation Token: ${confirmationToken}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to SoftDev Solutions!
        
        Hello ${data.firstName} ${data.lastName},
        
        Thank you for registering with SoftDev Solutions! We're excited to have you on board and look forward to helping transform your business with our software solutions.
        
        Registration Details:
        - Name: ${data.firstName} ${data.lastName}
        - Company: ${data.company}
        - Email: ${data.to}
        - Registration Date: ${new Date().toLocaleDateString()}
        
        What's Next?
        Our team will contact you within 24 hours to discuss your project requirements and provide a customized consultation.
        
        Our Services:
        - Custom Web Development
        - Mobile App Development
        - Cloud Solutions & Migration
        - Technology Consulting
        
        Need Immediate Assistance?
        - Email: contact@softdev-solutions.com
        - WhatsApp: (+65) 9155 6241
        - Website: http://localhost:3000
        
        Confirmation Token: ${confirmationToken}
        
        © 2024 SoftDev Solutions. All rights reserved.
      `
    };
  }

  // Send welcome email
  async sendWelcomeEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter || !this.isConfigured) {
      const error = 'Email service not configured';
      console.error('[EmailService]', error);
      serverDebugger.error('Email service not configured');
      return { success: false, error };
    }

    try {
      const template = this.createWelcomeEmailTemplate(data);
      
      const mailOptions = {
        from: `"SoftDev Solutions" <${process.env.SMTP_FROM || 'contact@softdev-solutions.com'}>`,
        to: data.to,
        subject: template.subject,
        html: template.html,
        text: template.text
      };

      console.log('[EmailService] Sending welcome email to:', data.to);
      serverDebugger.info('Sending welcome email', { 
        to: data.to, 
        firstName: data.firstName,
        company: data.company 
      });

      const info = await this.transporter.sendMail(mailOptions);
      
      // In development, log the preview URL
      if (process.env.NODE_ENV === 'development') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('[EmailService] Preview URL:', previewUrl);
          serverDebugger.info('Email preview URL generated', { previewUrl });
        }
      }

      console.log('[EmailService] Welcome email sent successfully:', info.messageId);
      serverDebugger.info('Welcome email sent successfully', { 
        messageId: info.messageId,
        to: data.to 
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[EmailService] Failed to send welcome email:', errorMessage);
      serverDebugger.error('Failed to send welcome email', { 
        error: errorMessage,
        to: data.to 
      });
      
      return { success: false, error: errorMessage };
    }
  }

  // Send admin notification email
  async sendAdminNotification(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter || !this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'contact@softdev-solutions.com';
      
      const mailOptions = {
        from: `"SoftDev Solutions" <${process.env.SMTP_FROM || 'contact@softdev-solutions.com'}>`,
        to: adminEmail,
        subject: `New User Registration: ${data.firstName} ${data.lastName}`,
        html: `
          <h2>New User Registration</h2>
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.to}</p>
          <p><strong>Company:</strong> ${data.company}</p>
          <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Action Required:</strong> Contact user within 24 hours</p>
        `,
        text: `
          New User Registration
          
          Name: ${data.firstName} ${data.lastName}
          Email: ${data.to}
          Company: ${data.company}
          Registration Date: ${new Date().toLocaleString()}
          Action Required: Contact user within 24 hours
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('[EmailService] Admin notification sent:', info.messageId);
      serverDebugger.info('Admin notification sent', { 
        messageId: info.messageId,
        adminEmail 
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[EmailService] Failed to send admin notification:', errorMessage);
      serverDebugger.error('Failed to send admin notification', { error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  }

  // Test email configuration
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.transporter) {
      return { success: false, error: 'Transporter not initialized' };
    }

    try {
      await this.transporter.verify();
      console.log('[EmailService] Email connection verified');
      serverDebugger.info('Email connection verified');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[EmailService] Email connection failed:', errorMessage);
      serverDebugger.error('Email connection failed', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types
export type { EmailData, EmailTemplate };

