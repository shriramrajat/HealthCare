// Firebase Connection Test Script
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCphOBZ4zfZLqGWg33YTgk3bVofi1vKqlU",
  authDomain: "optimal-timer-466116-u0.firebaseapp.com",
  projectId: "optimal-timer-466116-u0",
  storageBucket: "optimal-timer-466116-u0.firebasestorage.app",
  messagingSenderId: "293836082393",
  appId: "1:293836082393:web:ee993906afa762e5a082c8",
  measurementId: "G-C17Q3C5WGY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('🔥 Firebase initialized successfully');
console.log('📊 Testing Firebase connection...\n');

// Test 1: Check Firestore connection
async function testFirestoreConnection() {
  console.log('Test 1: Firestore Connection');
  try {
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Connection test',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Firestore connection successful');
    console.log('   Document ID:', testDoc.id);
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error.message);
    return false;
  }
}

// Test 2: Check Authentication
async function testAuthentication() {
  console.log('\nTest 2: Authentication');
  try {
    // Try to get current user
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('✅ User already authenticated:', currentUser.email);
      return currentUser;
    } else {
      console.log('⚠️  No user currently authenticated');
      return null;
    }
  } catch (error) {
    console.error('❌ Authentication check failed:', error.message);
    return null;
  }
}

// Test 3: Check Firestore Rules
async function testFirestoreRules(userId) {
  console.log('\nTest 3: Firestore Rules');
  
  if (!userId) {
    console.log('⚠️  Skipping rules test (no authenticated user)');
    return;
  }

  const collections = [
    'healthMetrics',
    'medications',
    'symptoms',
    'appointments',
    'notifications'
  ];

  for (const collectionName of collections) {
    try {
      const testData = {
        userId: userId,
        testField: 'test',
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, collectionName), testData);
      console.log(`✅ ${collectionName}: Write successful (ID: ${docRef.id})`);
      
      // Try to read it back
      const q = query(collection(db, collectionName), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      console.log(`✅ ${collectionName}: Read successful (${querySnapshot.size} docs)`);
    } catch (error) {
      console.error(`❌ ${collectionName}: ${error.code} - ${error.message}`);
    }
  }
}

// Test 4: Check specific collection structure
async function testCollectionStructure() {
  console.log('\nTest 4: Collection Structure');
  
  const collections = ['users', 'healthMetrics', 'medications', 'symptoms', 'appointments'];
  
  for (const collectionName of collections) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      console.log(`📁 ${collectionName}: ${snapshot.size} documents`);
    } catch (error) {
      console.error(`❌ ${collectionName}: ${error.message}`);
    }
  }
}

// Run all tests
async function runTests() {
  console.log('='.repeat(50));
  console.log('FIREBASE CONNECTION DIAGNOSTIC TEST');
  console.log('='.repeat(50) + '\n');

  await testFirestoreConnection();
  const user = await testAuthentication();
  await testCollectionStructure();
  
  if (user) {
    await testFirestoreRules(user.uid);
  }

  console.log('\n' + '='.repeat(50));
  console.log('DIAGNOSTIC TEST COMPLETE');
  console.log('='.repeat(50));
}

runTests().catch(console.error);
