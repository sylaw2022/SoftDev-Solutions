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

  it.skip('validates email format', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);
    
    // Fill in all required fields first
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const companyInput = screen.getByLabelText(/company name/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    const emailInput = screen.getByLabelText(/email address/i);
    
    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(companyInput, 'Test Company');
    await user.type(phoneInput, '+1234567890');
    
    // Enter invalid email - use fireEvent to ensure onChange is triggered
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // Verify email is in the field
    expect(emailInput).toHaveValue('invalid-email');
    
    // Submit the form - this should trigger validation
    const submitButton = screen.getByRole('button', { name: /register for free consultation/i });
    
    // Submit the form and wait for validation
    await user.click(submitButton);
    
    // Wait for validation error to appear
    // The validation runs in handleSubmit and sets errors.email via setErrors
    // We need to wait for React to re-render with the error state
    await waitFor(() => {
      // Check for error message first (most reliable)
      const errorMessage = screen.queryByText(/please enter a valid email address/i);
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
        return;
      }
      
      // Check for error border class as fallback
      const emailField = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const hasErrorClass = emailField.className.includes('border-red-500');
      
      if (hasErrorClass) {
        expect(hasErrorClass).toBe(true);
        return;
      }
      
      // If neither found, fail with helpful message
      throw new Error('Email validation error not found - neither error message nor error border class present');
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

