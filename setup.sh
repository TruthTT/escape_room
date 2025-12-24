#!/bin/bash

# ===========================================
# The Locked Study - Local Development Setup
# ===========================================

echo "🔐 The Locked Study - Setup Script"
echo "==================================="

# Check for Docker
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker found!"
    echo ""
    echo "Starting with Docker Compose..."
    docker-compose up --build -d
    echo ""
    echo "✅ Application started!"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8001/api"
    echo ""
    echo "To stop: docker-compose down"
    exit 0
fi

echo "⚠️  Docker not found. Setting up manually..."
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required. Please install from https://python.org"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install from https://nodejs.org"
    exit 1
fi

# Check for Yarn
if ! command -v yarn &> /dev/null; then
    echo "📦 Installing Yarn..."
    npm install -g yarn
fi

# Setup Backend
echo "🐍 Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

pip install -r requirements.txt

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created backend/.env - Please configure MONGO_URL if needed"
fi

cd ..

# Setup Frontend
echo "⚛️  Setting up Frontend..."
cd frontend

yarn install

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend"
echo "    source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "    uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend"
echo "    yarn start"
echo ""
echo "Then open http://localhost:3000 in your browser!"
