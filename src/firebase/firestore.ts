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
  startAfter,
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  serverTimestamp,
  onSnapshot,
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
  User,
  MedicalDocument,
  ChatMessage,
  ConsultationRecord
} from '../types';

// Pagination interface
export interface PaginationOptions {
  limit?: number;
  lastDoc?: QueryDocumentSnapshot;
}

export interface PaginatedResult<T> {
  data: T[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

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
  // Admin: Get Pending Doctors
  async getPendingDoctors(): Promise<User[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where('role', '==', 'doctor'),
        // where('verified', '==', false) // Note: If confirmed field is missing, it might not return. simpler to filter client side or check how users are created.
        // Let's assume verified is either false or undefined.
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as User))
        .filter(user => !user.verified); // Filter client-side to catch undefined
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
      throw error;
    }
  },

  // Admin: Verify Doctor
  async verifyDoctor(userId: string) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        verified: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error verifying doctor:', error);
      throw error;
    }
  },

  // Health Metrics
  async getHealthMetrics(userId: string, options?: PaginationOptions): Promise<PaginatedResult<HealthMetric>> {
    try {
      const pageLimit = options?.limit || 50;
      let q = query(
        collection(db, COLLECTIONS.HEALTH_METRICS),
        where('userId', '==', userId),
        orderBy('recordedAt', 'desc'),
        limit(pageLimit + 1) // Fetch one extra to check if there are more
      );

      if (options?.lastDoc) {
        q = query(
          collection(db, COLLECTIONS.HEALTH_METRICS),
          where('userId', '==', userId),
          orderBy('recordedAt', 'desc'),
          startAfter(options.lastDoc),
          limit(pageLimit + 1)
        );
      }

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      const hasMore = docs.length > pageLimit;
      const data = docs.slice(0, pageLimit).map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        recordedAt: doc.data().recordedAt?.toDate?.()?.toISOString() || doc.data().recordedAt
      })) as HealthMetric[];

      return {
        data,
        lastDoc: docs.length > 0 ? docs[Math.min(pageLimit - 1, docs.length - 1)] : null,
        hasMore
      };
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
  async getMedications(userId: string, options?: PaginationOptions): Promise<PaginatedResult<Medication>> {
    try {
      const pageLimit = options?.limit || 50;
      let q = query(
        collection(db, COLLECTIONS.MEDICATIONS),
        where('userId', '==', userId),
        orderBy('startDate', 'desc'),
        limit(pageLimit + 1)
      );

      if (options?.lastDoc) {
        q = query(
          collection(db, COLLECTIONS.MEDICATIONS),
          where('userId', '==', userId),
          orderBy('startDate', 'desc'),
          startAfter(options.lastDoc),
          limit(pageLimit + 1)
        );
      }

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      const hasMore = docs.length > pageLimit;
      const data = docs.slice(0, pageLimit).map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate?.()?.toISOString() || doc.data().startDate,
        endDate: doc.data().endDate?.toDate?.()?.toISOString() || doc.data().endDate
      })) as Medication[];

      return {
        data,
        lastDoc: docs.length > 0 ? docs[Math.min(pageLimit - 1, docs.length - 1)] : null,
        hasMore
      };
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
  async getSymptoms(userId: string, options?: PaginationOptions): Promise<PaginatedResult<Symptom>> {
    try {
      const pageLimit = options?.limit || 50;
      let q = query(
        collection(db, COLLECTIONS.SYMPTOMS),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(pageLimit + 1)
      );

      if (options?.lastDoc) {
        q = query(
          collection(db, COLLECTIONS.SYMPTOMS),
          where('userId', '==', userId),
          orderBy('date', 'desc'),
          startAfter(options.lastDoc),
          limit(pageLimit + 1)
        );
      }

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      const hasMore = docs.length > pageLimit;
      const data = docs.slice(0, pageLimit).map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date
      })) as Symptom[];

      return {
        data,
        lastDoc: docs.length > 0 ? docs[Math.min(pageLimit - 1, docs.length - 1)] : null,
        hasMore
      };
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

  async getReviewsByPatient(patientId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REVIEWS),
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date
      })) as Review[];
    } catch (error) {
      console.error('Error getting patient reviews:', error);
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

  async updateReview(id: string, updates: Partial<Review>): Promise<void> {
    try {
      const reviewRef = doc(db, COLLECTIONS.REVIEWS, id);
      const updateData: any = { ...updates };

      if (updates.date) {
        updateData.date = Timestamp.fromDate(new Date(updates.date));
      }
      if (updates.editedAt) {
        updateData.editedAt = Timestamp.fromDate(new Date(updates.editedAt));
      }
      if (updates.response?.date) {
        updateData.response = {
          ...updates.response,
          date: Timestamp.fromDate(new Date(updates.response.date))
        };
      }

      await updateDoc(reviewRef, updateData);
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  async addReviewResponse(reviewId: string, response: { message: string; doctorName: string }): Promise<void> {
    try {
      const reviewRef = doc(db, COLLECTIONS.REVIEWS, reviewId);
      await updateDoc(reviewRef, {
        response: {
          ...response,
          date: serverTimestamp()
        }
      });
    } catch (error) {
      console.error('Error adding review response:', error);
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

  async addEducationalContent(content: Omit<EducationalContent, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.EDUCATIONAL_CONTENT), {
        ...content,
        publishedAt: Timestamp.fromDate(new Date(content.publishedAt))
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding educational content:', error);
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

  async addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'> & Partial<Pick<Notification, 'createdAt' | 'read'>>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        ...notification,
        read: notification.read || false,
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
  },

  // Consultation Records
  async getConsultationRecords(userId: string, userRole: 'patient' | 'doctor') {
    try {
      const field = userRole === 'patient' ? 'patientId' : 'doctorId';
      const q = query(
        collection(db, 'consultationRecords'),
        where(field, '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date
      }));
    } catch (error) {
      console.error('Error getting consultation records:', error);
      throw error;
    }
  },

  async addConsultationRecord(record: Omit<ConsultationRecord, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'consultationRecords'), {
        ...record,
        date: Timestamp.fromDate(new Date(record.date))
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding consultation record:', error);
      throw error;
    }
  },

  // Teleconsultation Settings
  async getTeleconsultationSettings(userId: string) {
    try {
      const settingsDoc = await getDoc(doc(db, 'teleconsultationSettings', userId));
      if (settingsDoc.exists()) {
        return { id: settingsDoc.id, ...settingsDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting teleconsultation settings:', error);
      throw error;
    }
  },

  async saveTeleconsultationSettings(userId: string, settings: any) {
    try {
      const settingsRef = doc(db, 'teleconsultationSettings', userId);
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving teleconsultation settings:', error);
      throw error;
    }
  },

  // Add Medical Document
  async addMedicalDocument(docData: Omit<MedicalDocument, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'medical_documents'), docData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding medical document:', error);
      throw error;
    }
  },

  // Get Medical Documents for a User
  async getMedicalDocuments(userId: string): Promise<MedicalDocument[]> {
    try {
      const q = query(
        collection(db, 'medical_documents'),
        where('userId', '==', userId),
        orderBy('uploadedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MedicalDocument));
    } catch (error) {
      console.error('Error fetching medical documents:', error);
      throw error;
    }
  },

  // --- Chat Functionality ---

  async sendMessage(messageData: Omit<ChatMessage, 'id'>) {
    try {
      await addDoc(collection(db, `consultations/${messageData.consultationId}/messages`), {
        ...messageData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  subscribeToChat(consultationId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(
      collection(db, `consultations/${consultationId}/messages`),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'
      } as ChatMessage));
      callback(messages);
    });
  },

  // --- Notifications System ---

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      callback(notifications);
    });
  },

  async deleteNotification(notificationId: string) {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};
