#!/bin/bash

# Quick Start Script for Server Inventory System
# This script sets up the development environment

set -e

echo "🚀 Starting Server Inventory System Setup..."

# Check prerequisites
echo ""
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 14+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ PostgreSQL is installed"

# Setup database
echo ""
echo "📊 Setting up database..."
if psql -lqt | cut -d \| -f 1 | grep -qw server_inventory; then
    echo "⚠️  Database 'server_inventory' already exists"
    read -p "Do you want to drop and recreate it? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb server_inventory
        createdb server_inventory
        echo "✅ Database recreated"
    fi
else
    createdb server_inventory
    echo "✅ Database created"
fi

# Setup backend
echo ""
echo "⚙️  Setting up backend..."
cd backend

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file"
else
    echo "⚠️  .env file already exists"
fi

echo "📦 Installing backend dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

echo "📝 Seeding database with sample data..."
npx ts-node prisma/seed.ts

cd ..

# Setup frontend
echo ""
echo "🎨 Setting up frontend..."
cd frontend

if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local file"
else
    echo "⚠️  .env.local file already exists"
fi

echo "📦 Installing frontend dependencies..."
npm install

cd ..

# Done
echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 Your Server Inventory System is ready!"
echo ""
echo "To start the application:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend"
echo "    npm run start:dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see docs/README.md"
