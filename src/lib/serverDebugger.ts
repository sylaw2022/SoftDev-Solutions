import { NextRequest, NextResponse } from 'next/server';

interface ServerDebugInfo {
  timestamp: string;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  data?: Record<string, unknown>;
  endpoint?: string;
  method?: string;
  requestId?: string;
}

interface DebugContext {
  endpoint?: string;
  method?: string;
  requestId?: string;
}

class ServerDebugger {
  private static instance: ServerDebugger;
  private logs: ServerDebugInfo[] = [];
  private maxLogs: number = 100;

  private constructor() {}

  static getInstance(): ServerDebugger {
    if (!ServerDebugger.instance) {
      ServerDebugger.instance = new ServerDebugger();
    }
    return ServerDebugger.instance;
  }

  log(level: ServerDebugInfo['level'], message: string, data?: Record<string, unknown>, context?: DebugContext) {
    const debugInfo: ServerDebugInfo = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      endpoint: context?.endpoint,
      method: context?.method,
      requestId: context?.requestId
    };

    this.logs.unshift(debugInfo);
    this.logs = this.logs.slice(0, this.maxLogs);

    // Log to console for VS Code debugging
    console[level](`[ServerDebugger] ${message}`, data);
  }

  info(message: string, data?: Record<string, unknown>, context?: DebugContext) {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: Record<string, unknown>, context?: DebugContext) {
    this.log('warn', message, data, context);
  }

  error(message: string, data?: Record<string, unknown>, context?: DebugContext) {
    this.log('error', message, data, context);
  }

  getLogs(): ServerDebugInfo[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.info('Server logs cleared');
  }

  // Middleware for API routes
  middleware(request: NextRequest) {
    const requestId = crypto.randomUUID();
    const endpoint = request.nextUrl.pathname;
    const method = request.method;

    this.info(`Request received`, {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    }, { endpoint, method, requestId });

    return { requestId, endpoint, method };
  }
}

// Export singleton instance
export const serverDebugger = ServerDebugger.getInstance();

// Helper function for API route debugging
export function debugApiRoute(
  handler: (request: NextRequest, context?: Record<string, unknown>) => Promise<NextResponse>,
  routeName?: string
) {
  return async (request: NextRequest, context?: Record<string, unknown>) => {
    const debugContext = serverDebugger.middleware(request);
    
    try {
      serverDebugger.info(`Starting ${routeName || 'API route'}`, {}, debugContext);
      
      const response = await handler(request, context);
      
      serverDebugger.info(`Completed ${routeName || 'API route'}`, {
        status: response.status,
        statusText: response.statusText
      }, debugContext);
      
      return response;
    } catch (error) {
      serverDebugger.error(`Error in ${routeName || 'API route'}`, {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      }, debugContext);
      
      throw error;
    }
  };
}

// Debug API endpoint to view server logs
export async function GET() {
  const logs = serverDebugger.getLogs();
  
  return NextResponse.json({
    logs,
    totalLogs: logs.length,
    timestamp: new Date().toISOString()
  });
}

// Debug API endpoint to clear server logs
export async function DELETE() {
  serverDebugger.clearLogs();
  
  return NextResponse.json({
    message: 'Server logs cleared',
    timestamp: new Date().toISOString()
  });
}










