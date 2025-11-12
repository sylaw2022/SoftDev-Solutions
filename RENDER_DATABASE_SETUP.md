# Render.com PostgreSQL Database Setup

## Overview

Render.com provides a **managed PostgreSQL service** (not a container). The database is fully managed by Render.com, including backups, updates, and maintenance.

## Current Configuration

The `render.yaml` file includes:

1. **Web Service** (`softdev-solutions-website`)
   - Next.js application
   - Automatically linked to PostgreSQL database
   - `DATABASE_URL` is automatically set from the database service

2. **PostgreSQL Service** (`softdev-solutions-db`)
   - Managed PostgreSQL 15+ instance
   - Free plan (suitable for development/testing)
   - Located in Singapore region
   - SSL/TLS enabled by default

## Database Initialization

### Automatic Schema Creation

The database schema is automatically created when the application first connects:

1. **On Application Startup**: The `getDatabase()` function in `src/lib/database.ts` initializes the connection pool
2. **On First API Call**: When any database operation is performed, `ensureInitialized()` is called
3. **Schema Creation**: The `initializeDatabase()` function creates:
   - `users` table with all required columns
   - Indexes on `email` and `created_at` columns
   - All constraints and defaults

### Retry Logic

The application includes robust retry logic to handle:
- Database connection timing (Render.com database may take a few seconds to be ready)
- Network delays during deployment
- Connection pool initialization

**Key Features:**
- Up to 5 retry attempts with 2-second delays
- Non-blocking initialization (won't block server startup)
- Automatic SSL detection for Render.com connections
- 3-second delay specifically for Render.com deployments

## Verification After Deployment

### 1. Check Database Health

```bash
curl https://your-app.onrender.com/api/admin/database
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Database connection successful",
  "userCount": 0,
  "timestamp": "2025-11-12T..."
}
```

### 2. Test User Registration

```bash
curl -X POST https://your-app.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "company": "Test Company",
    "phone": "+1234567890"
  }'
```

### 3. Verify Database Schema

The database schema is automatically created. You can verify by checking the health endpoint or attempting a user registration.

## Database Connection Details

### Connection String Format

Render.com automatically provides the connection string in this format:
```
postgresql://username:password@hostname:port/database_name
```

The connection string includes:
- SSL/TLS encryption (required for Render.com)
- Automatic connection pooling
- Internal network optimization (same region)

### Environment Variables

- `DATABASE_URL` - Automatically set by Render.com when services are linked
- `NODE_ENV=production` - Ensures production database settings

## Troubleshooting

### Database Not Ready

If you see connection errors immediately after deployment:

1. **Wait 30-60 seconds** - Render.com databases can take time to fully initialize
2. **Check health endpoint** - The application will retry automatically
3. **Review logs** - Check Render.com dashboard for database service logs

### Connection Errors

Common errors and solutions:

- **`ECONNREFUSED`**: Database is still initializing (wait and retry)
- **`AggregateError`**: Multiple connection attempts failed (application will retry)
- **`SSL required`**: Already handled automatically by the application

### Schema Not Created

If the schema doesn't exist:

1. Make an API call to `/api/register` (POST or GET)
2. The schema will be created automatically on first database operation
3. Check application logs for initialization messages

## Render.com Dashboard

You can monitor the database in the Render.com dashboard:

1. Navigate to your PostgreSQL service (`softdev-solutions-db`)
2. View connection details, logs, and metrics
3. Access database directly via Render.com's database browser (if available)

## Backup and Maintenance

Render.com automatically handles:
- **Daily backups** (on paid plans)
- **Database updates** and security patches
- **Monitoring** and health checks
- **Scaling** (upgrade plan for more resources)

## Migration from Local/Development

When deploying to Render.com:

1. **No manual migration needed** - Schema is created automatically
2. **Data migration** - If you have existing data, use `pg_dump` and `psql`:
   ```bash
   # Export from local database
   pg_dump postgresql://testuser:testpass@localhost:5432/softdev_solutions > backup.sql
   
   # Import to Render.com (use connection string from Render dashboard)
   psql $DATABASE_URL < backup.sql
   ```

## Best Practices

1. **Never commit connection strings** - Render.com provides them automatically
2. **Use environment variables** - Always use `DATABASE_URL` from Render.com
3. **Monitor health endpoint** - Regularly check `/api/admin/database`
4. **Test after deployment** - Verify database operations work correctly
5. **Review logs** - Check Render.com logs for any database-related issues

## Free Plan Limitations

The free plan includes:
- Limited database size
- Limited connections
- No automatic backups (manual backups available)
- May spin down after inactivity

For production use, consider upgrading to a paid plan for:
- Guaranteed uptime
- Automatic backups
- More resources
- Better performance

