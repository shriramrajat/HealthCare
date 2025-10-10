import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './config';
import { 
  HealthMetric, 
  Medication, 
  Symptom, 
  Appointment, 
  Review, 
  EducationalContent,
  Notification,
  User
} from '../types';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  HEALTH_METRICS: 'healthMetrics',
  MEDICATIONS: 'medications',
  SYMPTOMS: 'symptoms',
  APPOINTMENTS: 'appointments',
  REVIEWS: 'reviews',
  EDUCATIONAL_CONTENT: 'educationalContent',
  NOTIFICATIONS: 'notifications'
};

export const firestoreService = {
  // Health Metrics
  async getHealthMetrics(userId: string): Promise<HealthMetric[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.HEALTH_METRICS),
        where('userId', '==', userId),
        orderBy('recordedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        recordedAt: doc.data().recordedAt?.toDate?.()?.toISOString() || doc.data().recordedAt
      })) as HealthMetric[];
    } catch (error) {
      console.error('Error getting health metrics:', error);
      throw error;
    }
  },

  async addHealthMetric(metric: Omit<HealthMetric, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.HEALTH_METRICS), {
        ...metric,
        recordedAt: Timestamp.fromDate(new Date(metric.recordedAt))
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding health metric:', error);
      throw error;
    }
  },

  async updateHealthMetric(id: string, updates: Partial<HealthMetric>): Promise<void> {
    try {
      const metricRef = doc(db, COLLECTIONS.HEALTH_METRICS, id);
      const updateData: any = { ...updates };
      
      if (updates.recordedAt) {
        updateData.recordedAt = Timestamp.fromDate(new Date(updates.recordedAt));
      }
      
      await updateDoc(metricRef, updateData);
    } catch (error) {
      console.error('Error updating health metric:', error);
      throw error;
    }
  },

  async deleteHealthMetric(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.HEALTH_METRICS, id));
    } catch (error) {
      console.error('Error deleting health metric:', error);
      throw error;
    }
  },

  // Medications
  async getMedications(userId: string): Promise<Medication[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.MEDICATIONS),
        where('userId', '==', userId),
        orderBy('startDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate?.()?.toISOString() || doc.data().startDate,
        endDate: doc.data().endDate?.toDate?.()?.toISOString() || doc.data().endDate
      })) as Medication[];
    } catch (error) {
      console.error('Error getting medications:', error);
      throw error;
    }
  },

  async addMedication(medication: Omit<Medication, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.MEDICATIONS), {
        ...medication,
        startDate: Timestamp.fromDate(new Date(medication.startDate)),
        endDate: medication.endDate ? Timestamp.fromDate(new Date(medication.endDate)) : null
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  },

  async updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
    try {
      const medicationRef = doc(db, COLLECTIONS.MEDICATIONS, id);
      const updateData: any = { ...updates };
      
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(updates.startDate));
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(new Date(updates.endDate));
      }
      
      await updateDoc(medicationRef, updateData);
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  },

  async deleteMedication(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.MEDICATIONS, id));
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  },

  // Symptoms
  async getSymptoms(userId: string): Promise<Symptom[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.SYMPTOMS),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date
      })) as Symptom[];
    } catch (error) {
      console.error('Error getting symptoms:', error);
      throw error;
    }
  },

  async addSymptom(symptom: Omit<Symptom, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.SYMPTOMS), {
        ...symptom,
        date: Timestamp.fromDate(new Date(symptom.date))
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding symptom:', error);
      throw error;
    }
  },

  // Appointments
  async getAppointments(userId: string, userRole: 'patient' | 'doctor'): Promise<Appointment[]> {
    try {
      const field = userRole === 'patient' ? 'patientId' : 'doctorId';
      const q = query(
        collection(db, COLLECTIONS.APPOINTMENTS),
        where(field, '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date
      })) as Appointment[];
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  },

  async addAppointment(appointment: Omit<Appointment, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), {
        ...appointment,
        date: Timestamp.fromDate(new Date(appointment.date))
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<void> {
    try {
      const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, id);
      const updateData: any = { ...updates };
      
      if (updates.date) {
        updateData.date = Timestamp.fromDate(new Date(updates.date));
      }
      
      await updateDoc(appointmentRef, updateData);
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  async deleteAppointment(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.APPOINTMENTS, id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },

  // Reviews
  async getReviews(doctorId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REVIEWS),
        where('doctorId', '==', doctorId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date
      })) as Review[];
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  },

  async addReview(review: Omit<Review, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), {
        ...review,
        date: Timestamp.fromDate(new Date(review.date))
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  // Educational Content
  async getEducationalContent(category?: string): Promise<EducationalContent[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.EDUCATIONAL_CONTENT),
        orderBy('publishedAt', 'desc')
      );
      
      if (category) {
        q = query(
          collection(db, COLLECTIONS.EDUCATIONAL_CONTENT),
          where('category', '==', category),
          orderBy('publishedAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        publishedAt: doc.data().publishedAt?.toDate?.()?.toISOString() || doc.data().publishedAt
      })) as EducationalContent[];
    } catch (error) {
      console.error('Error getting educational content:', error);
      throw error;
    }
  },

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
      })) as Notification[];
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  async addNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        ...notification,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  },

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Users
  async getUser(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  async getDoctors(): Promise<User[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where('role', '==', 'doctor')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error) {
      console.error('Error getting doctors:', error);
      throw error;
    }
  }
};
