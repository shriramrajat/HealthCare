import React, { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';

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

  if (!isInCall) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teleconsultation</h1>
          <p className="text-gray-600">
            Connect with your healthcare providers through secure video consultations
          </p>
        </div>

        {/* Pre-call Setup */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Video Preview */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Camera & Audio Check</h2>
                
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  {isVideoEnabled ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <VideoOff className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                    <button
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                      className={`p-3 rounded-full transition-colors ${
                        isVideoEnabled 
                          ? 'bg-gray-700 text-white hover:bg-gray-600' 
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </button>
                    
                    <button
                      onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                      className={`p-3 rounded-full transition-colors ${
                        isAudioEnabled 
                          ? 'bg-gray-700 text-white hover:bg-gray-600' 
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      Camera {isVideoEnabled ? 'enabled' : 'disabled'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      Microphone {isAudioEnabled ? 'enabled' : 'disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Info */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Consultation Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium text-gray-900">{new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">
                        {user?.role === 'patient' ? 'Healthcare Provider' : 'Patient'}
                      </p>
                      <p className="font-medium text-gray-900">
                        {user?.role === 'patient' ? 'Dr. Sarah Johnson' : 'John Doe'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Before you start:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Ensure you have a stable internet connection</li>
                    <li>• Find a quiet, private space for the consultation</li>
                    <li>• Have your medical records or questions ready</li>
                    <li>• Test your camera and microphone above</li>
                  </ul>
                </div>

                <button
                  onClick={handleStartCall}
                  disabled={!isVideoEnabled && !isAudioEnabled}
                  className="w-full flex items-center justify-center space-x-3 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video className="h-6 w-6" />
                  <span className="text-lg font-medium">Start Consultation</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Schedule Appointment</h3>
            <p className="text-sm text-gray-600 mb-4">Book a future teleconsultation</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Schedule
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Medical Records</h3>
            <p className="text-sm text-gray-600 mb-4">Review your consultation history</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              View Records
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-sm text-gray-600 mb-4">Configure audio and video preferences</p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Configure
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)]">
      <div className="bg-black rounded-xl overflow-hidden h-full flex flex-col">
        {/* Video Area */}
        <div className="flex-1 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Remote Video */}
            <div className="relative bg-gray-800 flex items-center justify-center">
              <div className="w-48 h-48 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {user?.role === 'patient' ? 'DJ' : 'JD'}
                </span>
              </div>
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {user?.role === 'patient' ? 'Dr. Sarah Johnson' : 'John Doe'}
              </div>
            </div>

            {/* Local Video */}
            <div className="relative bg-gray-900 flex items-center justify-center">
              {isVideoEnabled ? (
                <div className="w-48 h-48 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              ) : (
                <div className="w-48 h-48 bg-gray-600 rounded-full flex items-center justify-center">
                  <VideoOff className="h-24 w-24 text-gray-400" />
                </div>
              )}
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                You
              </div>
            </div>
          </div>

          {/* Call Duration */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-mono">{formatDuration(callDuration)}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 p-6">
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`p-4 rounded-full transition-colors ${
                isAudioEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </button>

            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`p-4 rounded-full transition-colors ${
                isVideoEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </button>

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-4 rounded-full transition-colors ${
                isScreenSharing 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
            >
              <Monitor className="h-6 w-6" />
            </button>

            <button
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              title="Chat"
            >
              <MessageSquare className="h-6 w-6" />
            </button>

            <button
              onClick={handleEndCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
              title="End call"
            >
              <Phone className="h-6 w-6 transform rotate-135" />
            </button>
          </div>
        </div>
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
    </div>
  );
};

export default Teleconsultation;