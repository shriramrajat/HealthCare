import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { User } from '../types';

export interface AuthError {
  code: string;
  message: string;
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, userData: Partial<User>): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      const userDoc = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name || '',
        role: userData.role || 'patient',
        phone: userData.phone || '',
        ...(userData.role === 'doctor' && { specialization: userData.specialization }),
        ...(userData.role === 'patient' && { conditions: userData.conditions || [] }),
        avatar: userData.avatar || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: userData.name || ''
      });

      return userDoc as User;
    } catch (error: any) {
      throw { code: error.code, message: error.message } as AuthError;
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      return userDoc.data() as User;
    } catch (error: any) {
      throw { code: error.code, message: error.message } as AuthError;
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw { code: error.code, message: error.message } as AuthError;
    }
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw { code: error.code, message: error.message } as AuthError;
    }
  },

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error: any) {
      throw { code: error.code, message: error.message } as AuthError;
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Update Firebase Auth profile if display name changed
      if (updates.name && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updates.name
        });
      }
    } catch (error: any) {
      throw { code: error.code, message: error.message } as AuthError;
    }
  }
};
