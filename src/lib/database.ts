import { Pool, QueryResult } from 'pg';

// Database connection pool
let pool: Pool | null = null;

// Get database connection pool
export function getDatabase(): Pool {
  if (!pool) {
    // Get connection string from environment variable
    // Format: postgresql://user:password@host:port/database
    // For Render.com, this will be provided via DATABASE_URL
    const connectionString = process.env.DATABASE_URL || 
      process.env.POSTGRES_URL ||
      'postgresql://localhost:5432/softdev_solutions';

    // Determine SSL requirement based on connection string (Render.com requires SSL)
    const requiresSSL = connectionString.includes('render.com') || 
                        connectionString.includes('amazonaws.com') ||
                        process.env.NODE_ENV === 'production';
    
    pool = new Pool({
      connectionString,
      ssl: requiresSSL ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased to 10 seconds to allow PostgreSQL to be ready
      // Reduce initial connection attempts to prevent AggregateError
      min: 0, // Don't create connections until needed
    });

    // Handle pool errors
    pool.on('error', (err: Error) => {
      console.error('[Database] Unexpected error on idle client', err);
    });

    // Initialize database schema with retry logic (non-blocking)
    // Don't block server startup if database isn't ready yet
    // Schema will be initialized on first actual database operation if needed
    // For Render.com, add a longer delay to allow database to be ready
    const isRenderCom = connectionString.includes('render.com');
    const initDelay = isRenderCom ? 5000 : 1000; // 5 second delay for Render.com, 1s for others
    
    setTimeout(() => {
      initializeDatabaseWithRetry().catch((err) => {
        // Handle AggregateError specifically for better error messages
        let errorMsg = '';
        if (err instanceof AggregateError) {
          errorMsg = err.errors?.map((e: Error) => e.message).join('; ') || err.message;
          console.warn('[Database] Database initialization deferred (AggregateError):', errorMsg.substring(0, 200));
          // Log individual errors for debugging
          if (err.errors && err.errors.length > 0) {
            err.errors.forEach((e: Error, index: number) => {
              console.warn(`[Database] Error ${index + 1}: ${e.message.substring(0, 100)}`);
            });
          }
        } else if (err instanceof Error) {
          errorMsg = err.message;
          console.warn('[Database] Database initialization deferred (will retry on first use):', errorMsg.substring(0, 200));
        } else {
          console.warn('[Database] Database initialization deferred:', String(err).substring(0, 200));
        }
        // Don't throw - allow server to start even if database isn't ready
        // The retry logic will handle it when database operations are actually needed
      });
    }, initDelay);
  }
  return pool;
}

