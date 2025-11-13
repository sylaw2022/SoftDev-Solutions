import { NextRequest, NextResponse } from 'next/server';
import { serverDebugger } from '@/lib/serverDebugger';
import { userRepository, CreateUserData } from '@/lib/database';

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


    // Check if email already exists
    const existingUser = await userRepository.getUserByEmail(email);
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

    // Store registration in PostgreSQL database
    const newUser = await userRepository.createUser(userData);

    serverDebugger.info('User registration successful', {
      userId: newUser.id,
      email: newUser.email,
      company: newUser.company,
      totalRegistrations: await userRepository.getUserCount()
    }, debugContext);


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
      users = await userRepository.searchUsers(search);
    } else if (company) {
      users = await userRepository.getUsersByCompany(company);
    } else {
      users = await userRepository.getAllUsers(
        limit ? parseInt(limit) : undefined,
        offset ? parseInt(offset) : undefined
      );
    }
    
    const totalCount = await userRepository.getUserCount();
    
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

// DELETE endpoint to delete a user by ID
export async function DELETE(request: NextRequest) {
  const debugContext = serverDebugger.middleware(request);
  
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    serverDebugger.info('User deletion requested', { userId: userIdNum }, debugContext);
    
    const deleted = await userRepository.deleteUser(userIdNum);
    
    if (!deleted) {
      serverDebugger.warn('User deletion failed - user not found', { userId: userIdNum }, debugContext);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    serverDebugger.info('User deleted successfully', { userId: userIdNum }, debugContext);
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      userId: userIdNum
    });
  } catch (error) {
    serverDebugger.error('User deletion failed', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    }, debugContext);

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
