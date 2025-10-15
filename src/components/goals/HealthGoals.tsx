import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { firestoreService } from '../../firebase/firestore';

import AnimatedButton from '../ui/AnimatedButton';
import BaseForm from '../forms/BaseForm';
import FormField from '../forms/FormField';
import * as yup from 'yup';

interface HealthGoal {
  id: string;
  userId: string;
  metricType: string;
  targetValue: number;
  currentValue?: number;
  targetDate: string;
  title: string;
  description?: string;
  unit: string;
  goalType: 'decrease' | 'increase' | 'maintain';
  status: 'active' | 'completed' | 'paused';
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

interface GoalFormData {
  metricType: string;
  targetValue: string;
  targetDate: string;
  title: string;
  description?: string;
  goalType: 'decrease' | 'increase' | 'maintain';
}

const goalSchema = yup.object({
  metricType: yup.string().required('Metric type is required'),
  targetValue: yup.string().required('Target value is required'),
  targetDate: yup.string().required('Target date is required'),
  title: yup.string().required('Goal title is required'),
  description: yup.string().optional(),
  goalType: yup.string().oneOf(['decrease', 'increase', 'maintain']).required('Goal type is required')
});

const metricOptions = [
  { value: 'blood_pressure', label: 'Blood Pressure' },
  { value: 'blood_sugar', label: 'Blood Sugar' },
  { value: 'weight', label: 'Weight' },
  { value: 'heart_rate', label: 'Heart Rate' },
  { value: 'steps', label: 'Daily Steps' }
];

const goalTypeOptions = [
  { value: 'decrease', label: 'Decrease' },
  { value: 'increase', label: 'Increase' },
  { value: 'maintain', label: 'Maintain' }
];

const HealthGoals: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<HealthGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, [user?.id]);

  const loadGoals = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      // In a real app, you'd have a goals collection
      // For now, we'll simulate with localStorage
      const storedGoals = localStorage.getItem(`healthGoals_${user.id}`);
      const goalsData = storedGoals ? JSON.parse(storedGoals) : [];
      
      // Update progress for each goal
      const updatedGoals = await Promise.all(
        goalsData.map(async (goal: HealthGoal) => {
          const progress = await calculateGoalProgress(goal);
          return { ...goal, progress };
        })
      );

      setGoals(updatedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGoalProgress = async (goal: HealthGoal): Promise<number> => {
    if (!user?.id) return 0;

    try {
      const metrics = await firestoreService.getHealthMetrics(user.id);
      const relevantMetrics = metrics
        .filter(m => m.type === goal.metricType)
        .filter(m => new Date(m.recordedAt) >= new Date(goal.createdAt))
        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

      if (relevantMetrics.length === 0) return 0;

      const latestMetric = relevantMetrics[0];
      const currentValue = parseFloat(latestMetric.value.replace(/[^\d.-]/g, ''));
      
      // Calculate progress based on goal type
      const startValue = goal.currentValue || currentValue;
      const targetValue = goal.targetValue;
      
      let progress = 0;
      
      if (goal.goalType === 'decrease') {
        if (startValue <= targetValue) return 100;
        progress = Math.max(0, ((startValue - currentValue) / (startValue - targetValue)) * 100);
      } else if (goal.goalType === 'increase') {
        if (startValue >= targetValue) return 100;
        progress = Math.max(0, ((currentValue - startValue) / (targetValue - startValue)) * 100);
      } else { // maintain
        const tolerance = targetValue * 0.05; // 5% tolerance
        const deviation = Math.abs(currentValue - targetValue);
        progress = Math.max(0, 100 - (deviation / tolerance) * 100);
      }

      return Math.min(100, Math.max(0, progress));
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  };

  const saveGoals = (updatedGoals: HealthGoal[]) => {
    if (!user?.id) return;
    localStorage.setItem(`healthGoals_${user.id}`, JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
  };

  const handleCreateGoal = async (formData: GoalFormData) => {
    if (!user?.id) return;

    setSubmitting(true);
    try {
      const newGoal: HealthGoal = {
        id: Date.now().toString(),
        userId: user.id,
        metricType: formData.metricType,
        targetValue: parseFloat(formData.targetValue),
        targetDate: formData.targetDate,
        title: formData.title,
        description: formData.description,
        unit: getUnitForMetric(formData.metricType),
        goalType: formData.goalType,
        status: 'active',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedGoals = [...goals, newGoal];
      saveGoals(updatedGoals);
      
      setShowGoalForm(false);
      addNotification({
        title: 'Goal Created',
        message: `Your ${formData.title} goal has been created successfully.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to create goal. Please try again.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGoal = async (formData: GoalFormData) => {
    if (!editingGoal || !user?.id) return;

    setSubmitting(true);
    try {
      const updatedGoal: HealthGoal = {
        ...editingGoal,
        metricType: formData.metricType,
        targetValue: parseFloat(formData.targetValue),
        targetDate: formData.targetDate,
        title: formData.title,
        description: formData.description,
        goalType: formData.goalType,
        updatedAt: new Date().toISOString()
      };

      const updatedGoals = goals.map(g => g.id === editingGoal.id ? updatedGoal : g);
      saveGoals(updatedGoals);
      
      setEditingGoal(null);
      addNotification({
        title: 'Goal Updated',
        message: 'Your goal has been updated successfully.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to update goal. Please try again.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    saveGoals(updatedGoals);
    
    addNotification({
      title: 'Goal Deleted',
      message: 'Your goal has been deleted.',
      type: 'info'
    });
  };

  const getUnitForMetric = (metricType: string): string => {
    const units: Record<string, string> = {
      blood_pressure: 'mmHg',
      blood_sugar: 'mg/dL',
      weight: 'kg',
      heart_rate: 'bpm',
      steps: 'steps'
    };
    return units[metricType] || '';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (goal: HealthGoal) => {
    if (goal.progress >= 100) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (new Date(goal.targetDate) < new Date()) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    return <Target className="h-5 w-5 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Health Goals</h3>
        <AnimatedButton
          onClick={() => setShowGoalForm(true)}
          variant="primary"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </AnimatedButton>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Goals Set</h4>
          <p className="text-gray-600 mb-4">Set health goals to track your progress and stay motivated.</p>
          <AnimatedButton
            onClick={() => setShowGoalForm(true)}
            variant="primary"
          >
            Create Your First Goal
          </AnimatedButton>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(goal)}
                  <div>
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {goal.goalType} {goal.metricType.replace('_', ' ')} to {goal.targetValue} {goal.unit}
                    </p>
                    {goal.description && (
                      <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingGoal(goal)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{Math.round(goal.progress)}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  <span>
                    {goal.progress >= 100 ? 'Completed!' : 
                     new Date(goal.targetDate) < new Date() ? 'Overdue' : 
                     `${Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left`}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Goal Form Modal */}
      <AnimatePresence>
        {(showGoalForm || editingGoal) && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h3>
                
                <BaseForm<GoalFormData>
                  onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
                  onCancel={() => {
                    setShowGoalForm(false);
                    setEditingGoal(null);
                  }}
                  validationSchema={goalSchema}
                  defaultValues={editingGoal ? {
                    metricType: editingGoal.metricType,
                    targetValue: editingGoal.targetValue.toString(),
                    targetDate: editingGoal.targetDate,
                    title: editingGoal.title,
                    description: editingGoal.description || '',
                    goalType: editingGoal.goalType
                  } : {
                    metricType: '',
                    targetValue: '',
                    targetDate: '',
                    title: '',
                    description: '',
                    goalType: 'decrease'
                  }}
                  submitText={editingGoal ? 'Update Goal' : 'Create Goal'}
                  isLoading={submitting}
                >
                  {(methods) => (
                    <>
                      <FormField
                        name="title"
                        label="Goal Title"
                        placeholder="e.g., Lose 5kg by summer"
                        methods={methods}
                        required
                      />
                      
                      <FormField
                        name="metricType"
                        label="Metric Type"
                        type="select"
                        options={metricOptions}
                        methods={methods}
                        required
                      />
                      
                      <FormField
                        name="goalType"
                        label="Goal Type"
                        type="select"
                        options={goalTypeOptions}
                        methods={methods}
                        required
                      />
                      
                      <FormField
                        name="targetValue"
                        label="Target Value"
                        type="number"
                        placeholder="e.g., 70"
                        methods={methods}
                        required
                      />
                      
                      <FormField
                        name="targetDate"
                        label="Target Date"
                        type="date"
                        methods={methods}
                        required
                      />
                      
                      <FormField
                        name="description"
                        label="Description (Optional)"
                        type="textarea"
                        placeholder="Additional details about your goal..."
                        methods={methods}
                      />
                    </>
                  )}
                </BaseForm>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthGoals;