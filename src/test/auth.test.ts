import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { setDoc, getDoc } from 'firebase/firestore';
import { authService } from '../firebase/auth';
import { mockPatientUser, mockDoctorUser } from './test-utils';

// Mock Firebase functions
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(() => Promise.resolve()),
  sendPasswordResetEmail: vi.fn(),
  updatePassword: vi.fn(() => Promise.resolve()),
  reauthenticateWithCredential: vi.fn(() => Promise.resolve()),
  EmailAuthProvider: {
    credential: vi.fn(() => ({})),
  },
}));

vi.mock('firebase/firestore', () => ({
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  doc: vi.fn(),
}));

describe('Firebase Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully create a new patient user', async () => {
      const mockUserCredential = {
        user: {
          uid: 'patient-123',
          email: 'patient@test.com',
        },
      };

      (createUserWithEmailAndPassword as any).mockResolvedValue(mockUserCredential);
      (setDoc as any).mockResolvedValue(undefined);
      (updateProfile as any).mockResolvedValue(undefined);

      const userData = {
        name: 'John Patient',
        role: 'patient' as const,
        phone: '+1234567890',
        conditions: ['Diabetes Type 2'],
      };

      const result = await authService.signUp('patient@test.com', 'password123', userData);

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'patient@test.com', 'password123');
      expect(setDoc).toHaveBeenCalled();
      expect(updateProfile).toHaveBeenCalled();
      expect(result.role).toBe('patient');
      expect(result.email).toBe('patient@test.com');
    });

    it('should successfully create a new doctor user', async () => {
      const mockUserCredential = {
        user: {
          uid: 'doctor-123',
          email: 'doctor@test.com',
        },
      };

      (createUserWithEmailAndPassword as any).mockResolvedValue(mockUserCredential);
      (setDoc as any).mockResolvedValue(undefined);
      (updateProfile as any).mockResolvedValue(undefined);

      const userData = {
        name: 'Dr. Jane Doctor',
        role: 'doctor' as const,
        phone: '+1234567890',
        specialization: 'Cardiology',
      };

      const result = await authService.signUp('doctor@test.com', 'password123', userData);

      expect(result.role).toBe('doctor');
      expect(result.specialization).toBe('Cardiology');
    });

    it('should handle signup errors', async () => {
      (createUserWithEmailAndPassword as any).mockRejectedValue({
        code: 'auth/email-already-in-use',
        message: 'Email already in use',
      });

      await expect(
        authService.signUp('existing@test.com', 'password123', mockPatientUser)
      ).rejects.toMatchObject({
        code: 'auth/email-already-in-use',
      });
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUserCredential = {
        user: {
          uid: 'patient-123',
          email: 'patient@test.com',
        },
      };

      (signInWithEmailAndPassword as any).mockResolvedValue(mockUserCredential);
      (getDoc as any).mockResolvedValue({
        exists: () => true,
        data: () => mockPatientUser,
      });

      const result = await authService.signIn('patient@test.com', 'password123');

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'patient@test.com', 'password123');
      expect(getDoc).toHaveBeenCalled();
      expect(result.email).toBe('patient@test.com');
    });

    it('should handle sign in errors', async () => {
      (signInWithEmailAndPassword as any).mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'User not found',
      });

      await expect(
        authService.signIn('nonexistent@test.com', 'password123')
      ).rejects.toMatchObject({
        code: 'auth/user-not-found',
      });
    });

    it('should handle user document not found', async () => {
      const mockUserCredential = {
        user: {
          uid: 'patient-123',
          email: 'patient@test.com',
        },
      };

      (signInWithEmailAndPassword as any).mockResolvedValue(mockUserCredential);
      (getDoc as any).mockResolvedValue({
        exists: () => false,
      });

      await expect(
        authService.signIn('patient@test.com', 'password123')
      ).rejects.toThrow('User document not found');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      (signOut as any).mockResolvedValue(undefined);

      await expect(authService.signOut()).resolves.toBeUndefined();
      expect(signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      (signOut as any).mockRejectedValue({
        code: 'auth/network-request-failed',
        message: 'Network error',
      });

      await expect(authService.signOut()).rejects.toMatchObject({
        code: 'auth/network-request-failed',
      });
    });
  });

  describe('resetPassword', () => {
    it('should successfully send password reset email', async () => {
      (sendPasswordResetEmail as any).mockResolvedValue(undefined);

      await expect(authService.resetPassword('user@test.com')).resolves.toBeUndefined();
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'user@test.com');
    });

    it('should handle password reset errors', async () => {
      (sendPasswordResetEmail as any).mockRejectedValue({
        code: 'auth/invalid-email',
        message: 'Invalid email',
      });

      await expect(authService.resetPassword('invalid-email')).rejects.toMatchObject({
        code: 'auth/invalid-email',
      });
    });
  });

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      const mockUser = {
        email: 'user@test.com',
      };

      // Mock getCurrentUser
      vi.spyOn(authService, 'getCurrentUser').mockReturnValue(mockUser as any);
      (EmailAuthProvider.credential as any).mockReturnValue({});
      (reauthenticateWithCredential as any).mockResolvedValue(undefined);
      (updatePassword as any).mockResolvedValue(undefined);

      await expect(
        authService.updatePassword('oldpassword', 'newpassword')
      ).resolves.toBeUndefined();

      expect(EmailAuthProvider.credential).toHaveBeenCalledWith('user@test.com', 'oldpassword');
      expect(reauthenticateWithCredential).toHaveBeenCalled();
      expect(updatePassword).toHaveBeenCalled();
    });

    it('should handle update password errors', async () => {
      vi.spyOn(authService, 'getCurrentUser').mockReturnValue(null);

      await expect(
        authService.updatePassword('oldpassword', 'newpassword')
      ).rejects.toThrow('No authenticated user found');
    });
  });

  describe('updateUserProfile', () => {
    it('should successfully update user profile', async () => {
      const mockUser = {
        displayName: 'Old Name',
      };

      vi.spyOn(authService, 'getCurrentUser').mockReturnValue(mockUser as any);
      (setDoc as any).mockResolvedValue(undefined);
      (updateProfile as any).mockResolvedValue(undefined);

      const updates = {
        name: 'New Name',
        phone: '+9876543210',
      };

      await expect(
        authService.updateUserProfile('user-123', updates)
      ).resolves.toBeUndefined();

      expect(setDoc).toHaveBeenCalled();
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'New Name' });
    });
  });

  describe('onAuthStateChanged', () => {
    it('should set up auth state listener', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (onAuthStateChanged as any).mockReturnValue(mockUnsubscribe);

      const unsubscribe = authService.onAuthStateChanged(mockCallback);

      expect(onAuthStateChanged).toHaveBeenCalledWith(expect.anything(), mockCallback);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });
});
