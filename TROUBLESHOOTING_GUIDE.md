# Healthcare App - Troubleshooting Guide

## Issue: Forms Not Saving & Notification System Issues

This guide will help you diagnose and fix issues with form submissions, data not saving to Firebase, and notification system problems.

---

## Quick Diagnostic Steps

### 1. Run the Built-in Diagnostic Tool

1. Log into your application
2. Navigate to `/diagnostic` in your browser (e.g., `http://localhost:5173/diagnostic`)
3. Click "Run Diagnostic Tests"
4. Review the results to identify specific issues

---

## Common Issues and Solutions

### Issue 1: Firestore Permission Denied Errors

**Symptoms:**
- Forms submit but data doesn't save
- Console shows "permission-denied" errors
- Notifications don't appear

**Cause:** Firestore security rules are blocking write operations

**Solution:**

1. **Check if you're logged in:**
   - Open browser console (F12)
   - Type: `firebase.auth().currentUser`
   - Should show user object, not null

2. **Verify Firestore Rules:**
   - Go to Firebase Console → Firestore Database → Rules
   - Check that rules match the `firestore.rules` file in your project
   - Rules should allow authenticated users to write their own data

3. **Deploy Updated Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Temporary Fix (DEVELOPMENT ONLY):**
   If you need to test immediately, temporarily use these rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   ⚠️ **WARNING:** This allows all authenticated users to read/write everything. Only use for testing!

---

### Issue 2: User Not Authenticated

**Symptoms:**
- Can't submit forms
- "Not authenticated" errors
- Redirected to login page

**Solution:**

1. **Clear browser cache and cookies**
2. **Log out and log back in**
3. **Check Firebase Authentication:**
   - Firebase Console → Authentication
   - Verify your user exists
   - Check if email is verified (if required)

4. **Check AuthContext:**
   - Open browser console
   - Check for authentication errors
   - Verify user object is populated

---

### Issue 3: Firestore Indexes Missing

**Symptoms:**
- Queries fail with "index required" error
- Data loads slowly or not at all

**Solution:**

1. **Check console for index URLs**
   - Firebase will provide a direct link to create the index
   - Click the link and create the index

2. **Deploy indexes from config:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Verify `firestore.indexes.json`:**
   ```json
   {
     "indexes": [
       {
         "collectionGroup": "healthMetrics",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "userId", "order": "ASCENDING" },
           { "fieldPath": "recordedAt", "order": "DESCENDING" }
         ]
       },
       {
         "collectionGroup": "medications",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "userId", "order": "ASCENDING" },
           { "fieldPath": "startDate", "order": "DESCENDING" }
         ]
       },
       {
         "collectionGroup": "symptoms",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "userId", "order": "ASCENDING" },
           { "fieldPath": "date", "order": "DESCENDING" }
         ]
       },
       {
         "collectionGroup": "appointments",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "patientId", "order": "ASCENDING" },
           { "fieldPath": "date", "order": "DESCENDING" }
         ]
       },
       {
         "collectionGroup": "appointments",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "doctorId", "order": "ASCENDING" },
           { "fieldPath": "date", "order": "DESCENDING" }
         ]
       },
       {
         "collectionGroup": "notifications",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "userId", "order": "ASCENDING" },
           { "fieldPath": "createdAt", "order": "DESCENDING" }
         ]
       }
     ]
   }
   ```

---

### Issue 4: Notification System Not Working

**Symptoms:**
- No notifications appear after form submission
- Notification container is empty

**Possible Causes & Solutions:**

1. **NotificationContext not wrapped properly:**
   - Check `App.tsx` - NotificationProvider should wrap the Router
   - Current structure is correct ✓

2. **Notifications not being triggered:**
   - Check browser console for errors
   - Verify `addNotification` is being called in form handlers
   - Example:
     ```typescript
     addNotification({
       title: 'Success',
       message: 'Data saved successfully',
       type: 'success'
     });
     ```

3. **NotificationContainer not rendering:**
   - Check if `NotificationContainer` is included in `NotificationProvider`
   - Current implementation includes it ✓

4. **CSS/Styling issues:**
   - Check if notifications are hidden off-screen
   - Inspect element in browser dev tools
   - Verify z-index is high enough

---

### Issue 5: Data Not Persisting

**Symptoms:**
- Form submits successfully
- No errors in console
- Data doesn't appear in Firebase Console
- Data disappears after page refresh

**Solution:**

1. **Check Firebase Console:**
   - Go to Firestore Database
   - Look for your collections (healthMetrics, medications, symptoms, etc.)
   - Verify documents are being created

