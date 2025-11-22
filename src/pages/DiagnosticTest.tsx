import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../firebase/firestore';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const DiagnosticTest: React.FC = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => t.name === name ? { name, status, message, details } : t);
      }
      return [...prev, { name, status, message, details }];
    });
  };

  const runDiagnostics = async () => {
    setRunning(true);
    setTests([]);

    // Test 1: Check Authentication
    updateTest('Authentication', 'pending', 'Checking authentication...');
    if (user) {
      updateTest('Authentication', 'success', `Authenticated as ${user.email}`, `User ID: ${user.id}`);
    } else {
      updateTest('Authentication', 'error', 'Not authenticated', 'Please log in to test data operations');
      setRunning(false);
      return;
    }

    // Test 2: Test Firestore Connection
    updateTest('Firestore Connection', 'pending', 'Testing Firestore connection...');
    try {
      const testRef = await addDoc(collection(db, 'test'), {
        message: 'Connection test',
        timestamp: new Date().toISOString()
      });
      updateTest('Firestore Connection', 'success', 'Firestore connection successful', `Test doc ID: ${testRef.id}`);
    } catch (error: any) {
      updateTest('Firestore Connection', 'error', 'Firestore connection failed', error.message);
    }

    // Test 3: Test Health Metrics
    updateTest('Health Metrics', 'pending', 'Testing health metrics...');
    try {
      const metricData = {
        userId: user.id,
        type: 'blood_pressure' as const,
        value: '120/80',
        unit: 'mmHg',
        recordedAt: new Date().toISOString()
      };
      const metricId = await firestoreService.addHealthMetric(metricData);
      updateTest('Health Metrics', 'success', 'Health metric added successfully', `Metric ID: ${metricId}`);
      
      // Try to read it back
      const metrics = await firestoreService.getHealthMetrics(user.id);
      updateTest('Health Metrics Read', 'success', `Retrieved ${metrics.length} health metrics`);
    } catch (error: any) {
      updateTest('Health Metrics', 'error', 'Failed to add health metric', `${error.code}: ${error.message}`);
    }

    // Test 4: Test Medications
    updateTest('Medications', 'pending', 'Testing medications...');
    try {
      const medicationData = {
        userId: user.id,
        name: 'Test Medication',
        dosage: '10mg',
        frequency: 'once_daily',
        startDate: new Date().toISOString(),
        reminders: ['08:00'],
        adherence: []
      };
      const medId = await firestoreService.addMedication(medicationData);
      updateTest('Medications', 'success', 'Medication added successfully', `Medication ID: ${medId}`);
      
      // Try to read it back
      const medications = await firestoreService.getMedications(user.id);
      updateTest('Medications Read', 'success', `Retrieved ${medications.length} medications`);
    } catch (error: any) {
      updateTest('Medications', 'error', 'Failed to add medication', `${error.code}: ${error.message}`);
    }

    // Test 5: Test Symptoms
    updateTest('Symptoms', 'pending', 'Testing symptoms...');
    try {
      const symptomData = {
        userId: user.id,
        name: 'Test Symptom',
        severity: 5,
        date: new Date().toISOString(),
        triggers: ['test']
      };
      const symptomId = await firestoreService.addSymptom(symptomData);
      updateTest('Symptoms', 'success', 'Symptom added successfully', `Symptom ID: ${symptomId}`);
      
      // Try to read it back
      const symptoms = await firestoreService.getSymptoms(user.id);
      updateTest('Symptoms Read', 'success', `Retrieved ${symptoms.length} symptoms`);
    } catch (error: any) {
      updateTest('Symptoms', 'error', 'Failed to add symptom', `${error.code}: ${error.message}`);
    }

    // Test 6: Test Notifications
    updateTest('Notifications', 'pending', 'Testing notifications...');
    try {
      const notificationData = {
        userId: user.id,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info' as const,
        read: false,
        createdAt: new Date().toISOString()
      };
      const notifId = await firestoreService.addNotification(notificationData);
      updateTest('Notifications', 'success', 'Notification added successfully', `Notification ID: ${notifId}`);
      
      // Try to read it back
      const notifications = await firestoreService.getNotifications(user.id);
      updateTest('Notifications Read', 'success', `Retrieved ${notifications.length} notifications`);
    } catch (error: any) {
      updateTest('Notifications', 'error', 'Failed to add notification', `${error.code}: ${error.message}`);
    }

    // Test 7: Check Firestore Rules
    updateTest('Firestore Rules', 'pending', 'Checking Firestore rules...');
    try {
      const collections = await getDocs(collection(db, 'users'));
      updateTest('Firestore Rules', 'success', `Can access users collection (${collections.size} docs)`);
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        updateTest('Firestore Rules', 'warning', 'Permission denied for users collection', 'This is expected if rules are properly configured');
      } else {
        updateTest('Firestore Rules', 'error', 'Error checking rules', error.message);
      }
    }

    setRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'pending':
        return <Loader className="h-5 w-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Firebase Diagnostic Test</h1>
        <p className="text-gray-600 mb-6">
          This page tests the Firebase connection, authentication, and data operations.
        </p>

        <button
          onClick={runDiagnostics}
          disabled={running || !user}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-6"
        >
          {running ? 'Running Tests...' : 'Run Diagnostic Tests'}
        </button>

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800">Please log in to run diagnostic tests</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStatusColor(test.status)}`}
            >
              <div className="flex items-start space-x-3">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{test.name}</h3>
                  <p className="text-sm text-gray-700 mt-1">{test.message}</p>
                  {test.details && (
                    <p className="text-xs text-gray-600 mt-2 font-mono bg-white bg-opacity-50 p-2 rounded">
                      {test.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {tests.length > 0 && !running && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {tests.filter(t => t.status === 'success').length}
                </p>
                <p className="text-sm text-gray-600">Passed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {tests.filter(t => t.status === 'error').length}
                </p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {tests.filter(t => t.status === 'warning').length}
                </p>
                <p className="text-sm text-gray-600">Warnings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {tests.filter(t => t.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticTest;
