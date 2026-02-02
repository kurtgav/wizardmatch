#!/bin/bash

echo "Testing different PostgreSQL connection methods..."

# Test 1: No password
echo "Test 1: Connecting as 'hoon' without password..."
PGPASSWORD='' /Library/PostgreSQL/17/bin/psql -U hoon -c "SELECT 1;" 2>&1 | head -3

# Test 2: With user 'postgres'
echo "Test 2: Connecting as 'postgres' without password..."
PGPASSWORD='' /Library/PostgreSQL/17/bin/psql -U postgres -c "SELECT 1;" 2>&1 | head -3

# Test 3: Using socket
echo "Test 3: Using Unix socket..."
/Library/PostgreSQL/17/bin/psql -h /tmp -c "SELECT 1;" 2>&1 | head -3

echo ""
echo "If any of these worked, we can use that connection!"
