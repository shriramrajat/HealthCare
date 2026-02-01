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
  userId?: string;
  type: 'blood_sugar' | 'blood_pressure' | 'weight' | 'heart_rate' | 'steps' | 'sleep' | 'temperature';
  value: string;
  unit: string;
  recordedAt: string;
  notes?: string;
}

export interface Medication {
  id: string;
  userId: string;
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
  userId?: string;
  name: string;
  severity: number; // 1-10 scale
  date: string;
  time?: string;
  notes?: string;
  triggers?: string[];
  duration?: number; // in minutes
  location?: string;
  photos?: string[];
  createdAt?: string;
  updatedAt?: string;
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
  categories?: {
    communication: number;
    expertise: number;
    punctuality: number;
    overall: number;
  };
  anonymous?: boolean;
  response?: {
    message: string;
    date: string;
    doctorName: string;
  };
  edited?: boolean;
  editedAt?: string;
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

export interface ConsultationRecord {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  duration: number; // in minutes
  type: 'teleconsultation' | 'in-person';
  status: 'completed' | 'cancelled' | 'no-show';
  notes: string;
  prescription?: string;
  followUpRequired: boolean;
  recordingUrl?: string;
  diagnosis?: string;
  symptoms?: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
  };
}

export interface TeleconsultationSettings {
  userId: string;
  videoQuality: 'low' | 'medium' | 'high';
  audioEnabled: boolean;
  videoEnabled: boolean;
  notifications: boolean;
  autoRecord: boolean;
  preferredLanguage: string;
  timezone: string;
}

export interface ChatMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  role: 'doctor' | 'patient';
}


export interface MedicalDocument {
  id: string;
  userId: string;
  name: string;
  type: 'lab_report' | 'prescription' | 'x_ray' | 'other';
  url: string;
  uploadedAt: string;
  size: number;
  path: string; // Storage path to allow deletion
}