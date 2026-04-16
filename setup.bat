@echo off
REM eTracker Development Environment Setup Script
REM This script helps set up the eTracker project for development

echo ======================================
echo eTracker Development Setup
echo ======================================
echo.

REM Check for .NET SDK
echo Checking .NET SDK...
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ❌ .NET SDK not found. Please install .NET 10.0 SDK
    exit /b 1
)
for /f "tokens=*" %%i in ('dotnet --version') do set DOTNET_VERSION=%%i
echo ✅ .NET SDK found: %DOTNET_VERSION%
echo.

REM Check for Node.js
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm found: %NPM_VERSION%
echo.

REM Backend setup
echo ======================================
echo Setting up Backend
echo ======================================
cd backend\eTracker.API

echo Restoring NuGet packages...
call dotnet restore

echo Building backend...
call dotnet build

if exist appsettings.Development.json (
    echo ⚠️  appsettings.Development.json already exists
    echo ⚠️  Please update it with your database connection string
) else (
    echo ❌ appsettings.Development.json not found
    echo    Create it from appsettings.json and update the connection string
)

echo.
echo Backend setup complete!
echo.

REM Frontend setup
echo ======================================
echo Setting up Frontend
echo ======================================
cd ..\..\frontend

echo Installing npm packages...
call npm install

if exist .env.local (
    echo ✅ .env.local found
    echo ⚠️  Please verify it contains your configuration
) else (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local
    echo ⚠️  Please update .env.local with your configuration
)

echo.
echo Frontend setup complete!
echo.

REM Summary
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo Next steps:
echo 1. Configure database connection in backend/eTracker.API/appsettings.Development.json
echo 2. Update frontend/.env.local with your API URL and Google OAuth credentials
echo 3. Run: cd backend\eTracker.API ^&^& dotnet ef database update
echo 4. In one terminal: cd backend\eTracker.API ^&^& dotnet run
echo 5. In another terminal: cd frontend ^&^& npm run dev
echo.
echo API: http://localhost:5000
echo Swagger: http://localhost:5000/swagger
echo Frontend: http://localhost:5173
echo.
