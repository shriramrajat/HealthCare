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


const Teleconsultation: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState<Array<{ id: string; sender: string; message: string; time: string }>>([]);
  const [newMessage, setNewMessage] = useState('');

  // New state for managing different views
  const [activeView, setActiveView] = useState<'main' | 'schedule' | 'records' | 'settings'>('main');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    setCallDuration(0);
    addNotification({
      title: 'Call Ended',
      message: `Your consultation lasted ${formatDuration(callDuration)}.`,
      type: 'info'
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: user?.name || 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
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
      <div className="bg-black rounded-xl overflow-hidden h-full flex flex-col">
        {/* Video Area */}
        <div className="flex-1 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Remote Video */}
            <motion.div
              className="relative bg-gray-800 flex items-center justify-center"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="w-48 h-48 bg-green-500 rounded-full flex items-center justify-center"
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
                <span className="text-white text-4xl font-bold">
                  {user?.role === 'patient' ? 'DJ' : 'JD'}
                </span>
              </motion.div>
              <motion.div
                className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {user?.role === 'patient' ? 'Dr. Sarah Johnson' : 'John Doe'}
              </motion.div>
            </motion.div>

            {/* Local Video */}
            <motion.div
              className="relative bg-gray-900 flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {isVideoEnabled ? (
                  <motion.div
                    key="local-video-on"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-48 h-48 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-4xl font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="local-video-off"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-48 h-48 bg-gray-600 rounded-full flex items-center justify-center"
                  >
                    <VideoOff className="h-24 w-24 text-gray-400" />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                You
              </motion.div>
            </motion.div>
          </div>

          {/* Call Duration */}
          <motion.div
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="font-mono">{formatDuration(callDuration)}</span>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <motion.div
          className="bg-gray-900 p-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center space-x-6">
            <AnimatedButton
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              variant={isAudioEnabled ? "secondary" : "danger"}
              size="lg"
              className="p-4 rounded-full"
              title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </AnimatedButton>

            <AnimatedButton
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              variant={isVideoEnabled ? "secondary" : "danger"}
              size="lg"
              className="p-4 rounded-full"
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </AnimatedButton>

            <AnimatedButton
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              variant={isScreenSharing ? "primary" : "secondary"}
              size="lg"
              className="p-4 rounded-full"
              title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
            >
              <Monitor className="h-6 w-6" />
            </AnimatedButton>

            <AnimatedButton
              variant="secondary"
              size="lg"
              className="p-4 rounded-full"
              title="Chat"
            >
              <MessageSquare className="h-6 w-6" />
            </AnimatedButton>

            <AnimatedButton
              onClick={handleEndCall}
              variant="danger"
              size="lg"
              className="p-4 rounded-full"
              title="End call"
            >
              <Phone className="h-6 w-6 transform rotate-135" />
            </AnimatedButton>
          </div>
        </motion.div>
      </div>

      {/* Chat Sidebar (Hidden by default, could be toggled) */}
      <div className="hidden fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Chat</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{msg.sender}</span>
                <span className="text-xs text-gray-500">{msg.time}</span>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-sm">
                {msg.message}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default Teleconsultation;