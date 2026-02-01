import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useRoutePreload } from '../hooks/useRoutePreload';
import {
  Heart,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Calendar,
  Pill,
  Activity,
  Video,
  BookOpen,
  Star
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { handleMouseEnter, handleFocus } = useRoutePreload();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    console.log('Logout clicked');
    logout();
    navigate('/login');
  };

  const handleNavClick = (path: string) => {
    console.log('Navigation clicked:', path);
    setIsMenuOpen(false);
  };

  const patientNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Activity },
    { path: '/appointments', label: 'Appointments', icon: Calendar },
    { path: '/medications', label: 'Medications', icon: Pill },
    { path: '/symptoms', label: 'Symptoms', icon: Activity },
    { path: '/teleconsultation', label: 'Teleconsultation', icon: Video },
    { path: '/education', label: 'Education', icon: BookOpen },
    { path: '/reviews', label: 'Reviews', icon: Star },
  ];

  const doctorNavItems = [
    { path: '/doctor-dashboard', label: 'Dashboard', icon: Activity },
    { path: '/appointments', label: 'Appointments', icon: Calendar },
    { path: '/teleconsultation', label: 'Teleconsultation', icon: Video },
    { path: '/education', label: 'Education', icon: BookOpen },
  ];

  const navItems = user?.role === 'patient' ? patientNavItems : doctorNavItems;

  if (!user) {
    return (
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">HealthCare+</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-blue-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">HealthCare+</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavClick(item.path)}
                  onMouseEnter={handleMouseEnter(item.path)}
                  onFocus={handleFocus(item.path)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <Link
                to="/profile"
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-1 transition-colors group"
                title="View Profile"
              >
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border border-blue-200">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => handleNavClick(item.path)}
                    onMouseEnter={handleMouseEnter(item.path)}
                    onFocus={handleFocus(item.path)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 left-0 mx-4 top-16 md:left-auto md:w-80 md:right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => notifications.forEach(n => !n.read && markAsRead(n.id))}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-8 text-sm text-gray-500 text-center">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="h-2 w-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-gray-100 bg-gray-50 rounded-b-lg text-center">
            <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              View Full History
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;