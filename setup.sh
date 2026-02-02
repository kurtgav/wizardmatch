#!/bin/bash

# Mapúa MCL Perfect Match - Setup Script
# This script initializes the database and starts the servers

echo "🎯 Mapúa MCL Perfect Match - Setup Script"
echo "========================================"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file not found!"
    echo "Please copy backend/.env.example to backend/.env and fill in your values"
    exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "❌ Frontend .env.local file not found!"
    echo "Please copy frontend/.env.local.example to frontend/.env.local and fill in your values"
    exit 1
fi

echo "✅ Environment files found"
echo ""

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
cd backend
if npx prisma db push --accept-data-loss 2>/dev/null; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ Cannot connect to PostgreSQL"
    echo ""
    echo "Please start PostgreSQL first:"
    echo "  macOS: brew services start postgresql@15"
    echo "  Docker: docker run --name perfect-match-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=perfect_match -p 5432:5432 -d postgres:15"
    echo ""
    echo "Or install PostgreSQL from: https://www.postgresql.org/download/"
    exit 1
fi

echo ""
echo "🗄️  Setting up database..."

# Generate Prisma Client
echo "  → Generating Prisma client..."
npx prisma generate

# Run migrations
echo "  → Running database migrations..."
npx prisma migrate dev --name init || echo "  ⚠️  Migration may have already run"

# Seed database
echo "  → Seeding database with survey questions..."
npx prisma db seed || echo "  ⚠️  Seeding may have already run"

echo ""
echo "✅ Database setup complete!"
echo ""

cd ..

# Ask if user wants to start servers
echo ""
echo "🚀 Ready to start servers!"
echo ""
echo "Choose an option:"
echo "  1) Start backend only"
echo "  2) Start frontend only"
echo "  3) Start both (recommended)"
echo "  4) Exit"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
  1)
    echo ""
    echo "🔧 Starting backend server..."
    cd backend
    npm run dev
    ;;
  2)
    echo ""
    echo "🎨 Starting frontend server..."
    cd frontend
    npm run dev
    ;;
  3)
    echo ""
    echo "🔧 Starting backend server (Terminal 1)..."
    echo "   Open a new terminal and run: cd frontend && npm run dev"
    echo ""
    cd backend
    npm run dev
    ;;
  4)
    echo "✅ Setup complete! You can start the servers manually:"
    echo "  Backend:  cd backend && npm run dev"
    echo "  Frontend: cd frontend && npm run dev"
    exit 0
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac
