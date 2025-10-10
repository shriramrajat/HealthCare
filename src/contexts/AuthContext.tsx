import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthContextType, User } from '../types';
import { authService } from '../firebase/auth';
import { firestoreService } from '../firebase/firestore';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userData = await firestoreService.getUser(firebaseUser.uid);
          if (userData) {
            setUser(userData as User);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const userData = await authService.signIn(email, password);
    setUser(userData);
    return userData;
  };

  const register = async (email: string, password: string, userData: Partial<User>): Promise<User> => {
    const newUser = await authService.signUp(email, password, userData);
    setUser(newUser);
    return newUser;
  };

  const logout = async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    await authService.updateUserProfile(user.id, updates);
    setUser({ ...user, ...updates });
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    await authService.updatePassword(currentPassword, newPassword);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};