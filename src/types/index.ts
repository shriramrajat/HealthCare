export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
  phone?: string;
  specialization?: string; // for doctors
  conditions?: string[]; // for patients
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface HealthMetric {
  id: string;
  type: 'blood_sugar' | 'blood_pressure' | 'weight' | 'heart_rate' | 'steps' | 'sleep';
  value: string;
  unit: string;
  recordedAt: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  reminders: string[];
  adherence: boolean[];
  notes?: string;
}

export interface Symptom {
  id: string;
  name: string;
  severity: number; // 1-10 scale
  date: string;
  notes?: string;
  triggers?: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  type: 'in-person' | 'teleconsultation';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface EducationalContent {
  id: string;
  title: string;
  content: string;
  category: 'diabetes' | 'hypertension' | 'heart_disease' | 'nutrition' | 'exercise' | 'mental_health';
  readTime: string;
  author: string;
  publishedAt: string;
}