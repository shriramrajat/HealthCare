import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Video, 
  MapPin,
  Download,
  Eye,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Pill,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ConsultationRecord } from '../../types';
import AnimatedButton from '../ui/AnimatedButton';

interface ConsultationRecordsProps {
  className?: string;
}

const ConsultationRecords: React.FC<ConsultationRecordsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<ConsultationRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ConsultationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'teleconsultation' | 'in-person'>('all');
  const [filterStatus] = useState<'all' | 'completed' | 'cancelled' | 'no-show'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'doctor' | 'type'>('date');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const mockRecords: ConsultationRecord[] = [
    {
      id: '1',
      patientId: user?.id || '',
      doctorId: 'doc1',
      patientName: user?.name || 'John Doe',
      doctorName: 'Dr. Sarah Johnson',
      date: '2024-01-15T10:00:00Z',
      duration: 30,
      type: 'teleconsultation',
      status: 'completed',
      notes: 'Patient reported improvement in symptoms. Blood pressure readings are within normal range.',
      prescription: 'Continue current medication. Increase water intake.',
      followUpRequired: true,
      diagnosis: 'Hypertension - controlled',
      symptoms: ['headache', 'dizziness'],
      vitalSigns: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 98.6,
        weight: 165
      }
    },
    {
      id: '2',
      patientId: user?.id || '',
      doctorId: 'doc2',
      patientName: user?.name || 'John Doe',
      doctorName: 'Dr. Michael Chen',
      date: '2024-01-08T14:30:00Z',
      duration: 45,
      type: 'in-person',
      status: 'completed',
      notes: 'Routine checkup. All vitals normal. Discussed lifestyle modifications.',
      prescription: 'Vitamin D supplement, 1000 IU daily',
      followUpRequired: false,
      diagnosis: 'Annual physical - normal',
      symptoms: [],
      vitalSigns: {
        bloodPressure: '118/75',
        heartRate: 68,
        temperature: 98.4,
        weight: 163
      }
    },
    {
      id: '3',
      patientId: user?.id || '',
      doctorId: 'doc1',
      patientName: user?.name || 'John Doe',
      doctorName: 'Dr. Sarah Johnson',
      date: '2023-12-20T09:15:00Z',
      duration: 25,
      type: 'teleconsultation',
      status: 'completed',
      notes: 'Follow-up for diabetes management. Blood sugar levels improving.',
      prescription: 'Adjust metformin dosage to 500mg twice daily',
      followUpRequired: true,
      diagnosis: 'Type 2 Diabetes - improving',
      symptoms: ['fatigue', 'increased thirst'],
      vitalSigns: {
        bloodPressure: '125/82',
        heartRate: 75,
        weight: 167
      }
    }
  ];

  useEffect(() => {
    loadConsultationRecords();
  }, []);

  useEffect(() => {
    filterAndSortRecords();
  }, [records, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  const loadConsultationRecords = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecords(mockRecords);
    } catch (error) {
      console.error('Error loading consultation records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortRecords = () => {
    let filtered = [...records];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'doctor':
          comparison = a.doctorName.localeCompare(b.doctorName);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredRecords(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'teleconsultation' ? (
      <Video className="h-4 w-4 text-blue-600" />
    ) : (
      <MapPin className="h-4 w-4 text-green-600" />
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Consultation Records</h2>
              <p className="text-sm text-gray-600">View your consultation history and medical records</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor, diagnosis, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="teleconsultation">Video Calls</option>
            <option value="in-person">In-Person</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="doctor">Sort by Doctor</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consultation records found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Your consultation history will appear here after your first appointment'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRecords.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedRecord(
                      expandedRecord === record.id ? null : record.id
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(record.type)}
                          <span className="text-sm font-medium text-gray-900">
                            {record.doctorName}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(record.date)}</span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{formatTime(record.date)}</span>
                        </div>

                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {record.followUpRequired && (
                          <div title="Follow-up required">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          </div>
                        )}
                        {expandedRecord === record.id ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">{record.notes}</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedRecord === record.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-200 bg-gray-50"
                      >
                        <div className="p-4 space-y-4">
                          {/* Diagnosis and Symptoms */}
                          {record.diagnosis && (
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <Stethoscope className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-900">Diagnosis</span>
                              </div>
                              <p className="text-sm text-gray-700 ml-6">{record.diagnosis}</p>
                            </div>
                          )}

                          {record.symptoms && record.symptoms.length > 0 && (
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium text-gray-900">Symptoms</span>
                              </div>
                              <div className="ml-6 flex flex-wrap gap-2">
                                {record.symptoms.map((symptom, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                                  >
                                    {symptom}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Prescription */}
                          {record.prescription && (
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <Pill className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-900">Prescription</span>
                              </div>
                              <p className="text-sm text-gray-700 ml-6">{record.prescription}</p>
                            </div>
                          )}

                          {/* Vital Signs */}
                          {record.vitalSigns && (
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <User className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-gray-900">Vital Signs</span>
                              </div>
                              <div className="ml-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {record.vitalSigns.bloodPressure && (
                                  <div className="text-sm">
                                    <span className="text-gray-600">BP:</span>
                                    <span className="ml-1 font-medium">{record.vitalSigns.bloodPressure}</span>
                                  </div>
                                )}
                                {record.vitalSigns.heartRate && (
                                  <div className="text-sm">
                                    <span className="text-gray-600">HR:</span>
                                    <span className="ml-1 font-medium">{record.vitalSigns.heartRate} bpm</span>
                                  </div>
                                )}
                                {record.vitalSigns.temperature && (
                                  <div className="text-sm">
                                    <span className="text-gray-600">Temp:</span>
                                    <span className="ml-1 font-medium">{record.vitalSigns.temperature}°F</span>
                                  </div>
                                )}
                                {record.vitalSigns.weight && (
                                  <div className="text-sm">
                                    <span className="text-gray-600">Weight:</span>
                                    <span className="ml-1 font-medium">{record.vitalSigns.weight} lbs</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="text-xs text-gray-500">
                              Duration: {record.duration} minutes
                            </div>
                            <div className="flex space-x-2">
                              {record.recordingUrl && (
                                <AnimatedButton
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => window.open(record.recordingUrl, '_blank')}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Recording
                                </AnimatedButton>
                              )}
                              <AnimatedButton
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  // Implement download functionality
                                  console.log('Download record:', record.id);
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </AnimatedButton>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationRecords;