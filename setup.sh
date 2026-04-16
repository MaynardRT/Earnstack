#!/bin/bash
# eTracker Development Environment Setup Script
# This script helps set up the eTracker project for development

echo "======================================"
echo "eTracker Development Setup"
echo "======================================"
echo ""

# Check for .NET SDK
echo "Checking .NET SDK..."
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET SDK not found. Please install .NET 10.0 SDK"
    exit 1
fi
echo "✅ .NET SDK found: $(dotnet --version)"
echo ""

# Check for Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Backend setup
echo "======================================"
echo "Setting up Backend"
echo "======================================"
cd backend/eTracker.API

echo "Restoring NuGet packages..."
dotnet restore

echo "Building backend..."
dotnet build

if [ -f "appsettings.Development.json" ]; then
    echo "⚠️  appsettings.Development.json already exists"
    echo "⚠️  Please update it with your database connection string"
else
    echo "❌ appsettings.Development.json not found"
    echo "   Create it from appsettings.json and update the connection string"
fi

echo ""
echo "Backend setup complete!"
echo ""

# Frontend setup
echo "======================================"
echo "Setting up Frontend"
echo "======================================"
cd ../../frontend

echo "Installing npm packages..."
npm install

if [ -f ".env.local" ]; then
    echo "✅ .env.local found"
    echo "⚠️  Please verify it contains your configuration"
else
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your configuration"
fi

echo ""
echo "Frontend setup complete!"
echo ""

# Summary
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Configure database connection in backend/eTracker.API/appsettings.Development.json"
echo "2. Create initial admin user (see AUTHENTICATION_SETUP.md for instructions)"
echo "3. Run: cd backend/eTracker.API && dotnet ef database update"
echo "4. In one terminal: cd backend/eTracker.API && dotnet run"
echo "5. In another terminal: cd frontend && npm run dev"
echo ""
echo "API: http://localhost:5000"
echo "Swagger: http://localhost:5000/swagger"
echo "Frontend: http://localhost:5173"
echo ""
echo "For authentication setup, see: AUTHENTICATION_SETUP.md"
