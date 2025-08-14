import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Symptom } from '../types';
import { 
  Plus, 
  Calendar, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';

const Symptoms: React.FC = () => {
  const { addNotification } = useNotifications();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Mock data - Replace with actual API calls
    const mockSymptoms: Symptom[] = [
      {
        id: '1',
        name: 'Headache',
        severity: 6,
        date: new Date().toISOString().split('T')[0],
        notes: 'Started after lunch, possibly related to stress',
        triggers: ['Stress', 'Lack of sleep']
      },
      {
        id: '2',
        name: 'Fatigue',
        severity: 4,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'General tiredness throughout the day',
        triggers: ['Poor sleep', 'High blood sugar']
      },
      {
        id: '3',
        name: 'Dizziness',
        severity: 7,
        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Felt lightheaded when standing up quickly',
        triggers: ['Low blood pressure', 'Dehydration']
      },
      {
        id: '4',
        name: 'Chest tightness',
        severity: 8,
        date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Brief episode during evening walk',
        triggers: ['Exercise', 'Cold weather']
      },
      {
        id: '5',
        name: 'Nausea',
        severity: 5,
        date: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'After taking morning medication on empty stomach',
        triggers: ['Medication', 'Empty stomach']
      }
    ];

    setSymptoms(mockSymptoms);
  }, []);

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

  const handleAddSymptom = () => {
    setShowAddForm(false);
    addNotification({
      title: 'Symptom Added',
      message: 'Your symptom has been logged successfully.',
      type: 'success'
    });
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

      {/* Symptom Calendar View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendar View</h2>
        <div className="grid grid-cols-7 gap-2">
          {/* Calendar header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
          
          {/* Calendar days (simplified placeholder) */}
          {Array.from({ length: 35 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (35 - i - date.getDay()));
            const dateString = date.toISOString().split('T')[0];
            const daySymptoms = symptoms.filter(s => s.date === dateString);
            const hasSymptoms = daySymptoms.length > 0;
            const isToday = dateString === new Date().toISOString().split('T')[0];
            
            return (
              <div
                key={i}
                className={`p-2 text-center text-sm border rounded cursor-pointer transition-colors ${
                  isToday 
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : hasSymptoms
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div>{date.getDate()}</div>
                {hasSymptoms && (
                  <div className="flex justify-center mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Symptoms List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Symptoms</h2>
        
        {filteredSymptoms.length > 0 ? (
          filteredSymptoms.map((symptom) => (
            <div key={symptom.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                  </div>
                  
                  {symptom.notes && (
                    <p className="text-gray-700 mb-3">{symptom.notes}</p>
                  )}
                  
                  {symptom.triggers && symptom.triggers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-600">Triggers:</span>
                      {symptom.triggers.map((trigger, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
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
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log Your First Symptom
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Symptom Form Modal (Placeholder) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Log New Symptom</h2>
            <p className="text-gray-600 mb-6">
              This is a placeholder for the symptom logging form. In a full implementation, 
              this would include fields for symptom name, severity scale, date/time, 
              notes, and potential triggers.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleAddSymptom}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log Symptom
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Symptoms;