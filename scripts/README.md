# Database Scripts

This directory contains utility scripts for interacting with the PostgreSQL database.

## read-users.js

Read user information from the local PostgreSQL database.

### Usage

```bash
# Show all users (default)
npm run db:read
# or
node scripts/read-users.js

# Show recent users (last 30 days)
npm run db:read:recent
# or
node scripts/read-users.js --recent

# Show recent users (last 7 days)
node scripts/read-users.js --recent 7

# Search users by name, email, or company
node scripts/read-users.js --search "john"

# Filter by company
node scripts/read-users.js --company "Test Company"

# Limit results
node scripts/read-users.js --limit 10

# Output as JSON
npm run db:read:json
# or
node scripts/read-users.js --format json

# Combine options
node scripts/read-users.js --recent 7 --limit 5 --format json
```

### Options

- `--all` - Show all users (default)
- `--recent [N]` - Show users from last N days (default: 30)
- `--search TERM` - Search users by name, email, or company
- `--company NAME` - Filter by company name
- `--limit N` - Limit number of results
- `--format json` - Output as JSON instead of table

### Examples

```bash
# Get all users
node scripts/read-users.js

# Get last 10 users from past week
node scripts/read-users.js --recent 7 --limit 10

# Search for users with "test" in name/email/company
node scripts/read-users.js --search "test"

# Get users from specific company
node scripts/read-users.js --company "E2E Test Company"

# Export as JSON for processing
node scripts/read-users.js --format json > users.json
```

### Database Connection

The script uses the following connection string (in order of priority):
1. `DATABASE_URL` environment variable
2. `POSTGRES_URL` environment variable
3. Default: `postgresql://postgres:Sylaw1970@localhost:5433/postgres`

To use a different database, set the environment variable:
```bash
DATABASE_URL="postgresql://user:password@host:port/database" node scripts/read-users.js
```

