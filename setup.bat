@echo off
REM ===========================================
REM The Locked Study - Windows Setup Script
REM ===========================================

echo 🔐 The Locked Study - Setup Script
echo ===================================

REM Check for Docker
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Docker found!
    echo.
    echo Starting with Docker Compose...
    docker-compose up --build -d
    echo.
    echo ✅ Application started!
    echo    Frontend: http://localhost:3000
    echo    Backend:  http://localhost:8001/api
    echo.
    echo To stop: docker-compose down
    pause
    exit /b 0
)

echo ⚠️  Docker not found. Setting up manually...
echo.

REM Check for Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is required. Please install from https://python.org
    pause
    exit /b 1
)

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is required. Please install from https://nodejs.org
    pause
    exit /b 1
)

REM Check for Yarn
where yarn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing Yarn...
    npm install -g yarn
)

REM Setup Backend
echo 🐍 Setting up Backend...
cd backend

if not exist "venv" (
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt

if not exist ".env" (
    copy .env.example .env
    echo ⚠️  Created backend\.env - Please configure MONGO_URL if needed
)

cd ..

REM Setup Frontend
echo ⚛️  Setting up Frontend...
cd frontend

call yarn install

if not exist ".env" (
    copy .env.example .env
)

cd ..

echo.
echo ✅ Setup complete!
echo.
echo To start the application:
echo.
echo   Terminal 1 (Backend):
echo     cd backend
echo     venv\Scripts\activate
echo     uvicorn server:app --host 0.0.0.0 --port 8001 --reload
echo.
echo   Terminal 2 (Frontend):
echo     cd frontend
echo     yarn start
echo.
echo Then open http://localhost:3000 in your browser!
echo.
pause
