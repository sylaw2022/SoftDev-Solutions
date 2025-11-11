// Debug utilities and helpers for both client and server

// Client-side debug utilities
export const clientDebugUtils = {
  // Performance monitoring
  measurePerformance: (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`[DebugUtils] [Performance] ${name}: ${end - start}ms`);
    return end - start;
  },

  // Memory usage (if available)
  getMemoryUsage: () => {
    interface PerformanceMemory {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    }
    
    interface PerformanceWithMemory extends Performance {
      memory?: PerformanceMemory;
    }
    
    if ('memory' in performance) {
      const perf = performance as PerformanceWithMemory;
      const memory = perf.memory;
      if (memory) {
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        };
      }
    }
    return null;
  },

  // Network monitoring
  monitorNetwork: () => {
    interface NetworkInformation {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    }
    
    interface NavigatorWithConnection extends Navigator {
      connection?: NetworkInformation;
    }
    
    if ('connection' in navigator) {
      const nav = navigator as NavigatorWithConnection;
      const connection = nav.connection;
      if (connection) {
        return {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }
    }
    return null;
  },

  // Local storage debugging
  debugLocalStorage: () => {
    const storage = { ...localStorage };
    console.log('[DebugUtils] [LocalStorage] Current data:', storage);
    return storage;
  },

  // Session storage debugging
  debugSessionStorage: () => {
    const storage = { ...sessionStorage };
    console.log('[DebugUtils] [SessionStorage] Current data:', storage);
    return storage;
  },

  // Cookie debugging
  debugCookies: () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    console.log('[DebugUtils] [Cookies] Current cookies:', cookies);
    return cookies;
  }
};

// Server-side debug utilities
export const serverDebugUtils = {
  // Request analysis
  analyzeRequest: (request: Request) => {
    return {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      acceptLanguage: request.headers.get('accept-language'),
      timestamp: new Date().toISOString()
    };
  },

  // Environment info
  getEnvironmentInfo: () => {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV
      }
    };
  },

  // Performance timing
  measureServerPerformance: async <T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    const start = process.hrtime.bigint();
    const result = await fn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    console.log(`[DebugUtils] [Server Performance] ${name}: ${duration}ms`);
    return result;
  }
};

// Common debug helpers
export const debugHelpers = {
  // Safe JSON stringify with circular reference handling
  safeStringify: (obj: unknown, space?: number) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, val) => {
      if (val != null && typeof val === 'object') {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }
      return val;
    }, space);
  },

  // Deep clone for debugging
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => debugHelpers.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const clonedObj = {} as Record<string, unknown>;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clonedObj[key] = debugHelpers.deepClone((obj as Record<string, unknown>)[key]);
        }
      }
      return clonedObj as T;
    }
    return obj;
  },

  // Type checking utilities
  typeCheck: (value: unknown) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  },

  // Error analysis
  analyzeError: (error: Error) => {
    interface ErrorWithCause extends Error {
      cause?: unknown;
    }
    
    const errorWithCause = error as ErrorWithCause;
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: errorWithCause.cause,
      timestamp: new Date().toISOString()
    };
  }
};

// Debug configuration
export const debugConfig = {
  // Enable/disable debug features
  enabled: process.env.NODE_ENV === 'development',
  
  // Log levels
  levels: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  },
  
  // Current log level
  currentLevel: process.env.DEBUG_LEVEL ? 
    parseInt(process.env.DEBUG_LEVEL) : 3,
  
  // Check if logging should occur
  shouldLog: (level: number) => {
    return debugConfig.enabled && level <= debugConfig.currentLevel;
  }
};
