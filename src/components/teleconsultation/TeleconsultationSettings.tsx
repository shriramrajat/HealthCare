import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Video, 
  Mic, 
  Bell, 
  Globe, 
  Monitor,
  Wifi,
  Volume2,
  Camera,
  Save,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { TeleconsultationSettings as SettingsType } from '../../types';
import AnimatedButton from '../ui/AnimatedButton';

interface TeleconsultationSettingsProps {
  className?: string;
}

interface ConnectionTestResult {
  status: 'testing' | 'good' | 'fair' | 'poor' | 'failed';
  latency?: number;
  bandwidth?: number;
  videoQuality?: string;
  audioQuality?: string;
}

const TeleconsultationSettings: React.FC<TeleconsultationSettingsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [settings, setSettings] = useState<SettingsType>({
    userId: user?.id || '',
    videoQuality: 'medium',
    audioEnabled: true,
    videoEnabled: true,
    notifications: true,
    autoRecord: false,
    preferredLanguage: 'en',
    timezone: 'America/New_York'
  });

  const [originalSettings, setOriginalSettings] = useState<SettingsType>(settings);
  const [isLoading, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [connectionTest, setConnectionTest] = useState<ConnectionTestResult>({ status: 'testing' });
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const loadSettings = async () => {
    try {
      // Simulate loading settings from API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock settings data
      const mockSettings: SettingsType = {
        userId: user?.id || '',
        videoQuality: 'medium',
        audioEnabled: true,
        videoEnabled: true,
        notifications: true,
        autoRecord: false,
        preferredLanguage: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      setSettings(mockSettings);
      setOriginalSettings(mockSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to load settings',
        type: 'error'
      });
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOriginalSettings(settings);
      setHasChanges(false);
      
      addNotification({
        title: 'Settings Saved',
        message: 'Your teleconsultation preferences have been updated',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to save settings. Please try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTest({ status: 'testing' });

    try {
      // Simulate connection testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock test results
      const mockResults: ConnectionTestResult = {
        status: Math.random() > 0.2 ? 'good' : Math.random() > 0.5 ? 'fair' : 'poor',
        latency: Math.floor(Math.random() * 100) + 20,
        bandwidth: Math.floor(Math.random() * 50) + 10,
        videoQuality: 'HD',
        audioQuality: 'Clear'
      };
      
      setConnectionTest(mockResults);
      
      if (mockResults.status === 'good') {
        addNotification({
          title: 'Connection Test Passed',
          message: 'Your internet connection is suitable for teleconsultations',
          type: 'success'
        });
      } else if (mockResults.status === 'fair') {
        addNotification({
          title: 'Connection Test - Fair',
          message: 'Your connection may experience some quality issues',
          type: 'warning'
        });
      } else {
        addNotification({
          title: 'Connection Test - Poor',
          message: 'Consider improving your internet connection for better quality',
          type: 'error'
        });
      }
    } catch (error) {
      setConnectionTest({ status: 'failed' });
      addNotification({
        title: 'Connection Test Failed',
        message: 'Unable to test connection. Please check your internet.',
        type: 'error'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const updateSetting = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getConnectionStatusIcon = () => {
    switch (connectionTest.status) {
      case 'testing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>;
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fair':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'poor':
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Wifi className="h-5 w-5 text-gray-400" />;
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionTest.status) {
      case 'good':
        return 'border-green-200 bg-green-50';
      case 'fair':
        return 'border-yellow-200 bg-yellow-50';
      case 'poor':
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Settings className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Teleconsultation Settings</h2>
            <p className="text-sm text-gray-600">Configure your audio, video, and notification preferences</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Connection Test */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Wifi className="h-5 w-5 text-blue-600" />
            <span>Connection Test</span>
          </h3>
          
          <div className={`p-4 border rounded-lg ${getConnectionStatusColor()}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getConnectionStatusIcon()}
                <div>
                  <p className="font-medium text-gray-900">
                    {connectionTest.status === 'testing' ? 'Testing Connection...' : 
                     connectionTest.status === 'good' ? 'Excellent Connection' :
                     connectionTest.status === 'fair' ? 'Fair Connection' :
                     connectionTest.status === 'poor' ? 'Poor Connection' :
                     connectionTest.status === 'failed' ? 'Connection Failed' : 'Not Tested'}
                  </p>
                  {connectionTest.status !== 'testing' && connectionTest.latency && (
                    <p className="text-sm text-gray-600">
                      Latency: {connectionTest.latency}ms | Bandwidth: {connectionTest.bandwidth} Mbps
                    </p>
                  )}
                </div>
              </div>
              
              <AnimatedButton
                variant="secondary"
                size="sm"
                onClick={testConnection}
                isLoading={isTestingConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </AnimatedButton>
            </div>

            {connectionTest.status === 'good' && connectionTest.videoQuality && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Video Quality:</span>
                  <span className="ml-2 font-medium">{connectionTest.videoQuality}</span>
                </div>
                <div>
                  <span className="text-gray-600">Audio Quality:</span>
                  <span className="ml-2 font-medium">{connectionTest.audioQuality}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Video className="h-5 w-5 text-blue-600" />
            <span>Video Settings</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Video Quality</label>
              <select
                value={settings.videoQuality}
                onChange={(e) => updateSetting('videoQuality', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low (360p) - Saves bandwidth</option>
                <option value="medium">Medium (720p) - Recommended</option>
                <option value="high">High (1080p) - Best quality</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Default Camera State</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="videoEnabled"
                    checked={settings.videoEnabled}
                    onChange={() => updateSetting('videoEnabled', true)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <Camera className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">On</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="videoEnabled"
                    checked={!settings.videoEnabled}
                    onChange={() => updateSetting('videoEnabled', false)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Off</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-green-600" />
            <span>Audio Settings</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Default Microphone State</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="audioEnabled"
                    checked={settings.audioEnabled}
                    onChange={() => updateSetting('audioEnabled', true)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <Mic className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">On</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="audioEnabled"
                    checked={!settings.audioEnabled}
                    onChange={() => updateSetting('audioEnabled', false)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Off</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Auto-Record Consultations</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoRecord}
                    onChange={(e) => updateSetting('autoRecord', e.target.checked)}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <Monitor className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Enable auto-recording</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Recordings are encrypted and stored securely for medical records
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <span>Notifications</span>
          </h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Consultation Notifications</label>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => updateSetting('notifications', e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-sm">Enable appointment reminders and notifications</span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Receive notifications for upcoming appointments, cancellations, and important updates
              </p>
            </div>
          </div>
        </div>

        {/* Localization Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            <span>Localization</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
              <select
                value={settings.preferredLanguage}
                onChange={(e) => updateSetting('preferredLanguage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                <option value="Europe/Paris">Central European Time (CET)</option>
                <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {hasChanges && 'You have unsaved changes'}
          </div>
          
          <div className="flex space-x-3">
            <AnimatedButton
              variant="secondary"
              onClick={resetSettings}
              disabled={!hasChanges || isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              onClick={saveSettings}
              isLoading={isLoading}
              disabled={!hasChanges || isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeleconsultationSettings;