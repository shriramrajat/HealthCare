import React from 'react';
import { Appointment } from '../types';
import { Calendar, Clock, Video, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  userRole: 'patient' | 'doctor';
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onJoinCall?: (id: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  userRole,
  onConfirm,
  onCancel,
  onJoinCall
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const isToday = new Date(appointment.date).toDateString() === new Date().toDateString();
  const isPast = new Date(appointment.date) < new Date();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {userRole === 'patient' ? `Dr. ${appointment.doctorName}` : appointment.patientName}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(appointment.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{appointment.time}</span>
            </div>
            <div className="flex items-center space-x-1">
              {appointment.type === 'teleconsultation' ? (
                <Video className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span className="capitalize">{appointment.type}</span>
            </div>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
          {getStatusIcon(appointment.status)}
          <span className="capitalize">{appointment.status}</span>
        </div>
      </div>

      {appointment.notes && (
        <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
          {appointment.notes}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isToday && appointment.status === 'confirmed' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Today
            </span>
          )}
          {isPast && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              Overdue
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {appointment.status === 'confirmed' && 
           appointment.type === 'teleconsultation' && 
           isToday && 
           onJoinCall && (
            <button
              onClick={() => onJoinCall(appointment.id)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Video className="h-4 w-4" />
              <span>Join Call</span>
            </button>
          )}
          
          {appointment.status === 'pending' && userRole === 'doctor' && (
            <>
              {onConfirm && (
                <button
                  onClick={() => onConfirm(appointment.id)}
                  className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm
                </button>
              )}
              {onCancel && (
                <button
                  onClick={() => onCancel(appointment.id)}
                  className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </>
          )}
          
          {(appointment.status === 'pending' || appointment.status === 'confirmed') && 
           userRole === 'patient' && 
           onCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;