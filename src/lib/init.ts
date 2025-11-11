// Database initialization script
import { getDatabase, checkDatabaseHealth } from '@/lib/database';

// Initialize database on application startup
export function initializeApp() {
  try {
    console.log('[Init] Initializing application...');
    
    // Initialize database
    getDatabase();
    console.log('[Init] Database initialized successfully');
    
    // Check database health
    const health = checkDatabaseHealth();
    console.log('[Init] Database health check:', health);
    
    return true;
  } catch (error) {
    console.error('[Init] Failed to initialize application:', error);
    return false;
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeApp();
}
