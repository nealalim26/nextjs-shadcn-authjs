@echo off
setlocal enabledelayedexpansion

REM Next.js Auth.js Environment Setup Script for Windows
echo 🚀 Setting up environment variables for Next.js Auth.js...

REM Check if .env already exists
if exist ".env" (
    echo ⚠️  .env already exists. Backing up to .env.backup
    copy ".env" ".env.backup" >nul
)

REM Generate a random secret key (using PowerShell)
for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(32, 0)"') do set SECRET_KEY=%%i

REM Create .env file
(
echo AUTH_URL="http://localhost:3000"
echo AUTH_SECRET="%SECRET_KEY%"
echo AUTH_GOOGLE_ID="your-google-client-id"
echo AUTH_GOOGLE_SECRET="your-google-client-secret"
echo NEXT_PUBLIC_PROJECT_NAME=neal
) > .env

echo ✅ Environment file created: .env
echo.
echo 🔧 Running post-setup commands...

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    exit /b 1
)

REM Install with legacy peer deps (for compatibility)
echo 📦 Installing with legacy peer deps...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ npm install --legacy-peer-deps failed
    exit /b 1
)

REM Run linting
echo 🔍 Running linter...
call npm run lint
if %errorlevel% neq 0 (
    echo ⚠️  Linting issues found, but continuing...
)

REM Run formatting
echo ✨ Running formatter...
call npm run format
if %errorlevel% neq 0 (
    echo ❌ npm run format failed
    exit /b 1
)

REM Run build
echo 🏗️  Running build...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ npm run build failed
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📝 Next steps:
echo 1. Update the OAuth provider credentials in .env
echo 2. For GitHub: Go to https://github.com/settings/developers
echo 3. For Google: Go to https://console.cloud.google.com/
echo 4. Set callback URLs to: http://localhost:3000/api/auth/callback/{provider} (replace {provider} with the actual provider)
echo.
echo 🔐 Demo credentials will work with:
echo    Email: nealalim26@lebryne.com
echo    Password: admin
echo.
echo 🚀 Run 'npm run dev' to start the development server

pause
