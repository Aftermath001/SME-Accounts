#!/bin/bash

# SME-Accounts Backend - Quick Start Script

set -e

echo "=========================================="
echo "SME-Accounts Backend - First Time Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js $(node --version) detected"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ npm $(npm --version) detected"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📋 Creating .env from .env.example..."
    cp .env.example .env
    echo "✓ .env created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env with your Supabase credentials:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "   Then run: npm install && npm run dev"
    exit 0
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Type check
echo "🔍 Running type check..."
npm run type-check
echo "✓ Type check passed"
echo ""

# Lint check
echo "🔧 Running lint check..."
npm run lint
echo "✓ Lint check passed"
echo ""

# Build
echo "🔨 Building TypeScript..."
npm run build
echo "✓ Build successful"
echo ""

echo "=========================================="
echo "✓ Setup complete!"
echo "=========================================="
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Server will be available at:"
echo "  http://localhost:3000"
echo ""
echo "Health check endpoint:"
echo "  GET http://localhost:3000/health"
echo ""
