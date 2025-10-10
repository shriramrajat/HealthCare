# Firebase Setup Instructions

This guide will help you set up Firebase for your Healthcare application.

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "healthcare-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

## 3. Create Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

### Firestore Security Rules (for development)

Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Health metrics - users can only access their own
    match /healthMetrics/{metricId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Medications - users can only access their own
    match /medications/{medicationId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Symptoms - users can only access their own
    match /symptoms/{symptomId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Appointments - users can access their own appointments
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         resource.data.doctorId == request.auth.uid);
    }
    
    // Reviews - anyone can read, patients can write
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        resource.data.patientId == request.auth.uid;
    }
    
    // Educational content - anyone can read
    match /educationalContent/{contentId} {
      allow read: if request.auth != null;
    }
    
    // Notifications - users can only access their own
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## 4. Get Firebase Configuration

1. In your Firebase project, click the gear icon ⚙️ and select "Project settings"
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Enter your app nickname (e.g., "healthcare-web")
5. Click "Register app"
6. Copy the Firebase configuration object

## 5. Update Firebase Configuration

Replace the placeholder values in `src/firebase/config.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## 6. Optional: Enable Firebase Storage

If you want to store user avatars or other files:

1. Go to "Storage" in the Firebase console
2. Click "Get started"
3. Start in test mode
4. Choose a location
5. Click "Done"

## 7. Optional: Set up Firebase Hosting

To deploy your app:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build your app: `npm run build`
5. Deploy: `firebase deploy`

## 8. Environment Variables (Recommended)

Create a `.env.local` file in your project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Then update `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## 9. Test Your Setup

1. Start your development server: `npm run dev`
2. Try registering a new account
3. Try logging in with the created account
4. Check your Firestore database to see if user data is being stored

## Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This usually happens when you're using React Strict Mode
   - The Firebase initialization is already handled properly in the config

2. **"Missing or insufficient permissions"**
   - Check your Firestore security rules
   - Make sure the user is authenticated
   - Verify the user ID matches the document owner

3. **"auth/network-request-failed"**
   - Check your internet connection
   - Verify your Firebase configuration
   - Make sure your Firebase project is active

4. **"Firebase: Error (auth/invalid-email)"**
   - Check email format validation
   - Ensure email is not empty

For more help, check the [Firebase Documentation](https://firebase.google.com/docs) or the [Firebase Console](https://console.firebase.google.com/).
