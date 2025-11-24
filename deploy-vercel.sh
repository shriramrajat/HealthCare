#!/bin/bash

# Healthcare Management System - Vercel Deployment Script
echo "🏥 Healthcare Management System - Vercel Deployment"
echo "================================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Exit on error
set -e

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# Function to prompt for confirmation
confirm() {
    read -p "$1 (Y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return 1
    fi
    return 0
}

# Pre-deployment checks
echo ""
echo "📋 Running pre-deployment checks..."
echo ""

# Check if Vercel CLI is installed
echo "[1/5] Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI is not installed. Installing...${NC}"
    npm install -g vercel || handle_error "Failed to install Vercel CLI"
fi
echo -e "${GREEN}✅ Vercel CLI installed${NC}"

# Check if logged into Vercel
echo "[2/5] Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Vercel. Please login:${NC}"
    vercel login || handle_error "Vercel login failed"
fi
echo -e "${GREEN}✅ Vercel authenticated${NC}"

# Check if .env file exists
echo "[3/5] Checking environment configuration..."
if [ ! -f .env ]; then
    handle_error ".env file not found. Please create it from .env.example"
fi
echo -e "${GREEN}✅ Environment configuration found${NC}"

# Run linting
echo "[4/5] Running code quality checks..."
if ! npm run lint; then
    if ! confirm "${YELLOW}⚠️  Linting issues found. Continue anyway?${NC}"; then
        echo "Deployment cancelled."
        exit 0
    fi
fi
echo -e "${GREEN}✅ Code quality checks passed${NC}"

# Build the application
echo "[5/5] Building production bundle..."
echo ""
npm run build || handle_error "Build failed. Please fix the errors and try again."
echo -e "${GREEN}✅ Build completed successfully${NC}"

# Confirm deployment
echo ""
echo "================================================================"
if ! confirm "${YELLOW}⚠️  Ready to deploy to Vercel. Continue?${NC}"; then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: After deployment, you need to:${NC}"
echo "   1. Add environment variables in Vercel dashboard"
echo "   2. Deploy Firebase rules: firebase deploy --only firestore:indexes,firestore:rules,storage"
echo "   3. Add Vercel domain to Firebase authorized domains"
echo ""
echo "Press any key to continue with deployment..."
read -n 1 -s

vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================================"
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo "================================================================"
    echo ""
    echo "🎉 Your Healthcare Management System is now live on Vercel!"
    echo ""
    echo "📋 Post-Deployment Steps:"
    echo ""
    echo "1. Add Environment Variables to Vercel:"
    echo "   - Go to Vercel dashboard > Settings > Environment Variables"
    echo "   - Add all variables from your .env file"
    echo "   - Redeploy after adding variables"
    echo ""
    echo "2. Deploy Firebase Backend:"
    echo "   firebase deploy --only firestore:indexes"
    echo "   firebase deploy --only firestore:rules"
    echo "   firebase deploy --only storage"
    echo ""
    echo "3. Update Firebase Authorized Domains:"
    echo "   - Go to Firebase Console > Authentication > Settings"
    echo "   - Add your Vercel domain to authorized domains"
    echo ""
    echo "4. Verify Deployment:"
    echo "   - Visit your Vercel URL"
    echo "   - Test authentication"
    echo "   - Test core features"
    echo "   - Run Lighthouse audit"
    echo ""
    echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed. Please check the errors above.${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "  - Verify Vercel CLI is installed: vercel --version"
    echo "  - Check you're logged in: vercel whoami"
    echo "  - Try manual deployment: vercel --prod"
    echo "  - See VERCEL_DEPLOYMENT.md for detailed troubleshooting"
    echo ""
    exit 1
fi
