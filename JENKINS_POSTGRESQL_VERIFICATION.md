# Jenkins PostgreSQL Database Verification Guide

## Overview

This guide explains how to verify that PostgreSQL is working correctly in Jenkins for E2E tests.

## Verification Steps

### 1. Check Docker Availability

The Jenkinsfile automatically checks if Docker is available:

```groovy
def dockerAvailable = sh(
    script: 'command -v docker &> /dev/null && echo "yes" || echo "no"',
    returnStdout: true
).trim() == 'yes'
```

**Manual Check:**
```bash
# In Jenkins agent shell
docker --version
docker ps
```

### 2. Verify PostgreSQL Container is Running

**In Jenkins Pipeline:**
The pipeline logs will show:
```
Docker is available. Starting PostgreSQL container...
Waiting for PostgreSQL to be ready...
PostgreSQL is ready and accepting connections!
```

**Manual Check:**
```bash
# Check if container exists
docker ps -a | grep postgres-e2e-test

# Check container status
docker ps | grep postgres-e2e-test

# Check container logs
docker logs postgres-e2e-test
```

### 3. Test Database Connection

**In Jenkins Pipeline:**
The pipeline includes connection verification:
```groovy
sh '''
    timeout 30 bash -c 'until docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "SELECT 1;" > /dev/null 2>&1; do sleep 1; done'
'''
```

**Manual Test:**
```bash
# Test connection from Jenkins agent
docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "SELECT version();"

# Test with connection string
psql postgresql://testuser:testpass@localhost:5432/softdev_solutions_test -c "SELECT 1;"
```

### 4. Verify Environment Variable

**In Jenkins Pipeline:**
Check logs for:
```
DATABASE_URL: postgresql://testuser:testpass@localhost:5432/softdev_solutions_test
DATABASE_URL exported for Playwright: postgresql://...
```

**Manual Check:**
```bash
# In Jenkins pipeline shell
echo $DATABASE_URL
```

### 5. Test from Next.js Server

**Check Server Logs:**
Look for these log messages:
- `[Database] Database initialized successfully` ✅
- `[Database] Connection attempt X/5 failed, retrying...` (retrying is OK)
- `[Database] Error initializing database: Error: connect ECONNREFUSED` ❌

**Test Database Health Endpoint:**
```bash
# After server starts
curl http://localhost:3000/api/admin/database

# Expected response:
{
  "status": "healthy",
  "message": "Database connection successful",
  "userCount": 0,
  "timestamp": "..."
}
```

### 6. Verify Database Schema

**Check if tables exist:**
```bash
docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "\dt"

# Should show:
#  public | users | table | testuser
```

**Check table structure:**
```bash
docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "\d users"
```

## Common Issues and Solutions

### Issue 1: Docker Not Available

**Symptoms:**
```
WARNING: Docker is not available. Database tests will be skipped.
```

**Solution:**
1. Install Docker on Jenkins agent
2. Ensure Docker service is running: `sudo systemctl start docker`
3. Add Jenkins user to docker group: `sudo usermod -aG docker jenkins`

### Issue 2: Port 5432 Already in Use

**Symptoms:**
```
Error response from daemon: driver failed programming external connectivity
Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Solution:**
1. Check what's using port 5432: `sudo lsof -i :5432`
2. Stop conflicting service or change port in Jenkinsfile
3. Use different port: `-p 5433:5432` and update DATABASE_URL

### Issue 3: Container Fails to Start

**Symptoms:**
```
ERROR: PostgreSQL failed to start within timeout
```

**Solution:**
1. Check container logs: `docker logs postgres-e2e-test`
2. Check Docker resources: `docker stats`
3. Increase timeout in Jenkinsfile
4. Check disk space: `df -h`

### Issue 4: Connection Refused (ECONNREFUSED)

**Symptoms:**
```
[Database] Error initializing database: Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Possible Causes:**
1. PostgreSQL not ready when server starts
2. DATABASE_URL not passed to server process
3. Network connectivity issues

**Solutions:**
1. ✅ Already fixed: Increased connection timeout to 10s
2. ✅ Already fixed: Non-blocking initialization
3. ✅ Already fixed: Retry logic on first use
4. Verify DATABASE_URL is set: Check Playwright webServer env config

### Issue 5: Database Not Initialized

**Symptoms:**
```
Error: relation "users" does not exist
```

**Solution:**
1. Check if initialization ran: Look for `[Database] Database initialized successfully`
2. Manually initialize: The retry logic should handle this automatically
3. Check database logs: `docker logs postgres-e2e-test`

## Verification Script

Add this to Jenkinsfile for comprehensive verification:

```groovy
script {
    if (env.DATABASE_AVAILABLE == 'true') {
        echo '=== PostgreSQL Verification ==='
        
        // Check container status
        def containerStatus = sh(
            script: 'docker ps --filter name=postgres-e2e-test --format "{{.Status}}"',
            returnStdout: true
        ).trim()
        echo "Container Status: ${containerStatus}"
        
        // Test connection
        def connectionTest = sh(
            script: 'docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "SELECT 1;" 2>&1',
            returnStdout: true
        ).trim()
        echo "Connection Test: ${connectionTest}"
        
        // Check tables
        def tables = sh(
            script: 'docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "\\dt" 2>&1',
            returnStdout: true
        ).trim()
        echo "Tables: ${tables}"
        
        echo '=== Verification Complete ==='
    }
}
```

## Monitoring Database Health

### During Test Execution

Monitor these indicators:

1. **Container Health:**
   ```bash
   docker inspect postgres-e2e-test | grep -A 10 Health
   ```

2. **Database Connections:**
   ```bash
   docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "SELECT count(*) FROM pg_stat_activity;"
   ```

3. **Server Logs:**
   - Look for database initialization messages
   - Check for connection errors
   - Verify retry attempts

### After Test Completion

1. **Check Test Data:**
   ```bash
   docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "SELECT count(*) FROM users;"
   ```

2. **Verify Cleanup:**
   - Container should be stopped and removed
   - No leftover test data

## Best Practices

1. **Always verify Docker is available** before starting PostgreSQL
2. **Wait for PostgreSQL to be ready** before starting the server
3. **Use health checks** to verify container status
4. **Test connection** before running tests
5. **Monitor logs** during test execution
6. **Clean up containers** after tests complete

## Troubleshooting Checklist

- [ ] Docker is installed and running
- [ ] Port 5432 is available
- [ ] PostgreSQL container starts successfully
- [ ] Container passes health checks
- [ ] Database connection test succeeds
- [ ] DATABASE_URL is set correctly
- [ ] DATABASE_URL is passed to Next.js server
- [ ] Database schema initializes successfully
- [ ] Database operations work correctly
- [ ] Container is cleaned up after tests

## Quick Verification Commands

```bash
# 1. Check Docker
docker --version && docker ps

# 2. Check PostgreSQL container
docker ps | grep postgres-e2e-test

# 3. Test connection
docker exec postgres-e2e-test pg_isready -U testuser

# 4. Test database query
docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "SELECT 1;"

# 5. Check tables
docker exec postgres-e2e-test psql -U testuser -d softdev_solutions_test -c "\dt"

# 6. Check environment variable
echo $DATABASE_URL

# 7. Test from server
curl http://localhost:3000/api/admin/database
```