// Track if database is initialized
let dbInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Initialize database schema with retry logic
async function initializeDatabaseWithRetry(maxRetries: number = 10, initialDelayMs: number = 2000): Promise<void> {
  // If already initialized, return immediately
  if (dbInitialized) {
    return;
  }
  
  // If initialization is in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }
  
  // Check if this is Render.com (needs more retries and longer delays)
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
  const isRenderCom = connectionString.includes('render.com');
  const finalMaxRetries = isRenderCom ? 15 : maxRetries; // More retries for Render.com
  const baseDelay = isRenderCom ? 3000 : initialDelayMs; // Longer base delay for Render.com
  
  // Start initialization
  initializationPromise = (async () => {
    for (let attempt = 1; attempt <= finalMaxRetries; attempt++) {
      try {
        // First, test the connection with a simple query
        await testDatabaseConnection();
        
        // If connection test passes, initialize schema
        await initializeDatabase();
        dbInitialized = true;
        initializationPromise = null;
        console.log(`[Database] Database initialized successfully after ${attempt} attempt(s)`);
        return; // Success, exit retry loop
      } catch (error) {
        // Handle AggregateError (common on Render.com when multiple connections fail)
        let errorMessage = '';
        let isConnectionError = false;
        
        if (error instanceof AggregateError) {
          // Extract error messages from AggregateError
          errorMessage = error.errors?.map((e: Error) => e.message).join('; ') || error.message;
          
          // Check if any of the errors are connection-related
          isConnectionError = error.errors?.some((e: Error) => 
            e.message.includes('ECONNREFUSED') ||
            e.message.includes('connect') ||
            e.message.includes('timeout') ||
            e.message.includes('Connection terminated') ||
            e.message.includes('ENOTFOUND') ||
            e.message.includes('ETIMEDOUT') ||
            e.message.includes('getaddrinfo') ||
            e.message.includes('socket hang up')
          ) || false;
        } else if (error instanceof Error) {
          errorMessage = error.message;
          isConnectionError = 
            errorMessage.includes('ECONNREFUSED') || 
            errorMessage.includes('connect') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('Connection terminated') ||
            errorMessage.includes('ENOTFOUND') ||
            errorMessage.includes('ETIMEDOUT') ||
            errorMessage.includes('SSL') ||
            errorMessage.includes('certificate') ||
            errorMessage.includes('getaddrinfo') ||
            errorMessage.includes('socket hang up');
        } else {
          errorMessage = String(error);
        }
        
        if (isConnectionError && attempt < finalMaxRetries) {
          // Exponential backoff with jitter
          const exponentialDelay = baseDelay * Math.pow(1.5, attempt - 1);
          const jitter = Math.random() * 1000; // Add random jitter (0-1s)
          const delayMs = Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
          
          console.log(`[Database] Connection attempt ${attempt}/${finalMaxRetries} failed: ${errorMessage.substring(0, 150)}`);
          console.log(`[Database] Retrying in ${Math.round(delayMs)}ms...`);
          
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        // If not a connection error or last attempt, throw
        initializationPromise = null;
        
        // Log full error details for debugging
        if (error instanceof AggregateError) {
          console.error('[Database] AggregateError details:', {
            message: error.message,
            errors: error.errors?.map((e: Error) => ({
              message: e.message,
              name: e.name,
              stack: e.stack?.split('\n').slice(0, 3).join('\n')
            }))
          });
        } else {
          console.error('[Database] Initialization failed after all retries:', errorMessage);
        }
        
        throw error;
      }
    }
  })();
  
  return initializationPromise;
}

// Test database connection with a simple query
async function testDatabaseConnection(): Promise<void> {
  const db = getDatabase();
  
  try {
    // Test connection with a simple query
    const result = await db.query('SELECT 1 as test');
    if (result.rows[0]?.test !== 1) {
      throw new Error('Database connection test failed: unexpected result');
    }
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Database connection test failed: ${error.message}`);
    }
    throw error;
  }
}

// Initialize database schema
async function initializeDatabase(): Promise<void> {
  const db = getDatabase();
  
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        company VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        message TEXT DEFAULT '',
        email_sent BOOLEAN DEFAULT FALSE,
        email_sent_at TIMESTAMP,
        email_message_id VARCHAR(255),
        admin_notification_sent BOOLEAN DEFAULT FALSE,
        admin_notification_sent_at TIMESTAMP,
        admin_notification_message_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on email for faster lookups
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    // Create index on created_at for sorting
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)
    `);

    console.log('[Database] Database initialized successfully');
  } catch (error) {
    console.error('[Database] Error initializing database:', error);
    throw error;
  }
}

// User interface
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  email_sent: boolean;
  email_sent_at: string | null;
  email_message_id: string | null;
  admin_notification_sent: boolean;
  admin_notification_sent_at: string | null;
  admin_notification_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  message?: string;
}

// Database operations
export class UserRepository {
  private db: Pool;

  constructor() {
    this.db = getDatabase();
  }
  
