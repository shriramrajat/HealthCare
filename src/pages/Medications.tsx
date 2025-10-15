import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Medication } from '../types';
import { firestoreService } from '../firebase/firestore';
import MedicationForm from '../components/forms/MedicationForm';
import AnimatedModal from '../components/ui/AnimatedModal';
import { 
  Pill, 
  Plus, 
  Clock, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Edit3,
  Trash2
} from 'lucide-react';

const Medications: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const loadMedications = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const medicationsData = await firestoreService.getMedications(user.id);
        setMedications(medicationsData);
      } catch (error) {
        console.error('Error loading medications:', error);
        addNotification({
          title: 'Error Loading Medications',
          message: 'Failed to load your medications. Please try again.',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMedications();
  }, [user, addNotification]);

  const calculateAdherenceRate = (adherence: boolean[]) => {
    if (adherence.length === 0) return 100;
    const takenCount = adherence.filter(taken => taken).length;
    return Math.round((takenCount / adherence.length) * 100);
  };

  const getOverallAdherenceRate = () => {
    const allAdherence = medications.reduce((acc, med) => [...acc, ...med.adherence], [] as boolean[]);
    return calculateAdherenceRate(allAdherence);
  };

  const getUpcomingMedications = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    return medications.flatMap(med => 
      med.reminders.map(reminder => {
        const [hour, minute] = reminder.split(':').map(Number);
        const reminderTime = hour * 60 + minute;
        const isUpcoming = reminderTime > currentTime && reminderTime - currentTime <= 60;
        
        return {
          medication: med,
          time: reminder,
          isUpcoming
        };
      })
    ).filter(item => item.isUpcoming);
  };

  const handleMarkAsTaken = async (medicationId: string) => {
    try {
      const medication = medications.find(med => med.id === medicationId);
      if (!medication) return;

      const updatedAdherence = [...medication.adherence, true];
      await firestoreService.updateMedication(medicationId, { adherence: updatedAdherence });
      
      setMedications(prev => 
        prev.map(med => 
          med.id === medicationId 
            ? { ...med, adherence: updatedAdherence }
            : med
        )
      );
      
      addNotification({
        title: 'Medication Taken',
        message: 'Great job staying on track with your medication!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating medication:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to update medication. Please try again.',
        type: 'error'
      });
    }
  };

  const handleDeleteMedication = async (medicationId: string) => {
    try {
      await firestoreService.deleteMedication(medicationId);
      setMedications(prev => prev.filter(med => med.id !== medicationId));
      
      addNotification({
        title: 'Medication Removed',
        message: 'The medication has been removed from your list.',
        type: 'info'
      });
    } catch (error) {
      console.error('Error deleting medication:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to delete medication. Please try again.',
        type: 'error'
      });
    }
  };

  const handleAddMedication = async (formData: any) => {
    if (!user?.id) return;

    try {
      setFormLoading(true);
      
      const medicationData = {
        ...formData,
        userId: user.id,
        adherence: [] as boolean[]
      };

      const medicationId = await firestoreService.addMedication(medicationData);
      
      const newMedication: Medication = {
        id: medicationId,
        ...medicationData
      };

      setMedications(prev => [newMedication, ...prev]);
      setShowAddForm(false);
      
      addNotification({
        title: 'Medication Added',
        message: `${formData.name} has been added to your medication list.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding medication:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to add medication. Please try again.',
        type: 'error'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateMedication = async (formData: any) => {
    if (!selectedMedication) return;

    try {
      setFormLoading(true);
      
      await firestoreService.updateMedication(selectedMedication.id, formData);
      
      setMedications(prev => 
        prev.map(med => 
          med.id === selectedMedication.id 
            ? { ...med, ...formData }
            : med
        )
      );
      
      setSelectedMedication(null);
      
      addNotification({
        title: 'Medication Updated',
        message: `${formData.name} has been updated successfully.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating medication:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to update medication. Please try again.',
        type: 'error'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setSelectedMedication(null);
  };

  const upcomingMeds = getUpcomingMedications();
  const overallAdherence = getOverallAdherenceRate();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-600 mt-1">
            Manage your medications and track your adherence
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Pill className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Active Medications</p>
              <p className="text-2xl font-bold text-gray-900">{medications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Adherence Rate</p>
              <p className="text-2xl font-bold text-green-600">{overallAdherence}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Next Dose</p>
              <p className="text-2xl font-bold text-orange-600">
                {upcomingMeds.length > 0 ? upcomingMeds[0].time : 'None'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Daily Doses</p>
              <p className="text-2xl font-bold text-purple-600">
                {medications.reduce((acc, med) => acc + med.reminders.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Medications */}
      {upcomingMeds.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <h2 className="text-lg font-semibold text-yellow-800">Medication Reminders</h2>
          </div>
          
          <div className="space-y-3">
            {upcomingMeds.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Pill className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{item.medication.name}</p>
                    <p className="text-sm text-gray-600">{item.medication.dosage} - {item.time}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleMarkAsTaken(item.medication.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark as Taken
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication List */}
      <div className="space-y-6">
        {medications.map((medication) => (
          <div key={medication.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Pill className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                    <p className="text-sm text-gray-600">{medication.dosage} • {medication.frequency}</p>
                  </div>
                </div>
                
                {medication.notes && (
                  <p className="text-sm text-gray-600 ml-15">{medication.notes}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedMedication(medication)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteMedication(medication.id)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Schedule */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Schedule</h4>
                <div className="space-y-1">
                  {medication.reminders.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Duration</h4>
                <div className="text-sm text-gray-600">
                  <p>Started: {new Date(medication.startDate).toLocaleDateString()}</p>
                  {medication.endDate && (
                    <p>Ends: {new Date(medication.endDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Adherence */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Adherence ({calculateAdherenceRate(medication.adherence)}%)
                </h4>
                <div className="flex space-x-1">
                  {medication.adherence.slice(-14).map((taken, index) => (
                    <div
                      key={index}
                      className={`w-3 h-6 rounded-sm ${
                        taken ? 'bg-green-500' : 'bg-red-300'
                      }`}
                      title={taken ? 'Taken' : 'Missed'}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Last 14 doses</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">
                    {medication.adherence.filter(taken => taken).length} doses taken
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-600">
                    {medication.adherence.filter(taken => !taken).length} doses missed
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => handleMarkAsTaken(medication.id)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark as Taken
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {medications.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medications added</h3>
          <p className="text-gray-600 mb-6">
            Start tracking your medications to improve adherence and health outcomes.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Medication
          </button>
        </div>
      )}

      {/* Add/Edit Medication Form Modal */}
      <AnimatedModal
        isOpen={showAddForm || selectedMedication !== null}
        onClose={handleFormCancel}
        title={selectedMedication ? 'Edit Medication' : 'Add New Medication'}
        size="lg"
      >
        <MedicationForm
          medication={selectedMedication || undefined}
          onSubmit={selectedMedication ? handleUpdateMedication : handleAddMedication}
          onCancel={handleFormCancel}
          isLoading={formLoading}
          existingMedications={medications}
        />
      </AnimatedModal>
    </div>
  );
};

export default Medications;