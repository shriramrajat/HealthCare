@echo off
echo 🏥 Healthcare Management System - Deployment Script
echo ==================================================

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI is not installed. Installing...
    npm install -g firebase-tools
)

REM Build the application
echo 🔨 Building the application...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix the errors and try again.
    pause
    exit /b 1
)

REM Deploy to Firebase
echo 🚀 Deploying to Firebase...
firebase deploy

if %errorlevel% equ 0 (
    echo ✅ Deployment successful!
    echo.
    echo 🎉 Your Healthcare Management System is now live!
    echo.
    echo 📋 Next Steps:
    echo 1. Visit your deployed app
    echo 2. Create your first user account
    echo 3. Start using the platform with real data
    echo.
    echo 🔧 Don't forget to:
    echo - Set up Firestore security rules in Firebase Console
    echo - Enable Authentication in Firebase Console
    echo - Configure any additional Firebase services you need
) else (
    echo ❌ Deployment failed. Please check the errors above.
)

pause