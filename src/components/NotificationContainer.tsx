import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  const visibleNotifications = notifications
    .filter(n => !n.read)
    .slice(0, 3);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
          icon={getIcon(notification.type)}
          backgroundColor={getBackgroundColor(notification.type)}
        />
      ))}
    </div>
  );
};

interface NotificationToastProps {
  notification: any;
  onRemove: (id: string) => void;
  icon: React.ReactNode;
  backgroundColor: string;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onRemove,
  icon,
  backgroundColor
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  return (
    <div className={`w-80 p-4 rounded-lg border shadow-lg ${backgroundColor} animate-slide-in`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {notification.title}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {notification.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => onRemove(notification.id)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationContainer;