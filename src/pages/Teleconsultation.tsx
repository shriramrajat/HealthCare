import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Monitor,
  Users,
  Settings,
  MessageSquare,
  FileText,
  Calendar,
  Clock,
  Plus
} from 'lucide-react';
import ScheduleConsultationForm from '../components/teleconsultation/ScheduleConsultationForm';
import ConsultationRecords from '../components/teleconsultation/ConsultationRecords';
import TeleconsultationSettings from '../components/teleconsultation/TeleconsultationSettings';
import AnimatedButton from '../components/ui/AnimatedButton';
import { useLocation } from 'react-router-dom';
import { firestoreService } from '../firebase/firestore';
import { ConsultationRecord, ChatMessage } from '../types';
import { Unsubscribe } from 'firebase/firestore';


const Teleconsultation: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const location = useLocation();
  const appointment = location.state?.appointment;

  const remoteName = appointment
    ? (user?.role === 'patient' ? appointment.doctorName : appointment.patientName)
    : (user?.role === 'patient' ? 'Dr. Sarah Johnson' : 'John Doe');

  const remoteInitials = remoteName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  const [isInCall, setIsInCall] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const consultationId = appointment?.id || 'demo-consultation-id';

  // New state for managing different views
  const [activeView, setActiveView] = useState<'main' | 'schedule' | 'records' | 'settings'>('main');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const [showPostCallModal, setShowPostCallModal] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  // Subscribe to chat messages
  useEffect(() => {
    const unsubscribe = firestoreService.subscribeToChat(consultationId, (newMessages) => {
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, [consultationId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  const handleStartCall = () => {
    setIsInCall(true);
    setCallDuration(0);
    addNotification({
      title: 'Call Started',
      message: 'Your teleconsultation has begun.',
      type: 'success'
    });
  };

  const handleEndCall = () => {
    setIsInCall(false);

    if (user?.role === 'doctor') {
      setShowPostCallModal(true);
    }

    addNotification({
      title: 'Call Ended',
      message: `Your consultation lasted ${formatDuration(callDuration)}.`,
      type: 'info'
    });
  };

  const handleSaveNotes = async () => {
    if (!user) return;

    setSavingNotes(true);
    try {
      if (appointment) {
        const record: Omit<ConsultationRecord, 'id'> = {
          patientId: appointment.patientId,
          doctorId: user.id,
          patientName: appointment.patientName,
          doctorName: user.name,
          date: new Date().toISOString(),
          duration: Math.ceil(callDuration / 60),
          type: 'teleconsultation',
          status: 'completed',
          notes: consultationNotes,
          followUpRequired: false
        };
        await firestoreService.addConsultationRecord(record);
      } else {
        console.warn('No appointment context for consultation record');
      }

      addNotification({
        title: 'Notes Saved',
        message: 'Consultation notes have been saved successfully.',
        type: 'success'
      });
      setShowPostCallModal(false);
      setConsultationNotes('');
      setCallDuration(0); // Reset duration after saving
    } catch (error) {
      console.error('Error saving consultation notes:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to save notes. Please try again.',
        type: 'error'
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      try {
        await firestoreService.sendMessage({
          consultationId,
          senderId: user.id,
          senderName: user.name,
          text: newMessage,
          role: user.role,
          timestamp: new Date().toISOString() // will be replaced by serverTimestamp
        } as any);
        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
        addNotification({
          title: 'Error',
          message: 'Failed to send message',
          type: 'error'
        });
      }
    }
  };


  const handleViewChange = (view: 'main' | 'schedule' | 'records' | 'settings') => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveView(view);
      setIsLoading(false);
    }, 300);
  };

  const handleScheduleSuccess = () => {
    setIsScheduleModalOpen(false);
    // Optionally refresh records or update UI
  };

  if (!isInCall) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Navigation */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teleconsultation</h1>
          <p className="text-gray-600 mb-6">
            Connect with your healthcare providers through secure video consultations
          </p>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex space-x-1">
              {[
                { id: 'main', label: 'Start Call', icon: Video },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'records', label: 'Records', icon: FileText },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleViewChange(tab.id as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${activeView === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </motion.div>
          ) : (
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Render different views based on activeView */}
              {activeView === 'main' && (
                <div>

                  {/* Pre-call Setup */}
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Video Preview */}
                        <div className="space-y-6">
                          <h2 className="text-xl font-semibold text-gray-900">Camera & Audio Check</h2>

                          <motion.div
                            className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <AnimatePresence mode="wait">
                              {isVideoEnabled ? (
                                <motion.div
                                  key="video-on"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className="flex items-center justify-center h-full"
                                >
                                  <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-2xl font-bold">
                                      {user?.name?.charAt(0) || 'U'}
                                    </span>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="video-off"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className="flex items-center justify-center h-full"
                                >
                                  <VideoOff className="h-16 w-16 text-gray-400" />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                              <AnimatedButton
                                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                                variant={isVideoEnabled ? "secondary" : "danger"}
                                size="sm"
                                className="p-3 rounded-full"
                              >
                                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                              </AnimatedButton>

                              <AnimatedButton
                                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                                variant={isAudioEnabled ? "secondary" : "danger"}
                                size="sm"
                                className="p-3 rounded-full"
                              >
                                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                              </AnimatedButton>
                            </div>
                          </motion.div>

                          <motion.div
                            className="space-y-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="flex items-center space-x-3">
                              <motion.div
                                className={`w-3 h-3 rounded-full ${isVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`}
                                animate={{ scale: isVideoEnabled ? [1, 1.2, 1] : 1 }}
                                transition={{ duration: 0.5, repeat: isVideoEnabled ? Infinity : 0, repeatDelay: 1 }}
                              />
                              <span className="text-sm text-gray-600">
                                Camera {isVideoEnabled ? 'enabled' : 'disabled'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <motion.div
                                className={`w-3 h-3 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`}
                                animate={{ scale: isAudioEnabled ? [1, 1.2, 1] : 1 }}
                                transition={{ duration: 0.5, repeat: isAudioEnabled ? Infinity : 0, repeatDelay: 1 }}
                              />
                              <span className="text-sm text-gray-600">
                                Microphone {isAudioEnabled ? 'enabled' : 'disabled'}
                              </span>
                            </div>
                          </motion.div>
                        </div>

                        {/* Consultation Info */}
                        <motion.div
                          className="space-y-6"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <h2 className="text-xl font-semibold text-gray-900">Quick Start</h2>

                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-600">Today's Date</p>
                                <p className="font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Clock className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-600">Current Time</p>
                                <p className="font-medium text-gray-900">{new Date().toLocaleTimeString()}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Users className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-600">Ready to connect with</p>
                                <p className="font-medium text-gray-900">Healthcare providers</p>
                              </div>
                            </div>
                          </div>

                          <motion.div
                            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <h3 className="font-medium text-blue-900 mb-2">Before you start:</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Ensure you have a stable internet connection</li>
                              <li>• Find a quiet, private space for the consultation</li>
                              <li>• Have your medical records or questions ready</li>
                              <li>• Test your camera and microphone above</li>
                            </ul>
                          </motion.div>

                          <div className="space-y-3">
                            <AnimatedButton
                              onClick={handleStartCall}
                              disabled={!isVideoEnabled && !isAudioEnabled}
                              variant="primary"
                              size="lg"
                              className="w-full"
                            >
                              <Video className="h-6 w-6 mr-3" />
                              <span className="text-lg font-medium">Start Instant Consultation</span>
                            </AnimatedButton>

                            <AnimatedButton
                              onClick={() => setIsScheduleModalOpen(true)}
                              variant="secondary"
                              size="lg"
                              className="w-full"
                            >
                              <Plus className="h-5 w-5 mr-2" />
                              Schedule Appointment
                            </AnimatedButton>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'schedule' && (
                <div className="max-w-4xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ScheduleConsultationForm
                      isOpen={true}
                      onClose={() => handleViewChange('main')}
                      onScheduled={handleScheduleSuccess}
                    />
                  </motion.div>
                </div>
              )}

              {activeView === 'records' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ConsultationRecords />
                </motion.div>
              )}

              {activeView === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <TeleconsultationSettings />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Schedule Modal */}
        <ScheduleConsultationForm
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onScheduled={handleScheduleSuccess}
        />

        {/* Post Consultation Notes Modal */}
        <AnimatePresence>
          {showPostCallModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Consultation Notes</h3>
                  <button
                    onClick={() => setShowPostCallModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <Plus className="h-6 w-6 transform rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Add notes for your consultation with <span className="font-semibold">{remoteName}</span>.
                    Duration: {formatDuration(callDuration)}
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinical Notes
                    </label>
                    <textarea
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Record symptoms, diagnosis, prescription, or follow-up instructions..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowPostCallModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes || !consultationNotes.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center justify-center"
                    >
                      {savingNotes ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        'Save Notes'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto h-[calc(100vh-120px)]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1 bg-black rounded-xl overflow-hidden relative flex flex-col">
        {/* Video Area */}
        <div className="flex-1 relative overflow-hidden">
          <div className={`grid h-full transition-all duration-300 ${isChatOpen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {/* Remote Video */}
            <motion.div
              className="relative bg-gray-800 flex items-center justify-center h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-32 h-32 md:w-48 md:h-48 bg-green-500 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(34, 197, 94, 0.4)",
                    "0 0 0 10px rgba(34, 197, 94, 0)",
                    "0 0 0 0 rgba(34, 197, 94, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-white text-2xl md:text-4xl font-bold">
                  {remoteInitials}
                </span>
              </motion.div>
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {remoteName}
              </div>
            </motion.div>

            {/* Local Video - Hide on mobile if showing chat, or make small? Let's hide local on mobile if chat is open to save space, or just stack. 
                Actually, simpler: Just keep the grid responsive. 
            */}
            <motion.div
              className={`relative bg-gray-900 flex items-center justify-center h-full ${isChatOpen ? 'hidden lg:flex' : 'flex'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {isVideoEnabled ? (
                <div className="w-32 h-32 md:w-48 md:h-48 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl md:text-4xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              ) : (
                <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-600 rounded-full flex items-center justify-center">
                  <VideoOff className="h-16 w-16 md:h-24 md:w-24 text-gray-400" />
                </div>
              )}
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                You
              </div>
            </motion.div>
          </div>

          {/* Call Duration */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm z-10">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono">{formatDuration(callDuration)}</span>
            </div>
          </div>

          {/* Mobile Chat Overlay */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 bg-white z-20 md:hidden flex flex-col"
              >
                <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                    Chat
                  </h3>
                  <button onClick={() => setIsChatOpen(false)} className="p-1 rounded-full hover:bg-gray-200">
                    <Plus className="h-6 w-6 transform rotate-45 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">{msg.senderName}</span>
                        <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                      </div>
                      <div className={`rounded-2xl px-4 py-2 text-sm max-w-[85%] shadow-sm ${msg.senderId === user?.id
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-600 text-white rounded-full disabled:bg-blue-300"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 p-4 md:p-6 z-30">
          <div className="flex items-center justify-center space-x-4 md:space-x-6">
            <AnimatedButton
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              variant={isAudioEnabled ? "secondary" : "danger"}
              className="p-3 md:p-4 rounded-full"
            >
              {isAudioEnabled ? <Mic className="h-5 w-5 md:h-6 md:w-6" /> : <MicOff className="h-5 w-5 md:h-6 md:w-6" />}
            </AnimatedButton>

            <AnimatedButton
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              variant={isVideoEnabled ? "secondary" : "danger"}
              className="p-3 md:p-4 rounded-full"
            >
              {isVideoEnabled ? <Video className="h-5 w-5 md:h-6 md:w-6" /> : <VideoOff className="h-5 w-5 md:h-6 md:w-6" />}
            </AnimatedButton>

            {/* Desktop Screen Share - Hidden on Mobile */}
            <div className="hidden md:block">
              <AnimatedButton
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                variant={isScreenSharing ? "primary" : "secondary"}
                className="p-3 md:p-4 rounded-full"
              >
                <Monitor className="h-5 w-5 md:h-6 md:w-6" />
              </AnimatedButton>
            </div>

            <AnimatedButton
              onClick={() => setIsChatOpen(!isChatOpen)}
              variant={isChatOpen ? "primary" : "secondary"}
              className="p-3 md:p-4 rounded-full relative"
            >
              <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
              {messages.length > 0 && !isChatOpen && (
                <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-gray-900"></span>
              )}
            </AnimatedButton>

            <AnimatedButton
              onClick={handleEndCall}
              variant="danger"
              className="p-3 md:p-4 rounded-full"
            >
              <Phone className="h-5 w-5 md:h-6 md:w-6 transform rotate-135" />
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Desktop Chat Sidebar */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden md:flex bg-white border-l border-gray-200 flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center min-w-[320px]">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                Consultation Chat
              </h3>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="h-5 w-5 transform rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-w-[320px]">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">
                  <p className="text-sm">No messages yet.</p>
                  <p className="text-xs">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">{msg.senderName}</span>
                      <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                    </div>
                    <div className={`rounded-2xl px-4 py-2 text-sm max-w-[90%] shadow-sm ${msg.senderId === user?.id
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white min-w-[320px]">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-300 shadow-md"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Teleconsultation;