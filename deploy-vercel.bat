@echo off
echo 🏥 Healthcare Management System - Vercel Deployment
echo ================================================================

REM Check if Vercel CLI is installed
echo.
echo [1/5] Checking Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Vercel CLI is not installed. Installing...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Vercel CLI. Please install manually:
        echo    npm install -g vercel
        pause
        exit /b 1
    )
)
echo ✅ Vercel CLI installed

REM Check if logged into Vercel
echo [2/5] Checking Vercel authentication...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Not logged into Vercel. Please login:
    vercel login
    if %errorlevel% neq 0 (
        echo ❌ Vercel login failed.
        pause
        exit /b 1
    )
)
echo ✅ Vercel authenticated

REM Check if .env file exists
echo [3/5] Checking environment configuration...
if not exist .env (
    echo ❌ .env file not found. Please create it from .env.example
    pause
    exit /b 1
)
echo ✅ Environment configuration found

REM Run linting
echo [4/5] Running code quality checks...
call npm run lint
if %errorlevel% neq 0 (
    echo ⚠️  Linting issues found. Continue anyway? (Y/N)
    set /p continue=
    if /i not "%continue%"=="Y" (
        echo Deployment cancelled.
        pause
        exit /b 1
    )
)
echo ✅ Code quality checks passed

REM Build the application
echo [5/5] Building production bundle...
echo.
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix the errors and try again.
    pause
    exit /b 1
)
echo ✅ Build completed successfully

REM Confirm deployment
echo.
echo ================================================================
echo ⚠️  Ready to deploy to Vercel. Continue? (Y/N)
set /p deploy=
if /i not "%deploy%"=="Y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

REM Deploy to Vercel
echo.
echo 🚀 Deploying to Vercel...
echo.
echo ⚠️  IMPORTANT: After deployment, you need to:
echo    1. Add environment variables in Vercel dashboard
echo    2. Deploy Firebase rules: firebase deploy --only firestore:indexes,firestore:rules,storage
echo    3. Add Vercel domain to Firebase authorized domains
echo.
echo Press any key to continue with deployment...
pause >nul

vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo ================================================================
    echo ✅ Deployment successful!
    echo ================================================================
    echo.
    echo 🎉 Your Healthcare Management System is now live on Vercel!
    echo.
    echo 📋 Post-Deployment Steps:
    echo.
    echo 1. Add Environment Variables to Vercel:
    echo    - Go to Vercel dashboard ^> Settings ^> Environment Variables
    echo    - Add all variables from your .env file
    echo    - Redeploy after adding variables
    echo.
    echo 2. Deploy Firebase Backend:
    echo    firebase deploy --only firestore:indexes
    echo    firebase deploy --only firestore:rules
    echo    firebase deploy --only storage
    echo.
    echo 3. Update Firebase Authorized Domains:
    echo    - Go to Firebase Console ^> Authentication ^> Settings
    echo    - Add your Vercel domain to authorized domains
    echo.
    echo 4. Verify Deployment:
    echo    - Visit your Vercel URL
    echo    - Test authentication
    echo    - Test core features
    echo    - Run Lighthouse audit
    echo.
    echo 📖 For detailed instructions, see VERCEL_DEPLOYMENT.md
    echo.
) else (
    echo.
    echo ❌ Deployment failed. Please check the errors above.
    echo.
    echo 🔧 Troubleshooting:
    echo   - Verify Vercel CLI is installed: vercel --version
    echo   - Check you're logged in: vercel whoami
    echo   - Try manual deployment: vercel --prod
    echo   - See VERCEL_DEPLOYMENT.md for detailed troubleshooting
    echo.
)

pause
