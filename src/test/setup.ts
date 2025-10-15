import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('../firebase/config', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
  storage: {},
}));

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updatePassword: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
  },
  getAuth: vi.fn(),
}));

// Mock Firebase Firestore
const mockDocRef = { id: 'mock-doc-id' };
const mockCollectionRef = { id: 'mock-collection-id' };

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, collectionName) => {
    console.log('Mock collection called with:', collectionName);
    return mockCollectionRef;
  }),
  doc: vi.fn((db, collectionName, docId) => {
    console.log('Mock doc called with:', collectionName, docId);
    return mockDocRef;
  }),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => date),
  },
  addDoc: vi.fn((collectionRef, data) => {
    console.log('Mock addDoc called with collection:', collectionRef, 'data:', data);
    return Promise.resolve({ id: 'metric-1' });
  }),
  serverTimestamp: vi.fn(),
  getFirestore: vi.fn(),
}));

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
}));

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
    updatePassword: vi.fn(),
    resetPassword: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock NotificationContext
vi.mock('../contexts/NotificationContext', () => ({
  useNotifications: vi.fn(() => ({
    notifications: [],
    addNotification: vi.fn(),
    markAsRead: vi.fn(),
    clearAll: vi.fn(),
  })),
  NotificationProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
