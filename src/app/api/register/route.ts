import { NextRequest, NextResponse } from 'next/server';
import { serverDebugger } from '@/lib/serverDebugger';
import { userRepository, CreateUserData } from '@/lib/database';
import { emailService, EmailData } from '@/lib/emailService';

interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  const debugContext = serverDebugger.middleware(request);
  
  try {
    serverDebugger.info('User registration request received', {}, debugContext);
    
    const body = await request.json();
    const { firstName, lastName, email, company, phone, message }: UserRegistrationData = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !company || !phone) {
      serverDebugger.warn('Registration validation failed - missing required fields', { body }, debugContext);
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      serverDebugger.warn('Registration validation failed - invalid email format', { email }, debugContext);
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = userRepository.getUserByEmail(email);
    if (existingUser) {
      serverDebugger.warn('Registration failed - email already exists', { email }, debugContext);
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create user registration data
    const userData: CreateUserData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      company: company.trim(),
      phone: phone.trim(),
      message: message?.trim() || ''
    };

    // Store registration in SQLite database
    const newUser = userRepository.createUser(userData);

    serverDebugger.info('User registration successful', {
      userId: newUser.id,
      email: newUser.email,
      company: newUser.company,
      totalRegistrations: userRepository.getUserCount()
    }, debugContext);

    // Send welcome email to user
    const emailData: EmailData = {
      to: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      company: newUser.company
    };

    try {
      console.log('[RegisterAPI] Sending welcome email to:', newUser.email);
      const emailResult = await emailService.sendWelcomeEmail(emailData);
      
      if (emailResult.success && emailResult.messageId) {
        userRepository.updateEmailSentStatus(newUser.id, emailResult.messageId);
        serverDebugger.info('Welcome email sent successfully', {
          userId: newUser.id,
          messageId: emailResult.messageId
        }, debugContext);
      } else {
        serverDebugger.warn('Failed to send welcome email', {
          userId: newUser.id,
          error: emailResult.error
        }, debugContext);
      }
    } catch (emailError) {
      serverDebugger.error('Email sending failed', {
        userId: newUser.id,
        error: emailError instanceof Error ? emailError.message : emailError
      }, debugContext);
    }

    // Send admin notification
    try {
      console.log('[RegisterAPI] Sending admin notification');
      const adminResult = await emailService.sendAdminNotification(emailData);
      
      if (adminResult.success && adminResult.messageId) {
        userRepository.updateAdminNotificationSentStatus(newUser.id, adminResult.messageId);
        serverDebugger.info('Admin notification sent successfully', {
          userId: newUser.id,
          messageId: adminResult.messageId
        }, debugContext);
      } else {
        serverDebugger.warn('Failed to send admin notification', {
          userId: newUser.id,
          error: adminResult.error
        }, debugContext);
      }
    } catch (adminError) {
      serverDebugger.error('Admin notification failed', {
        userId: newUser.id,
        error: adminError instanceof Error ? adminError.message : adminError
      }, debugContext);
    }

    // In production, you might:
    // 1. Send welcome email
    // 2. Create user account in database
    // 3. Send notification to admin
    // 4. Add to CRM system

    return NextResponse.json({
      success: true,
      message: 'Registration successful! We will contact you within 24 hours.',
      user: {
        id: newUser.id,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        company: newUser.company,
        createdAt: newUser.created_at
      }
    });

  } catch (error) {
    serverDebugger.error('Registration request failed', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    }, debugContext);

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve registrations (for admin purposes)
export async function GET(request: NextRequest) {
  const debugContext = serverDebugger.middleware(request);
  
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');
    const search = url.searchParams.get('search');
    const company = url.searchParams.get('company');

    serverDebugger.info('Registration list requested', { limit, offset, search, company }, debugContext);
    
    let users;
    
    if (search) {
      users = userRepository.searchUsers(search);
    } else if (company) {
      users = userRepository.getUsersByCompany(company);
    } else {
      users = userRepository.getAllUsers(
        limit ? parseInt(limit) : undefined,
        offset ? parseInt(offset) : undefined
      );
    }
    
    const totalCount = userRepository.getUserCount();
    
    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        company: user.company,
        phone: user.phone,
        message: user.message,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      })),
      total: totalCount,
      returned: users.length
    });
  } catch (error) {
    serverDebugger.error('Failed to retrieve registrations', {
      error: error instanceof Error ? error.message : error
    }, debugContext);

    return NextResponse.json(
      { error: 'Failed to retrieve registrations' },
      { status: 500 }
    );
  }
}
