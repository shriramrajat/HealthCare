import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useOfflineForm } from '../hooks/useOfflineForm';
import { getFirebaseErrorMessage } from '../utils/errorHandling';
import { Symptom } from '../types';
import firestoreService from '../firebase/firestoreWithPerformance';
import SymptomForm from '../components/forms/SymptomForm';
import SymptomCalendar from '../components/calendar/SymptomCalendar';
import SymptomPatternAnalysis from '../components/analytics/SymptomPatternAnalysis';
import AnimatedModal from '../components/ui/AnimatedModal';
import { 
  Plus, 
  Calendar, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

const Symptoms: React.FC = () => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  useEffect(() => {
    const loadSymptoms = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const result = await firestoreService.getSymptoms(user.id, { limit: 50 });
        setSymptoms(result.data);
        setHasMore(result.hasMore);
        setLastDoc(result.lastDoc);
      } catch (error) {
        console.error('Error loading symptoms:', error);
        addNotification({
          title: 'Error',
          message: 'Failed to load symptoms. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadSymptoms();
  }, [user?.id, addNotification]);

  const loadMoreSymptoms = async () => {
    if (!user?.id || !lastDoc || !hasMore) return;

    try {
      setLoadingMore(true);
      const result = await firestoreService.getSymptoms(user.id, { 
        limit: 50, 
        lastDoc 
      });
      setSymptoms(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
    } catch (error) {
      console.error('Error loading more symptoms:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to load more symptoms. Please try again.',
        type: 'error'
      });
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    let filtered = symptoms;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(symptom =>
        symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        symptom.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        symptom.triggers?.some(trigger => 
          trigger.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      const severityRange = severityFilter.split('-');
      const min = parseInt(severityRange[0]);
      const max = parseInt(severityRange[1] || severityRange[0]);
      
      filtered = filtered.filter(symptom => 
        symptom.severity >= min && symptom.severity <= max
      );
    }

    setFilteredSymptoms(filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, [symptoms, searchTerm, severityFilter]);

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'text-green-600 bg-green-50 border-green-200';
    if (severity <= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSeverityIcon = (severity: number) => {
    if (severity <= 3) return '🟢';
    if (severity <= 6) return '🟡';
    return '🔴';
  };

  const getSymptomStats = () => {
    const totalSymptoms = symptoms.length;
    const averageSeverity = symptoms.length > 0 
      ? symptoms.reduce((acc, s) => acc + s.severity, 0) / symptoms.length
      : 0;
    
    const recentSymptoms = symptoms.filter(s => {
      const symptomDate = new Date(s.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return symptomDate >= weekAgo;
    }).length;

    const highSeveritySymptoms = symptoms.filter(s => s.severity >= 7).length;

    return {
      totalSymptoms,
      averageSeverity: Math.round(averageSeverity * 10) / 10,
      recentSymptoms,
      highSeveritySymptoms
    };
  };

  const { submit: submitSymptom, isSubmitting, error: submissionError, retry, isOnline, queuedCount } = useOfflineForm({
    onSubmit: async (formData: any) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const symptomData = {
        ...formData,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const symptomId = await firestoreService.addSymptom(symptomData);
      
      // Add to local state for immediate UI update
      const newSymptom = {
        id: symptomId,
        ...symptomData
      };
      
      setSymptoms(prev => [newSymptom, ...prev]);
      setShowAddForm(false);
      
      // Reload to get proper pagination state
      if (user?.id) {
        const result = await firestoreService.getSymptoms(user.id, { limit: 50 });
        setSymptoms(result.data);
        setHasMore(result.hasMore);
        setLastDoc(result.lastDoc);
      }
      
      addNotification({
        title: 'Symptom Added',
        message: 'Your symptom has been logged successfully.',
        type: 'success'
      });
    },
    onError: (error) => {
      console.error('Error adding symptom:', error);
    },
    submissionType: 'symptom',
    userId: user?.id || ''
  });

  const handleAddSymptom = async (formData: any) => {
    await submitSymptom(formData);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleAddSymptomForDate = (date: string) => {
    setSelectedDate(date);
    setShowAddForm(true);
  };

  const stats = getSymptomStats();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Symptom Tracker</h1>
          <p className="text-gray-600 mt-1">
            Track and monitor your symptoms to identify patterns and triggers
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Log Symptom</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Symptoms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSymptoms}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Average Severity</p>
              <p className="text-2xl font-bold text-green-600">{stats.averageSeverity}/10</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-purple-600">{stats.recentSymptoms}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">High Severity</p>
              <p className="text-2xl font-bold text-red-600">{stats.highSeveritySymptoms}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search symptoms, notes, or triggers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severity</option>
              <option value="1-3">Mild (1-3)</option>
              <option value="4-6">Moderate (4-6)</option>
              <option value="7-10">Severe (7-10)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Symptom Calendar */}
      <SymptomCalendar
        symptoms={symptoms}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onAddSymptom={handleAddSymptomForDate}
        view={calendarView}
        onViewChange={setCalendarView}
      />

      {/* Pattern Analysis */}
      <SymptomPatternAnalysis symptoms={symptoms} />

      {/* Enhanced Symptoms List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Symptoms</h2>
        
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : filteredSymptoms.length > 0 ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>
              {filteredSymptoms.map((symptom, index) => (
                <motion.div
                  key={symptom.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{symptom.name}</h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(symptom.severity)}`}>
                          {getSeverityIcon(symptom.severity)} {symptom.severity}/10
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(symptom.date).toLocaleDateString()}</span>
                        </div>
                        {symptom.time && (
                          <div className="flex items-center space-x-1">
                            <span>at {symptom.time}</span>
                          </div>
                        )}
                        {symptom.duration && (
                          <div className="flex items-center space-x-1">
                            <span>({symptom.duration} min)</span>
                          </div>
                        )}
                      </div>
                      
                      {symptom.location && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Location:</strong> {symptom.location}
                        </p>
                      )}
                      
                      {symptom.notes && (
                        <p className="text-gray-700 mb-3">{symptom.notes}</p>
                      )}
                      
                      {symptom.triggers && symptom.triggers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-gray-600">Triggers:</span>
                          {symptom.triggers.map((trigger, triggerIndex) => (
                            <motion.span
                              key={triggerIndex}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: triggerIndex * 0.05 }}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {trigger}
                            </motion.span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || severityFilter !== 'all' 
                ? 'No symptoms match your filters' 
                : 'No symptoms logged yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || severityFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Start tracking your symptoms to identify patterns and improve your health management.'
              }
            </p>
            {!searchTerm && severityFilter === 'all' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log Your First Symptom
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Load More Button */}
        {hasMore && filteredSymptoms.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={loadMoreSymptoms}
              disabled={loadingMore}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? 'Loading...' : 'Load More Symptoms'}
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Symptom Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <AnimatedModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            title="Log New Symptom"
            size="xl"
          >
            {submissionError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-600 mb-2">
                  {getFirebaseErrorMessage(submissionError)}
                </p>
                <button
                  type="button"
                  onClick={retry}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 text-sm text-red-700 hover:text-red-800 font-medium disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Retry</span>
                </button>
              </div>
            )}
            <SymptomForm
              onSubmit={handleAddSymptom}
              onCancel={() => setShowAddForm(false)}
              selectedDate={selectedDate}
              isLoading={isSubmitting}
            />
          </AnimatedModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Symptoms;