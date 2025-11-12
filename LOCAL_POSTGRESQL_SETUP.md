# Local PostgreSQL Setup and Testing Guide

## Quick Setup Options

### Option 1: Using Docker (Recommended - Easiest)

If Docker is available, this is the quickest way to test PostgreSQL locally.

#### Start PostgreSQL Container

```bash
# Start PostgreSQL container
docker run -d \
  --name postgres-local-test \
  -e POSTGRES_USER=testuser \
  -e POSTGRES_PASSWORD=testpass \
  -e POSTGRES_DB=softdev_solutions \
  -p 5432:5432 \
  postgres:15-alpine

# Wait for PostgreSQL to be ready
sleep 5

# Test connection
docker exec postgres-local-test psql -U testuser -d softdev_solutions -c "SELECT version();"
```

#### Set Environment Variable

```bash
export DATABASE_URL="postgresql://testuser:testpass@localhost:5432/softdev_solutions"
```

#### Test the Application

```bash
# Start the Next.js server
npm run dev

# In another terminal, test the database
curl http://localhost:3000/api/admin/database
```

#### Stop Container When Done

```bash
docker stop postgres-local-test
docker rm postgres-local-test
```

### Option 2: Install PostgreSQL Locally

#### Ubuntu/Debian

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE USER testuser WITH PASSWORD 'testpass';
CREATE DATABASE softdev_solutions OWNER testuser;
GRANT ALL PRIVILEGES ON DATABASE softdev_solutions TO testuser;
\q
EOF
```

#### Set Environment Variable

```bash
export DATABASE_URL="postgresql://testuser:testpass@localhost:5432/softdev_solutions"
```

## Testing the Database Connection

### 1. Test Connection Directly

```bash
# Using Docker
docker exec postgres-local-test psql -U testuser -d softdev_solutions -c "SELECT 1;"

# Using local PostgreSQL
psql -U testuser -d softdev_solutions -h localhost -c "SELECT 1;"
```

### 2. Test via Application

```bash
# Start the application
npm run dev

# Test database health endpoint
curl http://localhost:3000/api/admin/database

# Expected response:
# {
#   "status": "healthy",
#   "message": "Database connection successful",
#   "userCount": 0
# }
```

### 3. Test User Registration

```bash
# Register a test user
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "company": "Test Company",
    "phone": "+1234567890",
    "message": "Test registration"
  }'

# Verify user was created
curl http://localhost:3000/api/register?search=test@example.com
```

### 4. Test Database Operations

```bash
# Get all users
curl http://localhost:3000/api/register

# Get database stats
curl -X POST http://localhost:3000/api/admin/database \
  -H "Content-Type: application/json" \
  -d '{"action": "stats"}'

# Search users
curl -X POST http://localhost:3000/api/admin/database \
  -H "Content-Type: application/json" \
  -d '{"action": "search", "searchTerm": "test"}'
```

## Verification Checklist

- [ ] PostgreSQL is running
- [ ] Database connection works
- [ ] Application can connect to database
- [ ] Database schema is created (users table exists)
- [ ] User registration works
- [ ] User retrieval works
- [ ] User deletion works

## Troubleshooting

### Connection Refused

```bash
# Check if PostgreSQL is running
docker ps | grep postgres  # For Docker
sudo systemctl status postgresql  # For local install

# Check port 5432
sudo lsof -i :5432
```

### Authentication Failed

```bash
# Verify credentials
# Check DATABASE_URL environment variable
echo $DATABASE_URL

# Test connection with credentials
psql postgresql://testuser:testpass@localhost:5432/softdev_solutions
```

### Database Not Found

```bash
# Create database if missing
docker exec postgres-local-test psql -U testuser -c "CREATE DATABASE softdev_solutions;"
```

## Quick Test Script

Save this as `test-db.sh`:

```bash
#!/bin/bash
set -e

echo "=== Testing PostgreSQL Database ==="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set"
    echo "Set it with: export DATABASE_URL='postgresql://testuser:testpass@localhost:5432/softdev_solutions'"
    exit 1
fi

echo "DATABASE_URL: $DATABASE_URL"

# Test connection
echo "1. Testing database connection..."
if echo "$DATABASE_URL" | grep -q "docker"; then
    docker exec postgres-local-test psql -U testuser -d softdev_solutions -c "SELECT 1;" > /dev/null
else
    psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null
fi
echo "✓ Connection successful"

# Test application
echo "2. Testing application database endpoint..."
HEALTH=$(curl -s http://localhost:3000/api/admin/database)
if echo "$HEALTH" | grep -q "healthy"; then
    echo "✓ Application database connection successful"
else
    echo "✗ Application database connection failed"
    echo "$HEALTH"
    exit 1
fi

# Test user creation
echo "3. Testing user registration..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test-'$(date +%s)'@example.com",
    "company": "Test Company",
    "phone": "+1234567890"
  }')

if echo "$RESPONSE" | grep -q "success"; then
    echo "✓ User registration successful"
else
    echo "✗ User registration failed"
    echo "$RESPONSE"
    exit 1
fi

echo "=== All tests passed! ==="
```

Make it executable and run:
```bash
chmod +x test-db.sh
./test-db.sh
```

