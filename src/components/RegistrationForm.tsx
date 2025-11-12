'use client';

import { useState, useEffect } from 'react';
import { useNotification } from './Notification';

interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}

interface RegistrationFormProps {
  onSuccess?: (data: UserRegistrationData) => void;
  onError?: (error: string) => void;
}

export default function RegistrationForm({ onSuccess, onError }: RegistrationFormProps) {
  const { addNotification, NotificationContainer } = useNotification();
  
  // Log when RegistrationForm is called/mounted
  console.log('[RegistrationForm] Component called/mounted');
  
  // Also log using the debug system if available
  interface WindowWithDebug extends Window {
    debugInfo?: (message: string, data?: Record<string, unknown>) => void;
    debugError?: (message: string, data?: Record<string, unknown>) => void;
  }
  
  if (typeof window !== 'undefined') {
    const win = window as WindowWithDebug;
    win.debugInfo?.('RegistrationForm component mounted', {
      timestamp: new Date().toISOString(),
      props: { hasOnSuccess: !!onSuccess, hasOnError: !!onError }
    });
  }
  
  const [formData, setFormData] = useState<UserRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<UserRegistrationData>>({});

  // Log component mount and unmount
  useEffect(() => {
    console.log('[RegistrationForm] useEffect: Component mounted');
    
    if (typeof window !== 'undefined') {
      const win = window as WindowWithDebug;
      win.debugInfo?.('RegistrationForm useEffect: Component mounted', {
        timestamp: new Date().toISOString(),
        formData: formData
      });
    }

    return () => {
      console.log('[RegistrationForm] useEffect: Component unmounting');
      if (typeof window !== 'undefined') {
        const win = window as WindowWithDebug;
        win.debugInfo?.('RegistrationForm useEffect: Component unmounting');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserRegistrationData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof UserRegistrationData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[RegistrationForm] Form submission started', { formData });
    
    if (typeof window !== 'undefined') {
      const win = window as WindowWithDebug;
      win.debugInfo?.('RegistrationForm: Form submission started', { 
        formData,
        timestamp: new Date().toISOString()
      });
    }

    if (!validateForm()) {
      console.log('[RegistrationForm] Form validation failed');
      return;
    }

    console.log('[RegistrationForm] Form validation passed, submitting...');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Reset form on success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        phone: '',
        message: ''
      });

      onSuccess?.(formData);
      
      // Show success notification
      addNotification('success', 'Registration successful! We will contact you within 24 hours.');
      
      // Debug logging
      if (typeof window !== 'undefined') {
        const win = window as WindowWithDebug;
        win.debugInfo?.('User registration successful', { email: formData.email });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      onError?.(errorMessage);
      
      // Show error notification
      addNotification('error', errorMessage);
      
      // Debug logging
      if (typeof window !== 'undefined') {
        const win = window as WindowWithDebug;
        win.debugError?.('User registration failed', { error: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-rose-50 rounded-2xl shadow-3d-lg p-8 max-w-2xl mx-auto border-2 border-rose-200/50 card-3d">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Get Started Today
        </h2>
        <p className="text-gray-600">
          Register to receive a free consultation and project quote
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.company ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your company name"
          />
          {errors.company && (
            <p className="mt-1 text-sm text-red-600">{errors.company}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your phone number"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Project Description
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            placeholder="Tell us about your project requirements..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </div>
          ) : (
            'Register for Free Consultation'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          By registering, you agree to our{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </a>
        </p>
      </div>

      {/* Notification Container */}
      <NotificationContainer />
    </div>
  );
}
