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

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    pool.on('error', (err: Error) => {
      console.error('[Database] Unexpected error on idle client', err);
    });

    // Initialize database schema with retry logic
    initializeDatabaseWithRetry().catch((err) => {
      console.error('[Database] Failed to initialize database after retries:', err);
    });
  }
  return pool;
}

// Initialize database schema with retry logic
async function initializeDatabaseWithRetry(maxRetries: number = 5, delayMs: number = 2000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await initializeDatabase();
      return; // Success, exit retry loop
    } catch (error) {
      const isConnectionError = error instanceof Error && 
        (error.message.includes('ECONNREFUSED') || 
         error.message.includes('connect') ||
         error.message.includes('timeout'));
      
      if (isConnectionError && attempt < maxRetries) {
        console.log(`[Database] Connection attempt ${attempt}/${maxRetries} failed, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      // If not a connection error or last attempt, throw
      throw error;
    }
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

  // Create a new user
  async createUser(userData: CreateUserData): Promise<User> {
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