  // Ensure database is initialized before operations
  private async ensureInitialized(): Promise<void> {
    try {
      await initializeDatabaseWithRetry();
    } catch (error) {
      // Handle AggregateError specifically
      if (error instanceof AggregateError) {
        const errorMessages = error.errors?.map((e: Error) => e.message).join('; ') || error.message;
        console.warn('[UserRepository] Database initialization check failed (AggregateError):', errorMessages.substring(0, 200));
      } else if (error instanceof Error) {
        console.warn('[UserRepository] Database initialization check failed:', error.message.substring(0, 200));
      } else {
        console.warn('[UserRepository] Database initialization check failed:', String(error).substring(0, 200));
      }
      // If initialization fails, log but don't block
      // The actual query will fail with a clearer error
    }
  }

  // Create a new user
  async createUser(userData: CreateUserData): Promise<User> {
    await this.ensureInitialized();
    const result = await this.db.query<User>(
      `INSERT INTO users (first_name, last_name, email, company, phone, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userData.firstName,
        userData.lastName,
        userData.email.toLowerCase().trim(),
        userData.company,
        userData.phone,
        userData.message || ''
      ]
    );

    return result.rows[0];
  }

  // Get user by ID
  async getUserById(id: number): Promise<User | null> {
    const result = await this.db.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  }

  // Get all users
  async getAllUsers(limit?: number, offset?: number): Promise<User[]> {
    let query = 'SELECT * FROM users ORDER BY created_at DESC';
    const params: number[] = [];
    let paramIndex = 1;

    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(limit);
      paramIndex++;
    }

    if (offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(offset);
    }

    const result = await this.db.query<User>(query, params);
    return result.rows;
  }

  // Update user
  async updateUser(id: number, userData: Partial<CreateUserData>): Promise<User | null> {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (userData.firstName) {
      fields.push(`first_name = $${paramIndex}`);
      values.push(userData.firstName);
      paramIndex++;
    }
    if (userData.lastName) {
      fields.push(`last_name = $${paramIndex}`);
      values.push(userData.lastName);
      paramIndex++;
    }
    if (userData.email) {
      fields.push(`email = $${paramIndex}`);
      values.push(userData.email.toLowerCase().trim());
      paramIndex++;
    }
    if (userData.company) {
      fields.push(`company = $${paramIndex}`);
      values.push(userData.company);
      paramIndex++;
    }
    if (userData.phone) {
      fields.push(`phone = $${paramIndex}`);
      values.push(userData.phone);
      paramIndex++;
    }
    if (userData.message !== undefined) {
      fields.push(`message = $${paramIndex}`);
      values.push(userData.message);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getUserById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query<User>(query, values);
    return result.rows[0] || null;
  }

  // Delete user
  async deleteUser(id: number): Promise<boolean> {
    const result = await this.db.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  // Get user count
  async getUserCount(): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM users'
    );
    return parseInt(result.rows[0].count, 10);
  }

  // Search users
  async searchUsers(searchTerm: string): Promise<User[]> {
    const searchPattern = `%${searchTerm}%`;
    const result = await this.db.query<User>(
      `SELECT * FROM users 
       WHERE first_name LIKE $1 
          OR last_name LIKE $1 
          OR email LIKE $1 
          OR company LIKE $1
       ORDER BY created_at DESC`,
      [searchPattern]
    );
    return result.rows;
  }

  // Get users by company
  async getUsersByCompany(company: string): Promise<User[]> {
    const result = await this.db.query<User>(
      'SELECT * FROM users WHERE company = $1 ORDER BY created_at DESC',
      [company]
    );
    return result.rows;
  }

  // Get recent users (last 30 days)
  async getRecentUsers(days: number = 30): Promise<User[]> {
    const result = await this.db.query<User>(
      `SELECT * FROM users 
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       ORDER BY created_at DESC`
    );
    return result.rows;
  }
}

// Export singleton instance
export const userRepository = new UserRepository();

// Close database connection (for cleanup)
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<{ status: string; message: string; userCount: number }> {
  try {
    const count = await userRepository.getUserCount();
    return {
      status: 'healthy',
      message: 'Database connection successful',
      userCount: count
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      userCount: 0
    };
  }
}
