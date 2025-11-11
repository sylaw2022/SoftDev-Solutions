import { serverDebugger } from '@/lib/serverDebugger';

export async function GET() {
  // Example server-side debugging
  serverDebugger.info('Debug API endpoint accessed', {
    timestamp: new Date().toISOString(),
    userAgent: 'Debug API'
  });

  // Simulate some server processing
  serverDebugger.info('Processing debug request...');
  
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async work
  
  serverDebugger.info('Debug request processed successfully');

  return Response.json({
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    serverLogs: serverDebugger.getLogs().slice(0, 10) // Return last 10 logs
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    serverDebugger.info('Debug POST request received', { body });
    
    // Simulate processing
    serverDebugger.info('Processing POST data...');
    
    const result = {
      received: body,
      processed: true,
      timestamp: new Date().toISOString()
    };
    
    serverDebugger.info('POST request processed', { result });
    
    return Response.json(result);
  } catch (error) {
    serverDebugger.error('Error processing POST request', {
      error: error instanceof Error ? error.message : error
    });
    
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}










