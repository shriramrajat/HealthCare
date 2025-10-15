import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase functions before importing them
const mockDocRef = { id: 'mock-doc-id' };
const mockCollectionRef = { id: 'mock-collection-id' };

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, collectionName) => mockCollectionRef),
  doc: vi.fn((db, collectionName, docId) => mockDocRef),
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
  addDoc: vi.fn(() => Promise.resolve({ id: 'metric-1' })),
  serverTimestamp: vi.fn(),
}));

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firestoreService } from '../firebase/firestore';
import { mockPatientUser, mockDoctorUser, mockFirebaseResponses } from './test-utils';

describe('Firestore Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Health Metrics', () => {
    it('should get health metrics for a user', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'metric-1',
            data: () => ({
              type: 'blood_sugar',
              value: '120',
              unit: 'mg/dL',
              recordedAt: Timestamp.fromDate(new Date()),
              notes: 'Fasting glucose',
            }),
          },
        ],
      };

      (query as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue(mockQuerySnapshot);

      const result = await firestoreService.getHealthMetrics('user-123');

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'healthMetrics');
      expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(orderBy).toHaveBeenCalledWith('recordedAt', 'desc');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('blood_sugar');
    });

    it('should add a new health metric', async () => {
      const mockDocRef = { id: 'metric-1' };
      (addDoc as any).mockResolvedValue(mockDocRef);

      const metric = {
        userId: 'user-123',
        type: 'blood_pressure' as const,
        value: '120/80',
        unit: 'mmHg',
        recordedAt: new Date().toISOString(),
        notes: 'Normal reading',
      };

      const result = await firestoreService.addHealthMetric(metric);

      expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        userId: 'user-123',
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
      }));
      expect(result).toBe('metric-1');
    });

    it('should update a health metric', async () => {
      (updateDoc as any).mockResolvedValue(undefined);

      const updates = {
        value: '130/85',
        notes: 'Updated reading',
      };

      await expect(
        firestoreService.updateHealthMetric('metric-1', updates)
      ).resolves.toBeUndefined();

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should delete a health metric', async () => {
      (deleteDoc as any).mockResolvedValue(undefined);

      await expect(
        firestoreService.deleteHealthMetric('metric-1')
      ).resolves.toBeUndefined();

      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('Medications', () => {
    it('should get medications for a user', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'med-1',
            data: () => ({
              name: 'Metformin',
              dosage: '500mg',
              frequency: 'Twice daily',
              startDate: Timestamp.fromDate(new Date()),
              reminders: ['08:00', '20:00'],
              adherence: [true, true, false],
              notes: 'Take with meals',
            }),
          },
        ],
      };

      (query as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue(mockQuerySnapshot);

      const result = await firestoreService.getMedications('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Metformin');
      expect(result[0].dosage).toBe('500mg');
    });

    it('should add a new medication', async () => {
      const mockDocRef = { id: 'med-1' };
      (addDoc as any).mockResolvedValue(mockDocRef);

      const medication = {
        userId: 'user-123',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: '2024-01-01',
        reminders: ['08:00'],
        adherence: [true, true, true],
        notes: 'For blood pressure',
      };

      const result = await firestoreService.addMedication(medication);

      expect(addDoc).toHaveBeenCalled();
      expect(result).toBe('med-1');
    });

    it('should update a medication', async () => {
      (updateDoc as any).mockResolvedValue(undefined);

      const updates = {
        dosage: '20mg',
        notes: 'Increased dosage',
      };

      await expect(
        firestoreService.updateMedication('med-1', updates)
      ).resolves.toBeUndefined();

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should delete a medication', async () => {
      (deleteDoc as any).mockResolvedValue(undefined);

      await expect(
        firestoreService.deleteMedication('med-1')
      ).resolves.toBeUndefined();

      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('Symptoms', () => {
    it('should get symptoms for a user', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'symptom-1',
            data: () => ({
              userId: 'user-123',
              name: 'Headache',
              severity: 7,
              date: Timestamp.fromDate(new Date()),
              notes: 'Persistent headache',
              triggers: ['stress', 'lack of sleep'],
            }),
          },
        ],
      };

      (query as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue(mockQuerySnapshot);

      const result = await firestoreService.getSymptoms('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Headache');
      expect(result[0].severity).toBe(7);
    });

    it('should add a new symptom', async () => {
      const mockDocRef = { id: 'symptom-1' };
      (addDoc as any).mockResolvedValue(mockDocRef);

      const symptom = {
        userId: 'user-123',
        name: 'Fatigue',
        severity: 5,
        date: new Date().toISOString(),
        notes: 'Feeling tired',
        triggers: ['work stress'],
      };

      const result = await firestoreService.addSymptom(symptom);

      expect(addDoc).toHaveBeenCalled();
      expect(result).toBe('symptom-1');
    });
  });

  describe('Appointments', () => {
    it('should get appointments for a patient', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'apt-1',
            data: () => ({
              doctorId: 'doctor-123',
              patientId: 'patient-123',
              doctorName: 'Dr. Jane Doctor',
              patientName: 'John Patient',
              date: Timestamp.fromDate(new Date()),
              time: '14:30',
              type: 'teleconsultation',
              status: 'confirmed',
              notes: 'Routine check-up',
            }),
          },
        ],
      };

      (query as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue(mockQuerySnapshot);

      const result = await firestoreService.getAppointments('patient-123', 'patient');

      expect(where).toHaveBeenCalledWith('patientId', '==', 'patient-123');
      expect(result).toHaveLength(1);
      expect(result[0].patientId).toBe('patient-123');
    });

    it('should get appointments for a doctor', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'apt-1',
            data: () => ({
              doctorId: 'doctor-123',
              patientId: 'patient-123',
              doctorName: 'Dr. Jane Doctor',
              patientName: 'John Patient',
              date: Timestamp.fromDate(new Date()),
              time: '14:30',
              type: 'teleconsultation',
              status: 'confirmed',
              notes: 'Routine check-up',
            }),
          },
        ],
      };

      (query as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue(mockQuerySnapshot);

      const result = await firestoreService.getAppointments('doctor-123', 'doctor');

      expect(where).toHaveBeenCalledWith('doctorId', '==', 'doctor-123');
      expect(result).toHaveLength(1);
      expect(result[0].doctorId).toBe('doctor-123');
    });

    it('should add a new appointment', async () => {
      const mockDocRef = { id: 'apt-1' };
      (addDoc as any).mockResolvedValue(mockDocRef);

      const appointment = {
        doctorId: 'doctor-123',
        patientId: 'patient-123',
        doctorName: 'Dr. Jane Doctor',
        patientName: 'John Patient',
        date: '2024-12-15',
        time: '14:30',
        type: 'teleconsultation' as const,
        status: 'confirmed' as const,
        notes: 'Routine check-up',
      };

      const result = await firestoreService.addAppointment(appointment);

      expect(addDoc).toHaveBeenCalled();
      expect(result).toBe('apt-1');
    });

    it('should update an appointment', async () => {
      (updateDoc as any).mockResolvedValue(undefined);

      const updates = {
        status: 'completed' as const,
        notes: 'Appointment completed successfully',
      };

      await expect(
        firestoreService.updateAppointment('apt-1', updates)
      ).resolves.toBeUndefined();

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should delete an appointment', async () => {
      (deleteDoc as any).mockResolvedValue(undefined);

      await expect(
        firestoreService.deleteAppointment('apt-1')
      ).resolves.toBeUndefined();

      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('Reviews', () => {
    it('should get reviews for a doctor', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'review-1',
            data: () => ({
              doctorId: 'doctor-123',
              patientId: 'patient-123',
              doctorName: 'Dr. Jane Doctor',
              patientName: 'John Patient',
              rating: 5,
              comment: 'Excellent doctor!',
              date: Timestamp.fromDate(new Date()),
            }),
          },
        ],
      };

      (query as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue(mockQuerySnapshot);

      const result = await firestoreService.getReviews('doctor-123');

      expect(where).toHaveBeenCalledWith('doctorId', '==', 'doctor-123');
      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(5);
    });

    it('should add a new review', async () => {
      const mockDocRef = { id: 'review-1' };
      (addDoc as any).mockResolvedValue(mockDocRef);

      const review = {
        doctorId: 'doctor-123',
        patientId: 'patient-123',
        doctorName: 'Dr. Jane Doctor',
        patientName: 'John Patient',
        rating: 4,
        comment: 'Good experience',
        date: '2024-12-10',
      };

      const result = await firestoreService.addReview(review);

      expect(addDoc).toHaveBeenCalled();
      expect(result).toBe('review-1');
    });
  });

  describe('Educational Content', () => {
    it('should get all educational content', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'content-1',
            data: () => ({
              title: 'Diabetes Management',
              content: 'How to manage diabetes...',
              category: 'diabetes',
              readTime: '5 min',
              author: 'Dr. Smith',
              publishedAt: Timestamp.fromDate(new Date()),
            }),
          },
        ],
      };

      (query as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue(mockQuerySnapshot);

      const result = await firestoreService.getEducationalContent();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Diabetes Management');
    });

    it('should get educational content by category', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'content-1',
            data: () => ({
              title: 'Heart Health Tips',
              content: 'Tips for heart health...',
              category: 'heart_disease',
              readTime: '3 min',
              author: 'Dr. Johnson',
              publishedAt: Timestamp.fromDate(new Date()),
            }),
          },
        ],
      };

      (query as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue(mockQuerySnapshot);

      const result = await firestoreService.getEducationalContent('heart_disease');

      expect(where).toHaveBeenCalledWith('category', '==', 'heart_disease');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('heart_disease');
    });
  });

  describe('Notifications', () => {
    it('should get notifications for a user', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'notif-1',
            data: () => ({
              userId: 'user-123',
              title: 'Medication Reminder',
              message: 'Time to take your medication',
              type: 'info',
              read: false,
              createdAt: Timestamp.fromDate(new Date()),
            }),
          },
        ],
      };

      (query as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue(mockQuerySnapshot);

      const result = await firestoreService.getNotifications('user-123');

      expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Medication Reminder');
    });

    it('should add a new notification', async () => {
      const mockDocRef = { id: 'notif-1' };
      (addDoc as any).mockResolvedValue(mockDocRef);

      const notification = {
        userId: 'user-123',
        title: 'Appointment Reminder',
        message: 'You have an appointment tomorrow',
        type: 'info' as const,
        read: false,
      };

      const result = await firestoreService.addNotification(notification);

      expect(addDoc).toHaveBeenCalled();
      expect(result).toBe('notif-1');
    });

    it('should mark notification as read', async () => {
      (updateDoc as any).mockResolvedValue(undefined);

      await expect(
        firestoreService.markNotificationAsRead('notif-1')
      ).resolves.toBeUndefined();

      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { read: true });
    });
  });

  describe('Users', () => {
    it('should get a user by ID', async () => {
      (getDoc as any).mockResolvedValue({
        exists: () => true,
        data: () => mockPatientUser,
      });

      const result = await firestoreService.getUser('user-123');

      expect(getDoc).toHaveBeenCalled();
      expect(result).toEqual({ id: 'user-123', ...mockPatientUser });
    });

    it('should return null if user does not exist', async () => {
      (getDoc as any).mockResolvedValue({
        exists: () => false,
      });

      const result = await firestoreService.getUser('nonexistent-user');

      expect(result).toBeNull();
    });

    it('should get all doctors', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'doctor-123',
            data: () => mockDoctorUser,
          },
        ],
      };

      (query as any).mockReturnValue({});
      (getDocs as any).mockResolvedValue(mockQuerySnapshot);

      const result = await firestoreService.getDoctors();

      expect(where).toHaveBeenCalledWith('role', '==', 'doctor');
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('doctor');
    });
  });

  describe('Error Handling', () => {
    it('should handle Firestore errors gracefully', async () => {
      (query as any).mockReturnValue({});
      (getDocs as any).mockRejectedValue(new Error('Firestore connection failed'));

      await expect(
        firestoreService.getHealthMetrics('user-123')
      ).rejects.toThrow('Firestore connection failed');
    });
  });
});
