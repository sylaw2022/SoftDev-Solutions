import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database connection
let db: Database.Database | null = null;

// Get database connection
export function getDatabase(): Database.Database {
  if (!db) {
    // Get database path from environment variable or use default
    const dbPath = process.env.DATABASE_PATH || 
                   process.env.DATABASE_URL?.replace('sqlite://', '') ||
                   path.join(process.cwd(), 'data', 'users.db');

    // Ensure data directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Open database connection
    db = new Database(dbPath);
    
    // Enable foreign keys and WAL mode for better performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Initialize database schema
    initializeDatabase();
  }
  return db;
}

// Initialize database schema
function initializeDatabase(): void {
  const database = getDatabase();
  
  try {
    // Create users table
    database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        company TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT DEFAULT '',
        email_sent INTEGER DEFAULT 0,
        email_sent_at TEXT,
        email_message_id TEXT,
        admin_notification_sent INTEGER DEFAULT 0,
        admin_notification_sent_at TEXT,
        admin_notification_message_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on email for faster lookups
    database.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    // Create index on created_at for sorting
    database.exec(`
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
  email_sent: number; // SQLite uses INTEGER for boolean (0 or 1)
  email_sent_at: string | null;
  email_message_id: string | null;
  admin_notification_sent: number; // SQLite uses INTEGER for boolean (0 or 1)
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
  private database: Database.Database;

  constructor() {
    this.database = getDatabase();
  }

  // Create a new user
  async createUser(userData: CreateUserData): Promise<User> {
    const stmt = this.database.prepare(`
      INSERT INTO users (first_name, last_name, email, company, phone, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userData.firstName,
      userData.lastName,
      userData.email.toLowerCase().trim(),
      userData.company,
      userData.phone,
      userData.message || ''
    );

    const user = await this.getUserById(result.lastInsertRowid as number);
    if (!user) {
      throw new Error('Failed to retrieve created user');
    }
    return user;
  }

  // Get user by ID
  async getUserById(id: number): Promise<User | null> {
    const stmt = this.database.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as User | undefined;
    return row || null;
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const stmt = this.database.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email.toLowerCase().trim()) as User | undefined;
    return row || null;
  }

  // Get all users
  async getAllUsers(limit?: number, offset?: number): Promise<User[]> {
    let query = 'SELECT * FROM users ORDER BY created_at DESC';
    const params: (number | string)[] = [];

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    if (offset) {
      query += ' OFFSET ?';
      params.push(offset);
    }

    const stmt = this.database.prepare(query);
    const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
    return rows as User[];
  }

  // Update user
  async updateUser(id: number, userData: Partial<CreateUserData>): Promise<User | null> {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (userData.firstName) {
      fields.push('first_name = ?');
      values.push(userData.firstName);
    }
    if (userData.lastName) {
      fields.push('last_name = ?');
      values.push(userData.lastName);
    }
    if (userData.email) {
      fields.push('email = ?');
      values.push(userData.email.toLowerCase().trim());
    }
    if (userData.company) {
      fields.push('company = ?');
      values.push(userData.company);
    }
    if (userData.phone) {
      fields.push('phone = ?');
      values.push(userData.phone);
    }
    if (userData.message !== undefined) {
      fields.push('message = ?');
      values.push(userData.message);
    }

    if (fields.length === 0) {
      return this.getUserById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = this.database.prepare(`
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.getUserById(id);
  }

  // Delete user
  async deleteUser(id: number): Promise<boolean> {
    const stmt = this.database.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Get user count
  async getUserCount(): Promise<number> {
    const stmt = this.database.prepare('SELECT COUNT(*) as count FROM users');
    const row = stmt.get() as { count: number };
    return row.count;
  }

  // Search users
  async searchUsers(searchTerm: string): Promise<User[]> {
    const searchPattern = `%${searchTerm}%`;
    const stmt = this.database.prepare(`
      SELECT * FROM users 
      WHERE first_name LIKE ? 
         OR last_name LIKE ? 
         OR email LIKE ? 
         OR company LIKE ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(searchPattern, searchPattern, searchPattern, searchPattern);
    return rows as User[];
  }

  // Get users by company
  async getUsersByCompany(company: string): Promise<User[]> {
    const stmt = this.database.prepare('SELECT * FROM users WHERE company = ? ORDER BY created_at DESC');
    const rows = stmt.all(company);
    return rows as User[];
  }

  // Get recent users (last 30 days)
  async getRecentUsers(days: number = 30): Promise<User[]> {
    const stmt = this.database.prepare(`
      SELECT * FROM users 
      WHERE created_at >= datetime('now', '-' || ? || ' days')
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(days);
    return rows as User[];
  }
}

// Export singleton instance
export const userRepository = new UserRepository();

// Close database connection (for cleanup)
export async function closeDatabase(): Promise<void> {
  if (db) {
    db.close();
    db = null;
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
