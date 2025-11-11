import { NextRequest, NextResponse } from 'next/server';
import { serverDebugger } from '@/lib/serverDebugger';
import { userRepository, checkDatabaseHealth } from '@/lib/database';

// Database health check endpoint
export async function GET() {
  try {
    serverDebugger.info('Database health check requested');
    
    const health = checkDatabaseHealth();
    
    return NextResponse.json({
      ...health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    serverDebugger.error('Database health check failed', {
      error: error instanceof Error ? error.message : error
    });

    return NextResponse.json(
      { 
        status: 'error',
        message: 'Database health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Database statistics endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    serverDebugger.info('Database admin action requested', { action });

    switch (action) {
      case 'stats':
        const totalUsers = userRepository.getUserCount();
        const recentUsers = userRepository.getRecentUsers(30);
        
        return NextResponse.json({
          totalUsers,
          recentUsers: recentUsers.length,
          stats: {
            total: totalUsers,
            last30Days: recentUsers.length,
            averagePerDay: Math.round(recentUsers.length / 30 * 100) / 100
          }
        });

      case 'recent':
        const days = body.days || 30;
        const recent = userRepository.getRecentUsers(days);
        
        return NextResponse.json({
          users: recent.map(user => ({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            company: user.company,
            createdAt: user.created_at
          })),
          count: recent.length,
          days
        });

      case 'search':
        const searchTerm = body.searchTerm;
        if (!searchTerm) {
          return NextResponse.json(
            { error: 'Search term is required' },
            { status: 400 }
          );
        }
        
        const searchResults = userRepository.searchUsers(searchTerm);
        
        return NextResponse.json({
          users: searchResults.map(user => ({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            company: user.company,
            createdAt: user.created_at
          })),
          count: searchResults.length,
          searchTerm
        });

      case 'companies':
        const allUsers = userRepository.getAllUsers();
        const companies = [...new Set(allUsers.map(user => user.company))];
        
        return NextResponse.json({
          companies: companies.map(company => ({
            name: company,
            count: userRepository.getUsersByCompany(company).length
          })),
          totalCompanies: companies.length
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    serverDebugger.error('Database admin action failed', {
      error: error instanceof Error ? error.message : error
    });

    return NextResponse.json(
      { error: 'Database admin action failed' },
      { status: 500 }
    );
  }
}










