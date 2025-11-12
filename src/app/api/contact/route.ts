import { NextRequest, NextResponse } from 'next/server';
import { serverDebugger } from '@/lib/serverDebugger';

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
    const body = await request.json() as Partial<ContactFormData>;
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

    // Store contact form submission (you can add database storage here if needed)
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      message: 'Your message has been submitted. We will review and respond soon.'
    });

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

