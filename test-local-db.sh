#!/bin/bash
set -e

echo "=== Testing Local PostgreSQL Database ==="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="postgresql://testuser:testpass@localhost:5432/softdev_solutions"
    echo "DATABASE_URL set to: $DATABASE_URL"
fi

echo "DATABASE_URL: $DATABASE_URL"

# Test 1: Check if container is running
echo ""
echo "1. Checking PostgreSQL container..."
if docker ps | grep -q postgres-local-test; then
    echo "✓ Container is running"
else
    echo "✗ Container is not running"
    exit 1
fi

# Test 2: Test database connection
echo ""
echo "2. Testing database connection..."
if docker exec postgres-local-test psql -U testuser -d softdev_solutions -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✓ Database connection successful"
else
    echo "✗ Database connection failed"
    exit 1
fi

# Test 3: Check PostgreSQL version
echo ""
echo "3. PostgreSQL version:"
docker exec postgres-local-test psql -U testuser -d softdev_solutions -c "SELECT version();" | head -3

# Test 4: Test if application can connect (if server is running)
echo ""
echo "4. Testing application database endpoint..."
if curl -s http://localhost:3000/api/admin/database > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:3000/api/admin/database)
    if echo "$HEALTH" | grep -q "healthy"; then
        echo "✓ Application database connection successful"
        echo "   Response: $(echo $HEALTH | jq -r '.status // "unknown"')"
    else
        echo "⚠ Application responded but database may not be healthy"
        echo "   Response: $HEALTH"
    fi
else
    echo "⚠ Application server not running (start with: npm run dev)"
    echo "   Skipping application test"
fi

# Test 5: Test user registration (if server is running)
echo ""
echo "5. Testing user registration..."
if curl -s http://localhost:3000/api/register > /dev/null 2>&1; then
    TEST_EMAIL="test-$(date +%s)@example.com"
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/register \
      -H "Content-Type: application/json" \
      -d "{
        \"firstName\": \"Test\",
        \"lastName\": \"User\",
        \"email\": \"$TEST_EMAIL\",
        \"company\": \"Test Company\",
        \"phone\": \"+1234567890\",
        \"message\": \"Local database test\"
      }")
    
    if echo "$RESPONSE" | grep -q "success"; then
        echo "✓ User registration successful"
        USER_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
        echo "   Created user ID: $USER_ID"
        
        # Test user retrieval
        echo ""
        echo "6. Testing user retrieval..."
        SEARCH_RESPONSE=$(curl -s "http://localhost:3000/api/register?search=$TEST_EMAIL")
        if echo "$SEARCH_RESPONSE" | grep -q "$TEST_EMAIL"; then
            echo "✓ User retrieval successful"
        else
            echo "✗ User retrieval failed"
        fi
        
        # Clean up test user
        if [ ! -z "$USER_ID" ]; then
            echo ""
            echo "7. Cleaning up test user..."
            DELETE_RESPONSE=$(curl -s -X DELETE "http://localhost:3000/api/register?id=$USER_ID")
            if echo "$DELETE_RESPONSE" | grep -q "success"; then
                echo "✓ Test user deleted successfully"
            else
                echo "⚠ Failed to delete test user (ID: $USER_ID)"
            fi
        fi
    else
        echo "✗ User registration failed"
        echo "   Response: $RESPONSE"
    fi
else
    echo "⚠ Application server not running (start with: npm run dev)"
    echo "   Skipping registration test"
fi

# Test 6: Check database tables
echo ""
echo "8. Checking database schema..."
TABLES=$(docker exec postgres-local-test psql -U testuser -d softdev_solutions -t -c "\dt" 2>/dev/null | wc -l)
if [ "$TABLES" -gt 0 ]; then
    echo "✓ Database tables exist"
    docker exec postgres-local-test psql -U testuser -d softdev_solutions -c "\dt"
else
    echo "⚠ No tables found (schema will be created on first use)"
fi

echo ""
echo "=== Database Testing Complete ==="
echo ""
echo "To use this database with your application:"
echo "  export DATABASE_URL='postgresql://testuser:testpass@localhost:5432/softdev_solutions'"
echo "  npm run dev"
echo ""
echo "To stop the database container:"
echo "  docker stop postgres-local-test"
echo "  docker rm postgres-local-test"

