import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

// Mock user data for testing
export const mockPatientUser = {
  id: 'patient-123',
  email: 'patient@test.com',
  name: 'John Patient',
  role: 'patient' as const,
  phone: '+1234567890',
  conditions: ['Diabetes Type 2', 'Hypertension'],
  avatar: '',
};

export const mockDoctorUser = {
  id: 'doctor-123',
  email: 'doctor@test.com',
  name: 'Dr. Jane Doctor',
  role: 'doctor' as const,
  phone: '+1234567890',
  specialization: 'Cardiology',
  avatar: '',
};

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock Firebase responses
export const mockFirebaseResponses = {
  auth: {
    signIn: {
      user: mockPatientUser,
    },
    signUp: {
      user: mockPatientUser,
    },
  },
  firestore: {
    healthMetrics: [
      {
        id: 'metric-1',
        type: 'blood_sugar',
        value: '120',
        unit: 'mg/dL',
        recordedAt: new Date().toISOString(),
        notes: 'Fasting glucose level',
      },
    ],
    medications: [
      {
        id: 'med-1',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: '2024-01-01',
        reminders: ['08:00', '20:00'],
        adherence: [true, true, false, true],
        notes: 'Take with meals',
      },
    ],
    appointments: [
      {
        id: 'apt-1',
        doctorId: 'doctor-123',
        patientId: 'patient-123',
        doctorName: 'Dr. Jane Doctor',
        patientName: 'John Patient',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:30',
        type: 'teleconsultation',
        status: 'confirmed',
        notes: 'Routine check-up',
      },
    ],
  },
};

export * from '@testing-library/react';
export { customRender as render };
