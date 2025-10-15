import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, Clock } from 'lucide-react';
import { HealthMetric } from '../../types';
import { firestoreService } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface HistoricalDataComparisonProps {
  metricType: string;
  currentValue?: string;
  unit: string;
}

interface TrendData {
  value: number;
  date: string;
  trend: 'up' | 'down' | 'stable';
  percentage?: number;
}

const HistoricalDataComparison: React.FC<HistoricalDataComparisonProps> = ({
  metricType,
  currentValue,
  unit
}) => {
  const { user } = useAuth();
  const [historicalData, setHistoricalData] = useState<HealthMetric[]>([]);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistoricalData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const allMetrics = await firestoreService.getHealthMetrics(user.id);
        
        // Filter by metric type and get last 5 readings
        const filteredMetrics = allMetrics
          .filter(metric => metric.type === metricType)
          .slice(0, 5);
        
        setHistoricalData(filteredMetrics);

        // Calculate trend if we have data and current value
        if (filteredMetrics.length > 0 && currentValue) {
          calculateTrend(filteredMetrics, currentValue);
        }
      } catch (error) {
        console.error('Error loading historical data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistoricalData();
  }, [user?.id, metricType, currentValue]);

  const calculateTrend = (metrics: HealthMetric[], current: string) => {
    if (metrics.length === 0) return;

    const latestMetric = metrics[0];
    const currentNumValue = parseNumericValue(current, metricType);
    const latestNumValue = parseNumericValue(latestMetric.value, metricType);

    if (currentNumValue === null || latestNumValue === null) return;

    const difference = currentNumValue - latestNumValue;
    const percentage = Math.abs((difference / latestNumValue) * 100);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(difference) > latestNumValue * 0.05) { // 5% threshold
      trend = difference > 0 ? 'up' : 'down';
    }

    setTrendData({
      value: currentNumValue,
      date: new Date().toISOString(),
      trend,
      percentage: Math.round(percentage * 10) / 10
    });
  };

  const parseNumericValue = (value: string, type: string): number | null => {
    if (type === 'blood_pressure') {
      const match = value.match(/(\d+)\/(\d+)/);
      if (match) {
        // Use systolic pressure for trend calculation
        return parseInt(match[1]);
      }
    }
    
    const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(numValue) ? null : numValue;
  };

  const formatValue = (value: string) => {
    return value.length > 20 ? `${value.substring(0, 20)}...` : value;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', metricType: string) => {
    // For some metrics, up is good (weight loss), for others down is good (blood pressure)
    const upIsGood = ['steps', 'weight'].includes(metricType);
    
    if (trend === 'stable') return 'text-gray-600';
    if (trend === 'up') return upIsGood ? 'text-green-600' : 'text-red-600';
    return upIsGood ? 'text-red-600' : 'text-green-600';
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (historicalData.length === 0) {
    return (
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
        <p className="text-sm text-blue-600">No previous readings found</p>
        <p className="text-xs text-blue-500">This will be your first {metricType.replace('_', ' ')} reading</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 rounded-lg p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Recent Readings</h4>
        {trendData && (
          <div className={`flex items-center space-x-1 text-sm ${getTrendColor(trendData.trend, metricType)}`}>
            {getTrendIcon(trendData.trend)}
            <span>
              {trendData.trend === 'stable' ? 'Stable' : `${trendData.percentage}%`}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {historicalData.slice(0, 3).map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">
                {new Date(metric.recordedAt).toLocaleDateString()}
              </span>
            </div>
            <span className="font-medium text-gray-900">
              {formatValue(metric.value)}
            </span>
          </motion.div>
        ))}
      </div>

      {historicalData.length > 3 && (
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
          +{historicalData.length - 3} more readings available
        </div>
      )}

      {trendData && currentValue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-md p-3 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current reading:</span>
            <span className="font-semibold text-gray-900">{formatValue(currentValue)} {unit}</span>
          </div>
          {trendData.trend !== 'stable' && (
            <div className={`text-xs mt-1 ${getTrendColor(trendData.trend, metricType)}`}>
              {trendData.trend === 'up' ? 'Higher' : 'Lower'} than your last reading
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default HistoricalDataComparison;