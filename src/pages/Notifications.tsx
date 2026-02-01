import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, Check, Trash2, Clock, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotificationsPage: React.FC = () => {
    const { notifications, markAsRead, deleteNotification } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
            default: return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getBackgroundColor = (type: string, read: boolean) => {
        if (read) return 'bg-white border-gray-100';
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            case 'error': return 'bg-red-50 border-red-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600 mt-1">Manage your alerts and messages</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => notifications.forEach(n => !n.read && markAsRead(n.id))}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Check className="h-4 w-4" />
                        <span>Mark all read</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 text-center p-8">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <Bell className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
                        <p className="text-gray-500 max-w-sm mt-2">
                            When you receive alerts, appointment updates, or messages, they will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`p-6 flex items-start space-x-4 hover:bg-gray-50 transition-colors ${getBackgroundColor(notification.type, notification.read)
                                    } border-l-4 ${!notification.read ? (
                                        notification.type === 'success' ? 'border-l-green-500' :
                                            notification.type === 'warning' ? 'border-l-yellow-500' :
                                                notification.type === 'error' ? 'border-l-red-500' :
                                                    'border-l-blue-500'
                                    ) : 'border-l-transparent'
                                    }`}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-blue-900'}`}>
                                            {notification.title}
                                        </h3>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-blue-800'}`}>
                                        {notification.message}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 flex flex-col space-y-2 ml-4">
                                    {!notification.read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                            title="Mark as read"
                                        >
                                            <div className="h-2 w-2 bg-blue-600 rounded-full" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
