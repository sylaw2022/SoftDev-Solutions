import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegistrationForm from '../RegistrationForm';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock Notification hook
jest.mock('../Notification', () => ({
  useNotification: () => ({
    addNotification: jest.fn(),
    NotificationContainer: () => null,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('RegistrationForm Component', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the form with all fields', () => {
    render(<RegistrationForm />);
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project description/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);
    
    const submitButton = screen.getByRole('button', { name: /register for free consultation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);
    
    // Fill in all required fields first
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/company name/i), 'Test Company');
    await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
    
    // Enter invalid email - clear field first, then type
    const emailInput = screen.getByLabelText(/email address/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    
    // Verify email is in the field
    expect(emailInput).toHaveValue('invalid-email');
    
    // Submit the form - this should trigger validation
    const submitButton = screen.getByRole('button', { name: /register for free consultation/i });
    
    // Submit the form
    await act(async () => {
      await user.click(submitButton);
    });

    // Wait for validation error to appear
    // The validation runs synchronously and sets errors.email
    // We need to wait for React to re-render
    // Give React time to process the state update from setErrors
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    await waitFor(() => {
      // Check for error message or error border class
      const errorMessage = screen.queryByText(/please enter a valid email address/i);
      const emailField = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const hasErrorClass = emailField.className.includes('border-red-500');
      
      // Either the error message or the error border should be present
      if (!errorMessage && !hasErrorClass) {
        // Debug output
        screen.debug();
        throw new Error('Email validation error not found');
      }
      expect(errorMessage || hasErrorClass).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      success: true,
      message: 'Registration successful!',
      user: { id: 1, email: 'test@example.com' },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<RegistrationForm />);
    
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/company name/i), 'Test Company');
    await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
    
    const submitButton = screen.getByRole('button', { name: /register for free consultation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          company: 'Test Company',
          phone: '+1234567890',
          message: '',
        }),
      });
    });
  });
});

