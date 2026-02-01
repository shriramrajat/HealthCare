import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Notification } from '../types';
import NotificationContainer from '../components/NotificationContainer';
import { useAuth } from './AuthContext';
import { firestoreService } from '../firebase/firestore';

interface NotificationContextType {
  notifications: Notification[]; // Persistent list for Notification Center
  toasts: Notification[]; // Ephemeral list for Toast Container
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void; // Adds to toast
  addSystemNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => Promise<void>; // Adds to DB
  removeToast: (id: string) => void;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllToasts: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [persistentNotifications, setPersistentNotifications] = useState<Notification[]>([]);

  // Load persistent notifications from Firestore
  useEffect(() => {
    if (!user) {
      setPersistentNotifications([]);
      return;
    }

    const unsubscribe = firestoreService.subscribeToNotifications(user.id, (newNotifications) => {
      // Check for received notifications that are NEW (created in last 5 seconds) to show as toast
      // This is a bit tricky with sync delays, so maybe we just rely on the sender to also show a toast?
      // Or we can just calculate diff.
      // For now, let's keep it simple: DB syncs the list. 
      // If we want "Real-time" toast from DB (e.g. triggered by another user), we'd need to track "last known max ID" or similar.
      // For this implementation, we will trust that actions triggered by THIS user show their own toasts, 
      // and BACKGROUND actions (like a doctor changing status) might need a separate listener or just update the list silently.

      setPersistentNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = persistentNotifications.filter(n => !n.read).length;

  // Add ephemeral toast
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setToasts(prev => [newNotification, ...prev]);
  }, []);

  // Add persistent notification to DB
  const addSystemNotification = useCallback(async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    if (!user) return;

    try {
      // Also show a toast for immediate feedback
      addNotification(notification);

      await firestoreService.addNotification({
        ...notification,
        userId: user.id
      });
    } catch (error) {
      console.error("Failed to create system notification", error);
    }
  }, [user, addNotification]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setPersistentNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    try {
      await firestoreService.markNotificationAsRead(id);
    } catch (error) {
      // Revert if failed? simplified for now
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    setPersistentNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await firestoreService.deleteNotification(id);
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications: persistentNotifications,
      toasts,
      unreadCount,
      addNotification,
      addSystemNotification,
      removeToast,
      markAsRead,
      deleteNotification,
      clearAllToasts
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};