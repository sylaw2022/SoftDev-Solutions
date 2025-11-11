import { NextRequest, NextResponse } from 'next/server';
import { serverDebugger } from '@/lib/serverDebugger';
import { emailService } from '@/lib/emailService';

// Test email endpoint
export async function POST(request: NextRequest) {
  const debugContext = serverDebugger.middleware(request);
  
  try {
    const body = await request.json();
    const { to, firstName, lastName, company } = body;

    serverDebugger.info('Email test request received', { to, firstName, lastName, company }, debugContext);

    if (!to || !firstName || !lastName || !company) {
      return NextResponse.json(
        { error: 'Missing required fields: to, firstName, lastName, company' },
        { status: 400 }
      );
    }

    // Test email connection first
    const connectionTest = await emailService.testConnection();
    if (!connectionTest.success) {
      serverDebugger.error('Email connection test failed', { error: connectionTest.error }, debugContext);
      return NextResponse.json(
        { error: 'Email service not available', details: connectionTest.error },
        { status: 503 }
      );
    }

    // Send test email
    const emailResult = await emailService.sendWelcomeEmail({
      to,
      firstName,
      lastName,
      company
    });

    if (emailResult.success) {
      serverDebugger.info('Test email sent successfully', {
        messageId: emailResult.messageId,
        to
      }, debugContext);

      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: emailResult.messageId,
        previewUrl: process.env.NODE_ENV === 'development' ? 
          'Check console logs for preview URL' : undefined
      });
    } else {
      serverDebugger.error('Test email failed', { error: emailResult.error }, debugContext);
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

  } catch (error) {
    serverDebugger.error('Email test request failed', {
      error: error instanceof Error ? error.message : error
    }, debugContext);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get email service status
interface EmailStatusResponse {
  status: 'healthy' | 'error';
  message: string;
  mode: 'real' | 'test';
  environment?: string;
  timestamp: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpFrom?: string;
  adminEmail?: string;
  testMode?: boolean;
  error?: string;
}

export async function GET() {
  try {
    const connectionTest = await emailService.testConnection();
    
    // Determine if we're using real SMTP or test account
    const hasRealSMTP = process.env.SMTP_USER && process.env.SMTP_PASS && 
                       process.env.SMTP_USER !== 'ethereal.user@ethereal.email' &&
                       process.env.SMTP_PASS !== 'ethereal.pass';
    
    const response: EmailStatusResponse = {
      status: connectionTest.success ? 'healthy' : 'error',
      message: connectionTest.success ? 'Email service is working' : (connectionTest.error || 'Unknown error'),
      mode: hasRealSMTP ? 'real' : 'test',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    if (hasRealSMTP) {
      // Real SMTP configuration
      response.smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
      response.smtpPort = parseInt(process.env.SMTP_PORT || '587');
      response.smtpUser = process.env.SMTP_USER;
      response.smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;
      response.adminEmail = process.env.ADMIN_EMAIL || 'contact@softdev-solutions.com';
    } else {
      // Test account mode - we can't get the test account details from the API
      // but we can indicate it's in test mode
      response.testMode = true;
    }

    if (!connectionTest.success) {
      response.error = connectionTest.error;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        mode: 'test',
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}



