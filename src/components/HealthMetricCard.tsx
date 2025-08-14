import React from 'react';
import { HealthMetric } from '../types';
import { Activity, Heart, Weight, Zap, Footprints, Moon } from 'lucide-react';

interface HealthMetricCardProps {
  metric: HealthMetric;
  trend?: 'up' | 'down' | 'stable';
}

const HealthMetricCard: React.FC<HealthMetricCardProps> = ({ metric, trend }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'blood_sugar': return <Activity className="h-5 w-5 text-red-600" />;
      case 'blood_pressure': return <Heart className="h-5 w-5 text-blue-600" />;
      case 'weight': return <Weight className="h-5 w-5 text-green-600" />;
      case 'heart_rate': return <Zap className="h-5 w-5 text-orange-600" />;
      case 'steps': return <Footprints className="h-5 w-5 text-purple-600" />;
      case 'sleep': return <Moon className="h-5 w-5 text-indigo-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case 'blood_sugar': return 'Blood Sugar';
      case 'blood_pressure': return 'Blood Pressure';
      case 'weight': return 'Weight';
      case 'heart_rate': return 'Heart Rate';
      case 'steps': return 'Steps';
      case 'sleep': return 'Sleep';
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getIcon(metric.type)}
          <h3 className="text-sm font-medium text-gray-900">{getTitle(metric.type)}</h3>
        </div>
        {trend && (
          <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
            {getTrendIcon(trend)}
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
          <span className="text-sm text-gray-600">{metric.unit}</span>
        </div>
        
        <p className="text-xs text-gray-500">
          {new Date(metric.recordedAt).toLocaleDateString()} at{' '}
          {new Date(metric.recordedAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
        
        {metric.notes && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{metric.notes}</p>
        )}
      </div>
    </div>
  );
};

export default HealthMetricCard;