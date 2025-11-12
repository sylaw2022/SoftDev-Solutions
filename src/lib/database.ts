import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'users.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database instance
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase(db);
  }
  return db;
}

// Initialize database schema
function initializeDatabase(database: Database.Database) {
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
      email_sent BOOLEAN DEFAULT FALSE,
      email_sent_at DATETIME,
      email_message_id TEXT,
      admin_notification_sent BOOLEAN DEFAULT FALSE,
      admin_notification_sent_at DATETIME,
      admin_notification_message_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  // Create a new user
  createUser(userData: CreateUserData): User {
    const stmt = this.db.prepare(`
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

    return this.getUserById(result.lastInsertRowid as number)!;
  }

  // Get user by ID
  getUserById(id: number): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | null;
  }

  // Get user by email
  getUserByEmail(email: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email.toLowerCase().trim()) as User | null;
  }

  // Get all users
  getAllUsers(limit?: number, offset?: number): User[] {
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

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as User[];
  }

  // Update user
  updateUser(id: number, userData: Partial<CreateUserData>): User | null {
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

    const stmt = this.db.prepare(`
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.getUserById(id);
  }

  // Delete user
  deleteUser(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Get user count
  getUserCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  // Search users
  searchUsers(searchTerm: string): User[] {
    const stmt = this.db.prepare(`
      SELECT * FROM users 
      WHERE first_name LIKE ? 
         OR last_name LIKE ? 
         OR email LIKE ? 
         OR company LIKE ?
      ORDER BY created_at DESC
    `);

    const searchPattern = `%${searchTerm}%`;
    return stmt.all(searchPattern, searchPattern, searchPattern, searchPattern) as User[];
  }

  // Get users by company
  getUsersByCompany(company: string): User[] {
    const stmt = this.db.prepare('SELECT * FROM users WHERE company = ? ORDER BY created_at DESC');
    return stmt.all(company) as User[];
  }

  // Get recent users (last 30 days)
  getRecentUsers(days: number = 30): User[] {
    const stmt = this.db.prepare(`
      SELECT * FROM users 
      WHERE created_at >= datetime('now', '-${days} days')
      ORDER BY created_at DESC
    `);
    return stmt.all() as User[];
  }

}

// Export singleton instance
export const userRepository = new UserRepository();

// Close database connection (for cleanup)
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Database health check
export function checkDatabaseHealth(): { status: string; message: string; userCount: number } {
  try {
    const count = userRepository.getUserCount();
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
