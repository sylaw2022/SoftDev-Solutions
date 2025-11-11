import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { serverDebugger } from '@/lib/serverDebugger';

interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  adminEmail: string;
}

export async function POST(request: NextRequest) {
  try {
    const config: EmailConfig = await request.json();
    
    console.log('[EmailConfigAPI] Received email configuration request');
    serverDebugger.info('Email configuration request received', { 
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpUser: config.smtpUser,
      smtpFrom: config.smtpFrom,
      adminEmail: config.adminEmail
    });

    // Validate required fields
    if (!config.smtpUser || !config.smtpPass) {
      return NextResponse.json(
        { success: false, error: 'SMTP User and Password are required' },
        { status: 400 }
      );
    }

    // Create .env.local content
    const envContent = `# Real Email Configuration
SMTP_HOST=${config.smtpHost}
SMTP_PORT=${config.smtpPort}
SMTP_SECURE=false
SMTP_USER=${config.smtpUser}
SMTP_PASS=${config.smtpPass}
SMTP_FROM=${config.smtpFrom}
ADMIN_EMAIL=${config.adminEmail}
NODE_ENV=production
`;

    try {
      // Write to .env.local file
      const envPath = join(process.cwd(), '.env.local');
      writeFileSync(envPath, envContent, 'utf8');
      
      console.log('[EmailConfigAPI] Configuration saved to .env.local');
      serverDebugger.info('Email configuration saved', { envPath });
      
      return NextResponse.json({
        success: true,
        message: 'Email configuration saved successfully. Please restart the service to apply changes.',
        envPath
      });
      
    } catch (writeError) {
      console.error('[EmailConfigAPI] Failed to write .env.local:', writeError);
      serverDebugger.error('Failed to write .env.local', { error: writeError });
      
      // Fallback: return configuration for manual setup
      return NextResponse.json({
        success: true,
        message: 'Configuration prepared. Please create .env.local manually with the following content:',
        envContent,
        manualSetup: true
      });
    }

  } catch (error) {
    console.error('[EmailConfigAPI] Error processing configuration:', error);
    serverDebugger.error('Error processing email configuration', { error });
    
    return NextResponse.json(
      { success: false, error: 'Failed to process configuration' },
      { status: 500 }
    );
  }
}






