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
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  },

  // Network monitoring
  monitorNetwork: () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
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
  safeStringify: (obj: any, space?: number) => {
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
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map(item => debugHelpers.deepClone(item)) as any;
    if (typeof obj === 'object') {
      const clonedObj = {} as any;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = debugHelpers.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  },

  // Type checking utilities
  typeCheck: (value: any) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  },

  // Error analysis
  analyzeError: (error: Error) => {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: (error as any).cause,
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
