import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { PerformanceMonitor as PerfMonitor } from '../../utils/performance';
import AnimatedButton from '../ui/AnimatedButton';

interface PerformanceStats {
  name: string;
  avg: number;
  min: number;
  max: number;
  count: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<PerformanceStats[]>([]);
  const [monitor] = useState(() => PerfMonitor.getInstance());

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      // Get stats for common operations
      const operations = [
        'component-render',
        'animation-frame',
        'form-validation',
        'api-request',
        'image-load'
      ];

      const newStats = operations
        .map(op => monitor.getStats(op))
        .filter((stat): stat is NonNullable<typeof stat> => stat !== null)
        .map((stat, index) => ({
          name: operations[index],
          ...stat
        }));

      setStats(newStats);
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, monitor]);

  if (!enabled) return null;

  const getPerformanceStatus = (avg: number) => {
    if (avg < 16) return 'good'; // 60fps
    if (avg < 33) return 'warning'; // 30fps
    return 'poor'; // <30fps
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <AnimatedButton
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        size="sm"
        className="rounded-full p-3 shadow-lg"
        aria-label={isOpen ? 'Close performance monitor' : 'Open performance monitor'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
      </AnimatedButton>

      {/* Performance Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-96"
            role="dialog"
            aria-label="Performance monitor"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Performance Monitor
                </h3>
                <button
                  onClick={() => monitor.clear()}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  aria-label="Clear performance data"
                >
                  Clear
                </button>
              </div>

              {stats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No performance data available</p>
                  <p className="text-sm">Interact with the app to see metrics</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.map((stat) => {
                    const status = getPerformanceStatus(stat.avg);
                    return (
                      <div
                        key={stat.name}
                        className={`p-3 rounded-lg border ${getStatusColor(status)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {getStatusIcon(status)}
                            <span className="ml-2 font-medium capitalize">
                              {stat.name.replace('-', ' ')}
                            </span>
                          </div>
                          <span className="text-sm font-mono">
                            {stat.count} ops
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="text-xs opacity-75">Avg</div>
                            <div className="font-mono">
                              {stat.avg.toFixed(1)}ms
                            </div>
                          </div>
                          <div>
                            <div className="text-xs opacity-75">Min</div>
                            <div className="font-mono">
                              {stat.min.toFixed(1)}ms
                            </div>
                          </div>
                          <div>
                            <div className="text-xs opacity-75">Max</div>
                            <div className="font-mono">
                              {stat.max.toFixed(1)}ms
                            </div>
                          </div>
                        </div>

                        {/* Performance bar */}
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                status === 'good' 
                                  ? 'bg-green-500' 
                                  : status === 'warning' 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                              }`}
                              style={{
                                width: `${Math.min((stat.avg / 50) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Performance Tips */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Performance Tips
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Keep animations under 16ms for 60fps</li>
                  <li>• Use transform and opacity for smooth animations</li>
                  <li>• Debounce frequent operations</li>
                  <li>• Lazy load images and components</li>
                  <li>• Minimize DOM manipulations</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PerformanceMonitor;