2. **Check Network Tab:**
   - Open browser dev tools → Network tab
   - Submit a form
   - Look for Firestore API calls
   - Check response status (should be 200)

3. **Verify userId is correct:**
   - Open browser console
   - Check: `user.id` matches Firebase Auth UID
   - Data should have `userId` field matching authenticated user

4. **Check for async/await issues:**
   - Ensure form handlers use `await` when calling Firestore
   - Example:
     ```typescript
     const handleSubmit = async (data) => {
       try {
         await firestoreService.addMedication(data);
         // Success notification
       } catch (error) {
         // Error notification
       }
     };
     ```

---

## Debugging Checklist

Use this checklist to systematically debug issues:

- [ ] User is authenticated (check browser console)
- [ ] Firebase config is correct (.env file)
- [ ] Firestore rules allow write operations
- [ ] Required indexes are created
- [ ] Network requests are successful (check Network tab)
- [ ] No console errors
- [ ] userId matches authenticated user
- [ ] Form validation passes
- [ ] NotificationContext is working
- [ ] Data appears in Firebase Console

---

## Testing Individual Components

### Test Firestore Connection:
```javascript
// In browser console
import { db } from './firebase/config';
import { collection, addDoc } from 'firebase/firestore';

const testDoc = await addDoc(collection(db, 'test'), {
  message: 'test',
  timestamp: new Date()
});
console.log('Document created:', testDoc.id);
```

### Test Authentication:
```javascript
// In browser console
import { auth } from './firebase/config';
console.log('Current user:', auth.currentUser);
console.log('User ID:', auth.currentUser?.uid);
```

### Test Notification System:
```javascript
// In browser console (when on app page)
// This assumes you have access to the notification context
addNotification({
  title: 'Test',
  message: 'This is a test notification',
  type: 'info'
});
```

---

## Firebase Console Checks

### 1. Authentication
- Go to: Firebase Console → Authentication → Users
- Verify your test user exists
- Check sign-in methods are enabled (Email/Password)

### 2. Firestore Database
- Go to: Firebase Console → Firestore Database
- Check if collections exist:
  - users
  - healthMetrics
  - medications
  - symptoms
  - appointments
  - notifications
- Click on a collection to see documents
- Verify document structure matches your data model

### 3. Firestore Rules
- Go to: Firebase Console → Firestore Database → Rules
- Click "Publish" if rules are in draft mode
- Test rules using the Rules Playground

### 4. Firestore Indexes
- Go to: Firebase Console → Firestore Database → Indexes
- Check status of all indexes (should be "Enabled")
- Create any missing indexes

---

## Environment Variables

Verify your `.env` file has all required variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Important:** After changing `.env`, restart the dev server!

---

## Common Error Messages

### "Missing or insufficient permissions"
- **Cause:** Firestore rules blocking access
- **Fix:** Update and deploy Firestore rules

### "The query requires an index"
- **Cause:** Missing Firestore index
- **Fix:** Click the provided link or deploy indexes

### "auth/user-not-found"
- **Cause:** User doesn't exist or wrong credentials
- **Fix:** Register a new user or check credentials

### "Failed to get document because the client is offline"
- **Cause:** No internet connection or Firebase offline
- **Fix:** Check internet connection, verify Firebase project is active

---

## Still Having Issues?

1. **Check browser console** for detailed error messages
2. **Run the diagnostic tool** at `/diagnostic`
3. **Check Firebase Console** for service status
4. **Clear browser cache** and try again
5. **Try incognito mode** to rule out extension conflicts
6. **Check Firebase quotas** (free tier limits)

---

## Contact Information

If issues persist:
1. Export diagnostic test results
2. Check browser console for errors
3. Note the exact steps to reproduce
4. Check Firebase Console for any alerts

---

## Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Permission denied | Deploy Firestore rules: `firebase deploy --only firestore:rules` |
| Not authenticated | Log out and log back in |
| Index required | Click the link in console error or deploy indexes |
| Data not saving | Check browser console and Network tab |
| No notifications | Verify NotificationContext is working |
| Offline errors | Check internet connection |

---

## Prevention Tips

1. **Always check browser console** when testing
2. **Test with diagnostic tool** after major changes
3. **Deploy rules and indexes** after updating them
4. **Use try-catch blocks** in all async operations
5. **Add proper error notifications** to all forms
6. **Test in incognito mode** to avoid cache issues
7. **Keep Firebase SDK updated**
8. **Monitor Firebase quotas** on free tier

---

Last Updated: November 2025
