'use client';

import React, { useState, useEffect } from 'react';
import { useNotification } from './Notification';

interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  adminEmail: string;
}

interface EmailStatus {
  status: string;
  mode: 'real' | 'test';
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  testAccount?: {
    user: string;
    pass: string;
  };
  error?: string;
}

export default function EmailConfigForm() {
  const [config, setConfig] = useState<EmailConfig>({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
    adminEmail: 'contact@softdev-solutions.com'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const { addNotification } = useNotification();
  
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    addNotification(type, message);
  };

  // Fetch current email status on component mount
  useEffect(() => {
    const fetchEmailStatus = async () => {
      try {
        const response = await fetch('/api/email/test');
        const data = await response.json();
        setEmailStatus(data);
      } catch (error) {
        console.error('Failed to fetch email status:', error);
        setEmailStatus({ status: 'error', mode: 'test', error: 'Failed to fetch status' });
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchEmailStatus();
  }, []);

  const refreshEmailStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const response = await fetch('/api/email/test');
      const data = await response.json();
      setEmailStatus(data);
    } catch (error) {
      console.error('Failed to fetch email status:', error);
      setEmailStatus({ status: 'error', mode: 'test', error: 'Failed to fetch status' });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/email/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();

      if (result.success) {
        showNotification('Email configuration saved successfully! Restart the service to apply changes.', 'success');
        // Refresh email status after saving
        setTimeout(() => {
          refreshEmailStatus();
        }, 1000);
      } else {
        showNotification(`Failed to save configuration: ${result.error}`, 'error');
      }
    } catch {
      showNotification('Error saving configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EmailConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
      smtpFrom: field === 'smtpUser' ? value : prev.smtpFrom
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📧 Email Configuration</h2>
      
      {/* Current Email Account Information */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Current Email Account Status</h3>
          <button
            onClick={refreshEmailStatus}
            disabled={isLoadingStatus}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            {isLoadingStatus ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {isLoadingStatus ? (
          <div className="text-gray-500">Loading email status...</div>
        ) : emailStatus ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Mode:</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                emailStatus.mode === 'real' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {emailStatus.mode === 'real' ? 'Real SMTP' : 'Test Account'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                emailStatus.status === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {emailStatus.status === 'healthy' ? 'Connected' : 'Error'}
              </span>
            </div>

            {emailStatus.mode === 'real' && emailStatus.smtpUser && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">SMTP Host:</span>
                  <span className="text-sm text-gray-800">{emailStatus.smtpHost}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">SMTP Port:</span>
                  <span className="text-sm text-gray-800">{emailStatus.smtpPort}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Email Account:</span>
                  <span className="text-sm text-gray-800">{emailStatus.smtpUser}</span>
                </div>
              </>
            )}

            {emailStatus.mode === 'test' && emailStatus.testAccount && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Test Account:</span>
                  <span className="text-sm text-gray-800">{emailStatus.testAccount.user}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Test Password:</span>
                  <span className="text-sm text-gray-800 font-mono">{emailStatus.testAccount.pass}</span>
                </div>
              </>
            )}

            {emailStatus.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <div className="text-sm font-medium text-red-800 mb-1">Error Details:</div>
                <div className="text-xs text-red-700 break-all">{emailStatus.error}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500">Unable to load email status</div>
        )}
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Gmail Setup Instructions:</h3>
        <ol className="list-decimal list-inside text-blue-700 space-y-1">
          <li>Enable 2-Factor Authentication on your Gmail account</li>
          <li>Go to Google Account Settings → Security → App passwords</li>
          <li>Generate an &quot;App password&quot; for this application</li>
          <li>Use the app password (not your regular password) below</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Host
          </label>
          <input
            type="text"
            value={config.smtpHost}
            onChange={(e) => handleInputChange('smtpHost', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="smtp.gmail.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Port
          </label>
          <input
            type="text"
            value={config.smtpPort}
            onChange={(e) => handleInputChange('smtpPort', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="587"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP User (Your Email)
          </label>
          <input
            type="email"
            value={config.smtpUser}
            onChange={(e) => handleInputChange('smtpUser', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your-email@gmail.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Password (App Password)
          </label>
          <input
            type="password"
            value={config.smtpPass}
            onChange={(e) => handleInputChange('smtpPass', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your app password"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Email
          </label>
          <input
            type="email"
            value={config.smtpFrom}
            onChange={(e) => handleInputChange('smtpFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your-email@gmail.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Email
          </label>
          <input
            type="email"
            value={config.adminEmail}
            onChange={(e) => handleInputChange('adminEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="contact@softdev-solutions.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <p className="text-yellow-800">
          <strong>Note:</strong> After saving the configuration, you need to restart the service 
          (<code className="bg-yellow-200 px-1 rounded">npm run dev</code>) for the changes to take effect.
        </p>
      </div>
    </div>
  );
}
