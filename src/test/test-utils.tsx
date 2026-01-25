import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { AnimationProvider } from '../contexts/AnimationContext';
import { User, HealthMetric, Medication, Appointment } from '../types';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AnimationProvider>
            {children}
          </AnimationProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mocks
export const mockPatientUser: User = {
  id: 'user-123',
  email: 'patient@test.com',
  name: 'John Patient',
  role: 'patient',
  phone: '+1234567890',
  conditions: ['Hypertension', 'Type 2 Diabetes'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockDoctorUser: User = {
  id: 'doctor-123',
  email: 'doctor@test.com',
  name: 'Dr. Jane Doctor',
  role: 'doctor',
  phone: '+0987654321',
  specialization: 'Cardiology',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockFirebaseResponses = {
  user: mockPatientUser,
  healthMetrics: [
    {
      id: 'metric-1',
      userId: 'user-123',
      type: 'blood_sugar',
      value: '120',
      unit: 'mg/dL',
      recordedAt: '2024-01-01T12:00:00.000Z',
      notes: 'Fasting glucose',
    } as HealthMetric,
  ],
  medications: [
    {
      id: 'med-1',
      userId: 'user-123',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      startDate: '2024-01-01T00:00:00.000Z',
      reminders: ['08:00', '20:00'],
      adherence: [true, true, false, true],
      notes: 'Take with meals',
    } as Medication,
  ],
  appointments: [
    {
      id: 'apt-1',
      doctorId: 'doctor-123',
      patientId: 'user-123',
      doctorName: 'Dr. Jane Doctor',
      patientName: 'John Patient',
      date: '2024-01-15T14:30:00.000Z',
      time: '14:30',
      type: 'teleconsultation',
      status: 'confirmed',
      notes: 'Routine check-up',
    } as Appointment,
  ],
};