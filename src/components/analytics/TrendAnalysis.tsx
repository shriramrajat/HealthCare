import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { HealthMetric } from '../../types';
import { firestoreService } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface TrendAnalysisProps {
  metricType?: string;
  timeRange?: 'week' | 'month' | '3months' | '6months';
}

interface TrendInsight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  recommendation?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MetricTrend {
  metricType: string;
  trend: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  averageValue: number;
  insights: TrendInsight[];
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  metricType,
  timeRange = 'month'
}) => {
  const { user } = useAuth();
  const [trends, setTrends] = useState<MetricTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeTrends = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const allMetrics = await firestoreService.getHealthMetrics(user.id);
        
        // Filter by time range
        const cutoffDate = new Date();
        switch (timeRange) {
          case 'week':
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            break;
          case '3months':
            cutoffDate.setMonth(cutoffDate.getMonth() - 3);
            break;
          case '6months':
            cutoffDate.setMonth(cutoffDate.getMonth() - 6);
            break;
        }

        const filteredMetrics = allMetrics.filter(metric => 
          new Date(metric.recordedAt) >= cutoffDate &&
          (!metricType || metric.type === metricType)
        );

        // Group by metric type
        const groupedMetrics = filteredMetrics.reduce((acc, metric) => {
          if (!acc[metric.type]) acc[metric.type] = [];
          acc[metric.type].push(metric);
          return acc;
        }, {} as Record<string, HealthMetric[]>);

        // Analyze trends for each metric type
        const analyzedTrends = Object.entries(groupedMetrics).map(([type, metrics]) => 
          analyzeMetricTrend(type, metrics)
        );

        setTrends(analyzedTrends);
      } catch (error) {
        console.error('Error analyzing trends:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeTrends();
  }, [user?.id, metricType, timeRange]);

  const analyzeMetricTrend = (type: string, metrics: HealthMetric[]): MetricTrend => {
    if (metrics.length < 2) {
      return {
        metricType: type,
        trend: 'stable',
        changePercentage: 0,
        averageValue: 0,
        insights: [{
          type: 'neutral',
          title: 'Insufficient Data',
          description: 'Need more readings to analyze trends',
          icon: Info
        }]
      };
    }

    // Sort by date (newest first)
    const sortedMetrics = metrics.sort((a, b) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );

    // Calculate trend
    const recentValues = sortedMetrics.slice(0, Math.min(5, sortedMetrics.length))
      .map(m => parseNumericValue(m.value, type))
      .filter(v => v !== null) as number[];

    const olderValues = sortedMetrics.slice(-Math.min(5, sortedMetrics.length))
      .map(m => parseNumericValue(m.value, type))
      .filter(v => v !== null) as number[];

    const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const olderAvg = olderValues.reduce((sum, val) => sum + val, 0) / olderValues.length;
    
    const changePercentage = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (Math.abs(changePercentage) > 5) {
      // Determine if change is positive or negative based on metric type
      const isImprovement = isPositiveChange(type, changePercentage > 0);
      trend = isImprovement ? 'improving' : 'declining';
    }

    const insights = generateInsights(type, trend, changePercentage, recentAvg, sortedMetrics);

    return {
      metricType: type,
      trend,
      changePercentage: Math.abs(changePercentage),
      averageValue: recentAvg,
      insights
    };
  };

  const parseNumericValue = (value: string, type: string): number | null => {
    if (type === 'blood_pressure') {
      const match = value.match(/(\d+)\/(\d+)/);
      if (match) {
        // Use systolic pressure for trend analysis
        return parseInt(match[1]);
      }
    }
    
    const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(numValue) ? null : numValue;
  };

  const isPositiveChange = (metricType: string, isIncrease: boolean): boolean => {
    // Define which metrics benefit from increases vs decreases
    const increaseIsBetter = ['steps', 'sleep'];
    const decreaseIsBetter = ['blood_pressure', 'blood_sugar', 'weight'];
    
    if (increaseIsBetter.includes(metricType)) return isIncrease;
    if (decreaseIsBetter.includes(metricType)) return !isIncrease;
    
    // For heart_rate and temperature, stable is usually better
    return false;
  };

  const generateInsights = (
    type: string, 
    trend: 'improving' | 'declining' | 'stable',
    changePercentage: number,
    averageValue: number,
    metrics: HealthMetric[]
  ): TrendInsight[] => {
    const insights: TrendInsight[] = [];

    // Trend insight
    if (trend === 'improving') {
      insights.push({
        type: 'positive',
        title: 'Positive Trend',
        description: `Your ${type.replace('_', ' ')} has improved by ${changePercentage.toFixed(1)}%`,
        recommendation: 'Keep up the great work! Continue your current routine.',
        icon: CheckCircle
      });
    } else if (trend === 'declining') {
      insights.push({
        type: 'warning',
        title: 'Attention Needed',
        description: `Your ${type.replace('_', ' ')} has changed by ${changePercentage.toFixed(1)}%`,
        recommendation: 'Consider consulting with your healthcare provider.',
        icon: AlertTriangle
      });
    }

    // Consistency insight
    const values = metrics.slice(0, 7).map(m => parseNumericValue(m.value, type)).filter(v => v !== null) as number[];
    if (values.length >= 3) {
      const variance = calculateVariance(values);
      const coefficient = Math.sqrt(variance) / averageValue;
      
      if (coefficient < 0.1) {
        insights.push({
          type: 'positive',
          title: 'Consistent Readings',
          description: 'Your readings show good consistency',
          icon: CheckCircle
        });
      } else if (coefficient > 0.2) {
        insights.push({
          type: 'neutral',
          title: 'Variable Readings',
          description: 'Your readings show some variation',
          recommendation: 'Try to maintain consistent measurement conditions.',
          icon: Info
        });
      }
    }

    // Range-based insights
    const rangeInsight = getRangeInsight(type, averageValue);
    if (rangeInsight) {
      insights.push(rangeInsight);
    }

    return insights;
  };

  const calculateVariance = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  };

  const getRangeInsight = (type: string, value: number): TrendInsight | null => {
    const ranges: Record<string, { normal: [number, number]; warning: [number, number] }> = {
      blood_pressure: { normal: [90, 140], warning: [140, 180] },
      blood_sugar: { normal: [70, 140], warning: [140, 200] },
      heart_rate: { normal: [60, 100], warning: [100, 120] },
      weight: { normal: [50, 100], warning: [100, 150] },
      temperature: { normal: [36, 37.5], warning: [37.5, 39] }
    };

    const range = ranges[type];
    if (!range) return null;

    if (value >= range.warning[0] && value <= range.warning[1]) {
      return {
        type: 'warning',
        title: 'Outside Normal Range',
        description: `Your average ${type.replace('_', ' ')} is in the elevated range`,
        recommendation: 'Consider discussing this with your healthcare provider.',
        icon: AlertTriangle
      };
    } else if (value >= range.normal[0] && value <= range.normal[1]) {
      return {
        type: 'positive',
        title: 'Normal Range',
        description: `Your average ${type.replace('_', ' ')} is within normal limits`,
        icon: CheckCircle
      };
    }

    return null;
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 bg-gray-400 rounded-full" />;
    }
  };

  const getInsightColor = (type: 'positive' | 'negative' | 'neutral' | 'warning') => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'negative':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-24" />
        ))}
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="text-center py-8">
        <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No data available for trend analysis</p>
        <p className="text-sm text-gray-400">Add more health readings to see insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Health Trends & Insights</h3>
        <span className="text-sm text-gray-500 capitalize">{timeRange} analysis</span>
      </div>

      {trends.map((trendData, index) => (
        <motion.div
          key={trendData.metricType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getTrendIcon(trendData.trend)}
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {trendData.metricType.replace('_', ' ')}
                </h4>
                <p className="text-sm text-gray-600">
                  {trendData.changePercentage.toFixed(1)}% change
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Average</p>
              <p className="font-semibold text-gray-900">
                {trendData.averageValue.toFixed(1)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {trendData.insights.map((insight, insightIndex) => (
              <motion.div
                key={insightIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + insightIndex * 0.1 }}
                className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start space-x-2">
                  <insight.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-sm opacity-90">{insight.description}</p>
                    {insight.recommendation && (
                      <p className="text-xs mt-1 opacity-75">{insight.recommendation}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TrendAnalysis;