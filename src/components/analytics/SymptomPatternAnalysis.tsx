import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { Symptom } from '../../types';

interface SymptomPatternAnalysisProps {
  symptoms: Symptom[];
  className?: string;
}

interface PatternInsight {
  type: 'trend' | 'frequency' | 'severity' | 'trigger' | 'time';
  title: string;
  description: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const SymptomPatternAnalysis: React.FC<SymptomPatternAnalysisProps> = ({
  symptoms,
  className = ''
}) => {
  const insights = useMemo(() => {
    if (symptoms.length < 3) return [];

    const insights: PatternInsight[] = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentSymptoms = symptoms.filter(s => new Date(s.date) >= thirtyDaysAgo);

    // Frequency analysis
    const weeklyFrequency = recentSymptoms.length / 4;
    if (weeklyFrequency > 2) {
      insights.push({
        type: 'frequency',
        title: 'High Frequency',
        description: `You're experiencing symptoms ${weeklyFrequency.toFixed(1)} times per week on average`,
        value: `${weeklyFrequency.toFixed(1)}/week`,
        icon: <BarChart3 className="h-5 w-5" />,
        color: 'text-orange-600 bg-orange-50 border-orange-200'
      });
    }

    // Severity trend
    if (recentSymptoms.length >= 5) {
      const firstHalf = recentSymptoms.slice(-10, -5);
      const secondHalf = recentSymptoms.slice(-5);
      
      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstAvg = firstHalf.reduce((sum, s) => sum + s.severity, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, s) => sum + s.severity, 0) / secondHalf.length;
        const trend = secondAvg - firstAvg;

        if (Math.abs(trend) > 0.5) {
          insights.push({
            type: 'severity',
            title: trend > 0 ? 'Severity Increasing' : 'Severity Decreasing',
            description: `Average severity has ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trend).toFixed(1)} points recently`,
            value: `${trend > 0 ? '+' : ''}${trend.toFixed(1)}`,
            icon: trend > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />,
            color: trend > 0 ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-200'
          });
        }
      }
    }

    // Common triggers
    const triggerCounts: { [key: string]: number } = {};
    recentSymptoms.forEach(symptom => {
      symptom.triggers?.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
    });

    const mostCommonTrigger = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostCommonTrigger && mostCommonTrigger[1] >= 3) {
      insights.push({
        type: 'trigger',
        title: 'Common Trigger Identified',
        description: `"${mostCommonTrigger[0]}" appears in ${mostCommonTrigger[1]} recent symptoms`,
        value: `${mostCommonTrigger[1]} times`,
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
      });
    }

    // Time pattern analysis
    const timePatterns: { [key: string]: number } = {};
    recentSymptoms.forEach(symptom => {
      if (symptom.time) {
        const hour = parseInt(symptom.time.split(':')[0]);
        let timeOfDay = '';
        if (hour >= 6 && hour < 12) timeOfDay = 'Morning';
        else if (hour >= 12 && hour < 18) timeOfDay = 'Afternoon';
        else if (hour >= 18 && hour < 22) timeOfDay = 'Evening';
        else timeOfDay = 'Night';
        
        timePatterns[timeOfDay] = (timePatterns[timeOfDay] || 0) + 1;
      }
    });

    const mostCommonTime = Object.entries(timePatterns)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostCommonTime && mostCommonTime[1] >= 3) {
      insights.push({
        type: 'time',
        title: 'Time Pattern Detected',
        description: `Most symptoms occur in the ${mostCommonTime[0].toLowerCase()} (${mostCommonTime[1]} occurrences)`,
        value: mostCommonTime[0],
        icon: <Clock className="h-5 w-5" />,
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      });
    }

    // Symptom clustering (same symptoms recurring)
    const symptomCounts: { [key: string]: number } = {};
    recentSymptoms.forEach(symptom => {
      symptomCounts[symptom.name] = (symptomCounts[symptom.name] || 0) + 1;
    });

    const recurringSymptom = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (recurringSymptom && recurringSymptom[1] >= 4) {
      insights.push({
        type: 'frequency',
        title: 'Recurring Symptom',
        description: `"${recurringSymptom[0]}" has occurred ${recurringSymptom[1]} times recently`,
        value: `${recurringSymptom[1]} times`,
        icon: <Calendar className="h-5 w-5" />,
        color: 'text-purple-600 bg-purple-50 border-purple-200'
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  }, [symptoms]);

  if (symptoms.length < 3) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pattern Analysis</h3>
        <div className="text-center py-8">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Not enough data for pattern analysis</p>
          <p className="text-sm text-gray-400">
            Log at least 3 symptoms to see patterns and insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Pattern Analysis</h3>
        <div className="text-sm text-gray-500">
          Based on {symptoms.length} symptoms
        </div>
      </div>

      {insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${insight.color}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{insight.title}</h4>
                    <span className="text-sm font-semibold">{insight.value}</span>
                  </div>
                  <p className="text-sm mt-1 opacity-90">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Share these patterns with your healthcare provider</li>
              <li>• Consider keeping a detailed symptom diary</li>
              <li>• Look for environmental or lifestyle factors that might be contributing</li>
              <li>• Track your symptoms consistently for better insights</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No significant patterns detected</p>
          <p className="text-sm text-gray-400">
            Continue logging symptoms to identify patterns over time
          </p>
        </div>
      )}
    </div>
  );
};

export default SymptomPatternAnalysis;