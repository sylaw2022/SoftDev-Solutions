# Database Connection Error Analysis

## Error: `ECONNREFUSED 127.0.0.1:5432`

### Root Causes

1. **Timing Issue**: The Next.js server starts and tries to initialize the database before PostgreSQL is fully ready
2. **Connection Pool Creation**: The Pool is created immediately when `getDatabase()` is first called, but actual connections are lazy
3. **Connection Timeout**: The pool has `connectionTimeoutMillis: 2000` (2 seconds), which might be too short
4. **Initialization Timing**: `initializeDatabaseWithRetry()` is called asynchronously but doesn't block server startup

### Why It Happens

1. **Server Startup Sequence**:
   - Playwright starts the Next.js server (`npm run start`)
   - Next.js server starts and may call `getDatabase()` during initialization
   - `getDatabase()` creates the Pool and calls `initializeDatabaseWithRetry()`
   - `initializeDatabaseWithRetry()` tries to connect immediately
   - If PostgreSQL isn't ready, connection is refused

2. **Connection Pool Behavior**:
   - Pool creation doesn't actually connect
   - First query triggers the connection
   - If PostgreSQL isn't ready, `ECONNREFUSED` occurs

3. **Environment Variable Timing**:
   - `DATABASE_URL` might not be available when the server process starts
   - Even if set, the connection attempt might happen before PostgreSQL is ready

### Solutions

1. **Increase Connection Timeout**: Give more time for PostgreSQL to be ready
2. **Lazy Initialization**: Don't initialize database schema until first actual use
3. **Better Error Handling**: Make initialization non-blocking and retry on first use
4. **Connection Verification**: Verify PostgreSQL is ready before starting the server

