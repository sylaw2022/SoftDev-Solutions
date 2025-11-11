'use client';

import { useState } from 'react';
import { useNotification } from '@/components/Notification';

export default function EmailTestButton() {
  const { addNotification, NotificationContainer } = useNotification();
  const [isTesting, setIsTesting] = useState(false);

  const testEmailFunction = async () => {
    setIsTesting(true);
    
    try {
      console.log('[EmailTestButton] Starting email test');
      
      // Test email service status first
      const statusResponse = await fetch('/api/email/test');
      const statusData = await statusResponse.json();
      
      if (statusData.status !== 'healthy') {
        addNotification('error', `Email service is not available: ${statusData.message}`);
        return;
      }

      // Send test email
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
      
      if (result.success) {
        addNotification('success', 'Test email sent successfully! Check console for preview URL.');
        console.log('[EmailTestButton] Test email sent successfully:', result);
      } else {
        addNotification('error', `Failed to send test email: ${result.error}`);
        console.error('[EmailTestButton] Test email failed:', result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addNotification('error', `Email test failed: ${errorMessage}`);
      console.error('[EmailTestButton] Email test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <>
      <button
        onClick={testEmailFunction}
        disabled={isTesting}
        className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors ${
          isTesting
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isTesting ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Testing Email...
          </div>
        ) : (
          '📧 Test Email Function'
        )}
      </button>
      
      <NotificationContainer />
    </>
  );
}








