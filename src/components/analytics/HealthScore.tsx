import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, Info } from 'lucide-react';
import { HealthMetric } from '../../types';
import { firestoreService } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface HealthScoreProps {
  timeRange?: 'week' | 'month' | '3months';
}

interface ScoreComponent {
  name: string;
  score: number;
  weight: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  recommendations?: string[];
}

interface HealthScoreData {
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  components: ScoreComponent[];
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: string;
}

const HealthScore: React.FC<HealthScoreProps> = ({ timeRange = 'month' }) => {
  const { user } = useAuth();
  const [healthScore, setHealthScore] = useState<HealthScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateHealthScore();
  }, [user?.id, timeRange]);

  const calculateHealthScore = async () => {
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
      }

      const recentMetrics = allMetrics.filter(metric => 
        new Date(metric.recordedAt) >= cutoffDate
      );

      const scoreData = calculateScoreComponents(recentMetrics);
      setHealthScore(scoreData);
    } catch (error) {
      console.error('Error calculating health score:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScoreComponents = (metrics: HealthMetric[]): HealthScoreData => {
    const components: ScoreComponent[] = [];
    
    // Group metrics by type
    const groupedMetrics = metrics.reduce((acc, metric) => {
      if (!acc[metric.type]) acc[metric.type] = [];
      acc[metric.type].push(metric);
      return acc;
    }, {} as Record<string, HealthMetric[]>);

    // Calculate score for each metric type
    Object.entries(groupedMetrics).forEach(([type, typeMetrics]) => {
      const component = calculateMetricScore(type, typeMetrics);
      if (component) components.push(component);
    });

    // Add consistency score
    const consistencyScore = calculateConsistencyScore(metrics);
    components.push(consistencyScore);

    // Calculate overall score
    const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0);
    const weightedScore = components.reduce((sum, comp) => sum + (comp.score * comp.weight), 0);
    const overallScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

    // Determine grade
    const grade = getGrade(overallScore);

    // Calculate trend (simplified - would need historical data)
    const trend = 'stable'; // This would be calculated from previous scores

    return {
      overallScore,
      grade,
      components,
      trend,
      lastUpdated: new Date().toISOString()
    };
  };

  const calculateMetricScore = (type: string, metrics: HealthMetric[]): ScoreComponent | null => {
    if (metrics.length === 0) return null;

    const latestMetric = metrics.sort((a, b) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )[0];

    const value = parseNumericValue(latestMetric.value, type);
    if (value === null) return null;

    let score = 0;
    let status: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    let description = '';
    let recommendations: string[] = [];

    switch (type) {
      case 'blood_pressure':
        const systolic = value; // Using systolic for scoring
        if (systolic < 120) {
          score = 100;
          status = 'excellent';
          description = 'Your blood pressure is in the optimal range';
        } else if (systolic < 130) {
          score = 85;
          status = 'good';
          description = 'Your blood pressure is normal';
        } else if (systolic < 140) {
          score = 70;
          status = 'fair';
          description = 'Your blood pressure is elevated';
          recommendations = ['Reduce sodium intake', 'Exercise regularly', 'Manage stress'];
        } else {
          score = 40;
          status = 'poor';
          description = 'Your blood pressure is high';
          recommendations = ['Consult your doctor', 'Monitor daily', 'Follow medication regimen'];
        }
        break;

      case 'blood_sugar':
        if (value < 100) {
          score = 100;
          status = 'excellent';
          description = 'Your blood sugar is in the normal range';
        } else if (value < 126) {
          score = 75;
          status = 'good';
          description = 'Your blood sugar is slightly elevated';
          recommendations = ['Monitor carbohydrate intake', 'Exercise after meals'];
        } else if (value < 200) {
          score = 50;
          status = 'fair';
          description = 'Your blood sugar indicates pre-diabetes';
          recommendations = ['Consult your doctor', 'Follow diabetic diet', 'Regular monitoring'];
        } else {
          score = 25;
          status = 'poor';
          description = 'Your blood sugar is in diabetic range';
          recommendations = ['Immediate medical attention', 'Strict diet control', 'Medication compliance'];
        }
        break;

      case 'heart_rate':
        if (value >= 60 && value <= 100) {
          score = 100;
          status = 'excellent';
          description = 'Your heart rate is in the normal range';
        } else if ((value >= 50 && value < 60) || (value > 100 && value <= 110)) {
          score = 80;
          status = 'good';
          description = 'Your heart rate is slightly outside normal range';
        } else if ((value >= 40 && value < 50) || (value > 110 && value <= 120)) {
          score = 60;
          status = 'fair';
          description = 'Your heart rate needs attention';
          recommendations = ['Monitor regularly', 'Consider cardio exercise'];
        } else {
          score = 30;
          status = 'poor';
          description = 'Your heart rate is concerning';
          recommendations = ['Consult a cardiologist', 'Avoid strenuous activity'];
        }
        break;

      case 'weight':
        // This would need BMI calculation with height data
        score = 85;
        status = 'good';
        description = 'Weight tracking is important for overall health';
        break;

      case 'steps':
        if (value >= 10000) {
          score = 100;
          status = 'excellent';
          description = 'You\'re meeting daily activity goals';
        } else if (value >= 7500) {
          score = 85;
          status = 'good';
          description = 'Good activity level';
        } else if (value >= 5000) {
          score = 70;
          status = 'fair';
          description = 'Moderate activity level';
          recommendations = ['Aim for 10,000 steps daily', 'Take walking breaks'];
        } else {
          score = 50;
          status = 'poor';
          description = 'Low activity level';
          recommendations = ['Increase daily walking', 'Use stairs instead of elevators'];
        }
        break;

      default:
        return null;
    }

    return {
      name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      score,
      weight: getMetricWeight(type),
      status,
      description,
      recommendations
    };
  };

  const calculateConsistencyScore = (metrics: HealthMetric[]): ScoreComponent => {
    const daysWithReadings = new Set(
      metrics.map(m => new Date(m.recordedAt).toDateString())
    ).size;

    const totalDays = Math.min(30, Math.ceil((Date.now() - new Date(metrics[metrics.length - 1]?.recordedAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)));
    const consistencyRate = totalDays > 0 ? (daysWithReadings / totalDays) * 100 : 0;

    let score = Math.round(consistencyRate);
    let status: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    let description = '';
    let recommendations: string[] = [];

    if (consistencyRate >= 80) {
      status = 'excellent';
      description = 'Excellent tracking consistency';
    } else if (consistencyRate >= 60) {
      status = 'good';
      description = 'Good tracking consistency';
    } else if (consistencyRate >= 40) {
      status = 'fair';
      description = 'Fair tracking consistency';
      recommendations = ['Set daily reminders', 'Track at the same time each day'];
    } else {
      status = 'poor';
      description = 'Inconsistent tracking';
      recommendations = ['Establish a routine', 'Use app notifications', 'Start with one metric'];
    }

    return {
      name: 'Tracking Consistency',
      score,
      weight: 0.2,
      status,
      description,
      recommendations
    };
  };

  const parseNumericValue = (value: string, type: string): number | null => {
    if (type === 'blood_pressure') {
      const match = value.match(/(\d+)\/(\d+)/);
      return match ? parseInt(match[1]) : null;
    }
    
    const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(numValue) ? null : numValue;
  };

  const getMetricWeight = (type: string): number => {
    const weights: Record<string, number> = {
      blood_pressure: 0.25,
      blood_sugar: 0.25,
      heart_rate: 0.2,
      weight: 0.15,
      steps: 0.15
    };
    return weights[type] || 0.1;
  };

  const getGrade = (score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' => {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'B+';
    if (score >= 87) return 'B';
    if (score >= 83) return 'C+';
    if (score >= 80) return 'C';
    if (score >= 70) return 'D';
    return 'F';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: 'excellent' | 'good' | 'fair' | 'poor') => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!healthScore) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Health Data</h3>
        <p className="text-gray-600">Add health readings to see your health score</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      {/* Overall Score */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthScore.overallScore / 100)}`}
                className={getScoreColor(healthScore.overallScore)}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - healthScore.overallScore / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(healthScore.overallScore)}`}>
                {healthScore.overallScore}
              </span>
            </div>
          </div>
          
          <div className="text-left">
            <h3 className="text-2xl font-bold text-gray-900">Health Score</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-3xl font-bold ${getScoreColor(healthScore.overallScore)}`}>
                {healthScore.grade}
              </span>
              {healthScore.trend === 'improving' && (
                <TrendingUp className="h-5 w-5 text-green-500" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              Last updated: {new Date(healthScore.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Score Components */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Score Breakdown</h4>
        
        {healthScore.components.map((component, index) => (
          <motion.div
            key={component.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-900">{component.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(component.status)}`}>
                  {component.status}
                </span>
              </div>
              <span className={`font-bold ${getScoreColor(component.score)}`}>
                {component.score}/100
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <motion.div
                className={`h-2 rounded-full ${component.score >= 90 ? 'bg-green-500' : 
                  component.score >= 80 ? 'bg-yellow-500' : 
                  component.score >= 70 ? 'bg-orange-500' : 'bg-red-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${component.score}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{component.description}</p>
            
            {component.recommendations && component.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-md p-3">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Recommendations:</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {component.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start space-x-1">
                          <span>•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default HealthScore;