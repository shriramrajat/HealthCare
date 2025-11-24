# Healthcare Management System - Deployment Guide

## Prerequisites

Before deploying to production, ensure you have:

1. **Firebase CLI installed**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project Setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password provider)
   - Enable Firestore Database
   - Enable Firebase Storage
   - Enable Firebase Hosting

3. **Node.js and npm**
   - Node.js version 18 or higher
   - npm version 9 or higher

## Firebase Project Configuration

### Required Firebase Services

1. **Authentication**
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable Email/Password provider
   - Configure authorized domains for production

2. **Firestore Database**
   - Go to Firebase Console > Firestore Database
   - Create database in production mode
   - Deploy security rules (handled by deployment script)
   - Deploy indexes (handled by deployment script)

3. **Firebase Storage**
   - Go to Firebase Console > Storage
   - Create default bucket
   - Deploy storage rules (handled by deployment script)

4. **Firebase Hosting**
   - Go to Firebase Console > Hosting
   - Set up hosting (automatic on first deploy)

### Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

Get your Firebase configuration from:
Firebase Console > Project Settings > General > Your apps > Web app

Required variables:
- `VITE_FIREBASE_API_KEY` - Your Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Your Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Your Firebase measurement ID

Optional configuration:
- `VITE_ENV` - Environment name (default: production)
- `VITE_ENABLE_PERFORMANCE_MONITORING` - Enable performance tracking (default: true)
- `VITE_ENABLE_ERROR_LOGGING` - Enable error logging (default: true)
- `VITE_CACHE_TTL` - Cache time-to-live in milliseconds (default: 300000 = 5 minutes)
- `VITE_API_TIMEOUT` - API timeout in milliseconds (default: 10000 = 10 seconds)

## Pre-Deployment Checklist

Before running the deployment script, verify:

- [ ] All environment variables are set in `.env`
- [ ] Firebase project is created and configured
- [ ] Authentication is enabled in Firebase Console
- [ ] Firestore Database is created
- [ ] Firebase Storage is set up
- [ ] You are logged into Firebase CLI (`firebase login`)
- [ ] You have selected the correct Firebase project (`firebase use <project-id>`)
- [ ] All tests pass (`npm run test:run`)
- [ ] Build completes successfully (`npm run build`)
- [ ] Bundle sizes are within targets (< 500 KB per chunk)

## Deployment Process

### Automatic Deployment (Recommended)

Use the provided deployment scripts:

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

The deployment script will:
1. Verify Firebase CLI is installed
2. Run pre-deployment checks
3. Build the production bundle
4. Verify bundle sizes
5. Deploy Firestore indexes
6. Deploy Firestore rules
7. Deploy Storage rules
8. Deploy to Firebase Hosting
9. Run post-deployment verification

### Manual Deployment

If you prefer manual deployment:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy Firestore indexes**
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Deploy Firestore rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Deploy Storage rules**
   ```bash
   firebase deploy --only storage
   ```

5. **Deploy to Hosting**
   ```bash
   firebase deploy --only hosting
   ```

## Post-Deployment Verification

After deployment, verify:

1. **Application loads correctly**
   - Visit your deployed URL
   - Check that the app loads within 3 seconds
   - Verify all routes are accessible

2. **Authentication works**
   - Test user registration
   - Test user login
   - Test logout functionality

3. **Database operations work**
   - Create test data (medications, symptoms, appointments)
   - Verify data is saved correctly
   - Test data retrieval and updates

4. **Performance metrics**
   - Run Lighthouse audit (target score > 90)
   - Check bundle sizes in browser DevTools
   - Verify lazy loading works for routes

5. **Error handling**
   - Test offline functionality
   - Verify error messages display correctly
   - Test form submission retry mechanisms

## Performance Targets

Your deployment should meet these targets:

- **Load Time**: < 3 seconds on 3G connection
- **Time to Interactive**: < 5 seconds on 3G connection
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Bundle Size**: < 500 KB per chunk (gzipped)
- **Lighthouse Score**: > 90

## Monitoring

After deployment, monitor:

1. **Firebase Console**
   - Authentication usage
   - Firestore read/write operations
   - Storage usage
   - Hosting bandwidth

2. **Browser Console**
   - Performance metrics (logged automatically)
   - Error logs
   - Slow query warnings (> 2 seconds)

3. **User Feedback**
   - Load time experience
   - Form submission reliability
   - Error message clarity

## Rollback Procedure

If issues occur after deployment:

1. **Firebase Hosting Rollback**
   ```bash
   firebase hosting:rollback
   ```

2. **Firestore Rules Rollback**
   - Go to Firebase Console > Firestore Database > Rules
   - View history and restore previous version

3. **Firestore Indexes Rollback**
   - Indexes can be deleted from Firebase Console
   - Redeploy previous version of firestore.indexes.json

## Troubleshooting

### Build Fails

- Check for TypeScript errors: `npm run lint`
- Verify all dependencies are installed: `npm install`
- Clear build cache: `rm -rf dist node_modules/.vite`

### Deployment Fails

- Verify Firebase CLI is logged in: `firebase login`
- Check Firebase project is selected: `firebase projects:list`
- Verify Firebase project permissions

### Application Errors After Deployment

- Check browser console for errors
- Verify environment variables are correct
- Check Firebase Console for service status
- Review Firestore rules for permission issues

### Performance Issues

- Run Lighthouse audit to identify bottlenecks
- Check bundle sizes: `npm run build` and review dist folder
- Verify lazy loading is working in Network tab
- Check Firestore query performance in Firebase Console

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` file to version control
   - Use `.env.example` as template
   - Rotate API keys if exposed

2. **Firestore Rules**
   - Review rules before deployment
   - Test rules with Firebase emulator
   - Ensure users can only access their own data

3. **Authentication**
   - Configure authorized domains in Firebase Console
   - Enable email verification for production
   - Set up password policies

4. **HTTPS**
   - Firebase Hosting automatically uses HTTPS
   - Verify all API calls use HTTPS

## Support

For issues or questions:
- Review Firebase documentation: https://firebase.google.com/docs
- Check application logs in browser console
- Review Firebase Console for service status
- Contact development team

## Version History

- **v1.0.0** - Initial production deployment with optimizations
  - Code splitting and lazy loading
  - Enhanced form submissions with retry logic
  - Firestore query optimization
  - Performance monitoring
  - Comprehensive error handling
