# PostgreSQL Migration Guide

## Overview
This document describes the migration from SQLite to PostgreSQL for the SoftDev Solutions website.

## Changes Made

### 1. Dependencies
- **Removed**: `better-sqlite3` and `@types/better-sqlite3`
- **Added**: `pg` (PostgreSQL client) and `@types/pg`

### 2. Database Configuration (`src/lib/database.ts`)
- Replaced SQLite with PostgreSQL connection pool
- Converted all database operations to async/await
- Updated SQL syntax:
  - `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
  - `TEXT` → `VARCHAR(255)` or `TEXT`
  - `DATETIME` → `TIMESTAMP`
  - `?` placeholders → `$1, $2, ...` (PostgreSQL parameterized queries)
  - `datetime('now', '-X days')` → `NOW() - INTERVAL 'X days'`

### 3. Environment Variables
The application now uses the `DATABASE_URL` environment variable for PostgreSQL connection:
- Format: `postgresql://user:password@host:port/database`
- On Render.com, this is automatically provided when the PostgreSQL service is linked

### 4. Render.com Configuration (`render.yaml`)
- Added PostgreSQL service (`softdev-solutions-db`)
- Configured web service to use `DATABASE_URL` from the PostgreSQL service
- Both services use the free plan

### 5. Updated Files
- `src/lib/database.ts` - Complete rewrite for PostgreSQL
- `src/app/api/register/route.ts` - Updated to use async database operations
- `src/app/api/admin/database/route.ts` - Updated to use async database operations
- `src/lib/init.ts` - Updated to use async database health check
- `package.json` - Updated dependencies
- `render.yaml` - Added PostgreSQL service

## Database Schema

The PostgreSQL schema matches the original SQLite schema:

```sql
CREATE TABLE users (
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
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

## Connection Pooling

The application uses PostgreSQL connection pooling with the following settings:
- Maximum connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds
- SSL enabled in production (with `rejectUnauthorized: false` for Render.com)

## Local Development

For local development, you can either:

1. **Use a local PostgreSQL database:**
   ```bash
   # Set environment variable
   export DATABASE_URL="postgresql://user:password@localhost:5432/softdev_solutions"
   ```

2. **Use Render.com PostgreSQL service:**
   - The `DATABASE_URL` will be automatically provided when services are linked

## Deployment on Render.com

1. The `render.yaml` file automatically creates:
   - A PostgreSQL database service (`softdev-solutions-db`)
   - A web service (`softdev-solutions-website`) linked to the database

2. The database schema is automatically created on first connection via the `initializeDatabase()` function.

3. The `DATABASE_URL` environment variable is automatically set by Render.com when services are linked.

## Migration Notes

- All database operations are now asynchronous
- The database connection uses a connection pool for better performance
- The schema is automatically initialized on first connection
- No data migration script is needed as this is a fresh deployment

## Testing

After deployment, verify:
1. Database connection is successful (check logs)
2. User registration works (`/api/register`)
3. Database health check works (`/api/admin/database`)
4. All database operations function correctly

## Rollback

If you need to rollback to SQLite:
1. Revert `package.json` dependencies
2. Revert `src/lib/database.ts` to SQLite version
3. Update all async calls back to synchronous
4. Remove PostgreSQL service from `render.yaml`

