'use client';

import { useState, useEffect, useCallback } from 'react';

interface DebugInfo {
  timestamp: string;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  data?: Record<string, unknown>;
  component?: string;
}

interface ClientDebuggerProps {
  enabled?: boolean;
  maxLogs?: number;
  showTimestamp?: boolean;
  showComponent?: boolean;
}

export default function ClientDebugger({
  enabled = true,
  maxLogs = 50,
  showTimestamp = true,
  showComponent = true
}: ClientDebuggerProps) {
  const [logs, setLogs] = useState<DebugInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState<string>('');

  // Debug logging function
  const debugLog = useCallback((level: DebugInfo['level'], message: string, data?: Record<string, unknown>, component?: string) => {
    if (!enabled) return;

    const newLog: DebugInfo = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      component
    };

    setLogs(prev => {
      const updated = [newLog, ...prev];
      return updated.slice(0, maxLogs);
    });

    // Also log to console for VS Code debugging
    console[level](`[${component || 'ClientDebugger'}] ${message}`, data);
  }, [enabled, maxLogs]);

  // Expose debug functions globally for easy access
  interface WindowWithDebug extends Window {
    debugLog?: (level: DebugInfo['level'], message: string, data?: Record<string, unknown>, component?: string) => void;
    debugInfo?: (message: string, data?: Record<string, unknown>) => void;
    debugWarn?: (message: string, data?: Record<string, unknown>) => void;
    debugError?: (message: string, data?: Record<string, unknown>) => void;
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as WindowWithDebug;
      win.debugLog = debugLog;
      win.debugInfo = (message: string, data?: Record<string, unknown>) => debugLog('info', message, data);
      win.debugWarn = (message: string, data?: Record<string, unknown>) => debugLog('warn', message, data);
      win.debugError = (message: string, data?: Record<string, unknown>) => debugLog('error', message, data);
    }
  }, [debugLog]);

  // Log component mount/unmount
  useEffect(() => {
    debugLog('info', 'ClientDebugger mounted', { enabled, maxLogs });
    
    return () => {
      debugLog('info', 'ClientDebugger unmounted');
    };
  }, [debugLog, enabled, maxLogs]);

  // Log window events
  useEffect(() => {
    const handleResize = () => {
      debugLog('info', 'Window resized', { 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };

    const handleError = (event: ErrorEvent) => {
      debugLog('error', 'Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('error', handleError);
    };
  }, [debugLog]);

  const clearLogs = () => {
    setLogs([]);
    debugLog('info', 'Logs cleared');
  };

  const filteredLogs = logs.filter(log => 
    filter === '' || 
    log.message.toLowerCase().includes(filter.toLowerCase()) ||
    log.level.toLowerCase().includes(filter.toLowerCase())
  );

  const getLevelColor = (level: DebugInfo['level']) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
      >
        🐛 Debug ({logs.length})
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 w-96 h-80 bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">Client Debug Console</h3>
              <button
                onClick={clearLogs}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Clear
              </button>
            </div>
            
            {/* Filter */}
            <input
              type="text"
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto p-2 text-xs font-mono">
            {filteredLogs.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No logs to display</div>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold ${getLevelColor(log.level)}`}>
                      [{log.level.toUpperCase()}]
                    </span>
                    {showComponent && log.component && (
                      <span className="text-purple-600">[{log.component}]</span>
                    )}
                    {showTimestamp && (
                      <span className="text-gray-500 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-800">{log.message}</div>
                  {log.data && (
                    <pre className="mt-1 text-xs text-gray-600 bg-gray-100 p-1 rounded overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}










