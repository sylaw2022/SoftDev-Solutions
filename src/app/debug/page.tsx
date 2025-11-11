'use client';

import { useState, useEffect } from 'react';
import ClientDebugger from '@/components/ClientDebugger';
import EmailConfigForm from '@/components/EmailConfigForm';
import { clientDebugUtils, debugHelpers } from '@/lib/debugUtils';

interface ServerLog {
  level: string;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

interface EnvironmentInfo {
  nodeEnv?: string;
  [key: string]: unknown;
}

interface PerformanceMetrics {
  memoryUsage?: Record<string, unknown>;
  networkInfo?: Record<string, unknown>;
  localStorage?: Record<string, unknown>;
  sessionStorage?: Record<string, unknown>;
  cookies?: Record<string, unknown>;
}

interface DatabaseHealth {
  status?: string;
  [key: string]: unknown;
}

interface EmailStatus {
  status?: string;
  [key: string]: unknown;
}

interface WindowWithDebug extends Window {
  debugInfo?: (message: string, data?: Record<string, unknown>) => void;
  debugWarn?: (message: string, data?: Record<string, unknown>) => void;
  debugError?: (message: string, data?: Record<string, unknown>) => void;
}

export default function DebugPage() {
  const [serverLogs, setServerLogs] = useState<ServerLog[]>([]);
  const [environmentInfo, setEnvironmentInfo] = useState<EnvironmentInfo | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [databaseHealth, setDatabaseHealth] = useState<DatabaseHealth | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);

  // Test client-side debugging
  const testClientDebugging = () => {
    // Test different log levels
    if (typeof window !== 'undefined') {
      const win = window as WindowWithDebug;
      win.debugInfo?.('Testing info logging', { test: true });
      win.debugWarn?.('Testing warning logging', { warning: 'This is a test warning' });
      win.debugError?.('Testing error logging', { error: 'This is a test error' });
    }
  };

  // Test performance monitoring
  const testPerformanceMonitoring = () => {
    const duration = clientDebugUtils.measurePerformance('Test Operation', () => {
      // Simulate some work
      for (let i = 0; i < 1000000; i++) {
        // Performance test loop
        void i;
      }
    });
    
    if (typeof window !== 'undefined') {
      const win = window as WindowWithDebug;
      win.debugInfo?.('Performance test completed', { duration });
    }
  };

  // Test memory and network info
  const testSystemInfo = () => {
    const memoryUsage = clientDebugUtils.getMemoryUsage();
    const networkInfo = clientDebugUtils.monitorNetwork();
    const localStorage = clientDebugUtils.debugLocalStorage();
    const sessionStorage = clientDebugUtils.debugSessionStorage();
    const cookies = clientDebugUtils.debugCookies();

    if (typeof window !== 'undefined') {
      const win = window as WindowWithDebug;
      win.debugInfo?.('System information gathered', {
        memoryUsage,
        networkInfo,
        localStorage,
        sessionStorage,
        cookies
      });
    }

    setPerformanceMetrics({
      memoryUsage,
      networkInfo,
      localStorage,
      sessionStorage,
      cookies
    });
  };

  // Fetch server logs
  const fetchServerLogs = async () => {
    try {
      const response = await fetch('/api/debug');
      const data = await response.json();
      setServerLogs(data.serverLogs || []);
      
      if (typeof window !== 'undefined') {
        const win = window as WindowWithDebug;
        win.debugInfo?.('Server logs fetched', { count: data.serverLogs?.length || 0 });
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        const win = window as WindowWithDebug;
        win.debugError?.('Failed to fetch server logs', { error: error instanceof Error ? error.message : String(error) });
      }
    }
  };

