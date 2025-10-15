#!/bin/bash

# Healthcare App Deployment Script
echo "🏥 Healthcare Management System - Deployment Script"
echo "=================================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "Please login to Firebase:"
    firebase login
fi

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your Healthcare Management System is now live!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Visit your deployed app"
    echo "2. Create your first user account"
    echo "3. Start using the platform with real data"
    echo ""
    echo "🔧 Don't forget to:"
    echo "- Set up Firestore security rules in Firebase Console"
    echo "- Enable Authentication in Firebase Console"
    echo "- Configure any additional Firebase services you need"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi