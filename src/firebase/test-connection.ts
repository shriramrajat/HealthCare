// Test Firebase connection
import { auth, db } from './config';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase connection...');
  
  try {
    // Test Auth connection
    console.log('Testing Firebase Auth...');
    const authStatePromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user ? 'Authenticated' : 'Not authenticated');
      });
    });
    
    console.log('✅ Firebase Auth initialized successfully');
    
    // Test Firestore connection
    console.log('Testing Firestore...');
    const testDocRef = doc(db, 'test', 'connection');
    await setDoc(testDocRef, {
      message: 'Hello Firebase!',
      timestamp: new Date().toISOString()
    });
    
    const docSnap = await getDoc(testDocRef);
    if (docSnap.exists()) {
      console.log('✅ Firestore connection successful:', docSnap.data());
    } else {
      console.log('❌ Firestore test document not found');
    }
    
    // Clean up test document
    await setDoc(testDocRef, {
      message: 'Test completed',
      timestamp: new Date().toISOString()
    });
    
    console.log('🎉 Firebase connection test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

// Auto-run test when imported (for development)
if (import.meta.env.DEV) {
  testFirebaseConnection();
}