  // Test server API
  const testServerAPI = async () => {
    try {
      const testData = {
        message: 'Test data from client',
        timestamp: new Date().toISOString(),
        clientInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform
        }
      };

      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      if (typeof window !== 'undefined') {
        const win = window as WindowWithDebug;
        win.debugInfo?.('Server API test completed', { result });
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        const win = window as WindowWithDebug;
        win.debugError?.('Server API test failed', { error: error instanceof Error ? error.message : String(error) });
      }
    }
  };

  // Get environment info
  const getEnvironmentInfo = async () => {
    try {
      const response = await fetch('/api/debug');
      const data = await response.json();
      setEnvironmentInfo(data);
    } catch (error) {
      console.error('[DebugPage] Failed to get environment info:', error);
    }
  };

  // Get database health
  const getDatabaseHealth = async () => {
    try {
      const response = await fetch('/api/admin/database');
      const data = await response.json();
      setDatabaseHealth(data);
      
      if (typeof window !== 'undefined') {
        const win = window as WindowWithDebug;
        win.debugInfo?.('Database health retrieved', data);
      }
    } catch (error) {
      console.error('[DebugPage] Failed to get database health:', error);
      setDatabaseHealth({ status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  // Get email status
  const getEmailStatus = async () => {
    try {
      const response = await fetch('/api/email/test');
      const data = await response.json();
      setEmailStatus(data);
      
      if (typeof window !== 'undefined') {
        const win = window as WindowWithDebug;
        win.debugInfo?.('Email status retrieved', data);
      }
    } catch (error) {
      console.error('[DebugPage] Failed to get email status:', error);
    }
  };

  // Test email sending
  const testEmailSending = async () => {
    try {
      const testData = {
        to: 'groklord@yahoo.com',
        firstName: 'Test',
        lastName: 'User',
        company: 'Test Company'
      };

      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      if (typeof window !== 'undefined') {
        const win = window as WindowWithDebug;
        win.debugInfo?.('Email test completed', { result });
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        const win = window as WindowWithDebug;
        win.debugError?.('Email test failed', { error: error instanceof Error ? error.message : String(error) });
      }
    }
  };

  useEffect(() => {
    // Initial debug log
    if (typeof window !== 'undefined') {
      const win = window as WindowWithDebug;
      win.debugInfo?.('Debug page loaded', {
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    }

    // Fetch initial data
    fetchServerLogs();
    getEnvironmentInfo();
    getDatabaseHealth();
    getEmailStatus();
    testSystemInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Debug Dashboard</h1>
        
        {/* Debug Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Debug Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={testClientDebugging}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Test Client Debugging
            </button>
            
            <button
              onClick={testPerformanceMonitoring}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Test Performance
            </button>
            
            <button
              onClick={testSystemInfo}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
            >
              Test System Info
            </button>
            
            <button
              onClick={testServerAPI}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            >
              Test Server API
            </button>
            
            <button
              onClick={fetchServerLogs}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Refresh Server Logs
            </button>
            
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const win = window as WindowWithDebug;
                  win.debugInfo?.('Manual refresh triggered');
                }
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Manual Refresh
            </button>
            
            <button
              onClick={getDatabaseHealth}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
            >
              Check Database
            </button>
            
            <button
              onClick={getEmailStatus}
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors"
            >
              Check Email Service
            </button>
            
            <button
              onClick={testEmailSending}
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors"
            >
              Test Email
            </button>
          </div>
        </div>

        {/* Environment Information */}
        {environmentInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {debugHelpers.safeStringify(environmentInfo, 2)}
            </pre>
          </div>
        )}

        {/* Database Health */}
        {databaseHealth && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Database Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${
                databaseHealth.status === 'healthy' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className="font-semibold mb-2">Status</h3>
                <p className={`font-semibold ${
                  databaseHealth.status === 'healthy' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {databaseHealth.status.toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 mt-1">{databaseHealth.message}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">User Count</h3>
                <p className="text-2xl font-bold text-blue-800">{databaseHealth.userCount}</p>
                <p className="text-sm text-gray-600 mt-1">Total registered users</p>
              </div>
            </div>
          </div>
        )}

        {/* Email Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📧 Email Configuration</h2>
          <p className="text-gray-600 mb-4">
            Configure real email sending instead of test emails. This will allow actual emails to be delivered to recipients.
          </p>
          <EmailConfigForm />
        </div>

        {/* Email Service Status */}
        {emailStatus && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Email Service Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${
                emailStatus.status === 'healthy' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className="font-semibold mb-2">Service Status</h3>
                <p className={`font-semibold ${
                  emailStatus.status === 'healthy' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {emailStatus.status.toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 mt-1">{emailStatus.message}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Environment</h3>
                <p className="text-lg font-bold text-blue-800">{emailStatus.environment}</p>
                <p className="text-sm text-gray-600 mt-1">Current environment</p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {performanceMetrics && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performanceMetrics.memoryUsage && (
                <div>
                  <h3 className="font-semibold mb-2">Memory Usage</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm">
                    {debugHelpers.safeStringify(performanceMetrics.memoryUsage, 2)}
                  </pre>
                </div>
              )}
              
              {performanceMetrics.networkInfo && (
                <div>
                  <h3 className="font-semibold mb-2">Network Information</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm">
                    {debugHelpers.safeStringify(performanceMetrics.networkInfo, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Server Logs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Server Logs</h2>
          {serverLogs.length > 0 ? (
            <div className="space-y-2">
              {serverLogs.map((log, index) => (
                <div key={index} className="bg-gray-100 p-3 rounded text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold ${
                      log.level === 'error' ? 'text-red-500' :
                      log.level === 'warn' ? 'text-yellow-500' :
                      log.level === 'info' ? 'text-blue-500' :
                      'text-gray-500'
                    }`}>
                      [{log.level?.toUpperCase()}]
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-800">{log.message}</div>
                  {log.data && (
                    <pre className="mt-1 text-xs text-gray-600 bg-gray-200 p-2 rounded overflow-x-auto">
                      {debugHelpers.safeStringify(log.data, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No server logs available</p>
          )}
        </div>

        {/* VS Code Debug Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">VS Code Debugging Instructions</h2>
          <div className="space-y-3 text-blue-700">
            <div>
              <h3 className="font-semibold">1. Client-Side Debugging:</h3>
              <p>• Use the &quot;Next.js: debug client-side&quot; configuration</p>
              <p>• Set breakpoints in client components</p>
              <p>• Use the ClientDebugger component for runtime debugging</p>
            </div>
            
            <div>
              <h3 className="font-semibold">2. Server-Side Debugging:</h3>
              <p>• Use the &quot;Next.js: debug server-side&quot; configuration</p>
              <p>• Set breakpoints in API routes and server components</p>
              <p>• Check server logs via the debug API endpoint</p>
            </div>
            
            <div>
              <h3 className="font-semibold">3. Full Stack Debugging:</h3>
              <p>• Use the &quot;Next.js: debug full stack&quot; configuration</p>
              <p>• Debug both client and server simultaneously</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Debugger Component */}
      <ClientDebugger enabled={true} maxLogs={100} />
    </div>
  );
}
