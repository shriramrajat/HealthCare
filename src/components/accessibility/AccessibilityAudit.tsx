import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Info, X, Play, Download } from 'lucide-react';
import { AccessibilityTester, generateAccessibilityReport } from '../../utils/accessibilityTesting';
import AnimatedButton from '../ui/AnimatedButton';

interface AccessibilityAuditProps {
  enabled?: boolean;
  className?: string;
}

export const AccessibilityAudit: React.FC<AccessibilityAuditProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [tester] = useState(() => AccessibilityTester.getInstance());

  const runAudit = async () => {
    setIsRunning(true);
    try {
      const result = await tester.auditContainer(document.body);
      setAuditResult(result);
    } catch (error) {
      console.error('Accessibility audit failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    if (!auditResult) return;

    const report = generateAccessibilityReport(auditResult);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'serious':
        return 'bg-orange-100 text-orange-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'minor':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!enabled) return null;

  return (
    <div className={`fixed bottom-20 right-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <AnimatedButton
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        size="sm"
        className="rounded-full p-3 shadow-lg"
        aria-label={isOpen ? 'Close accessibility audit' : 'Open accessibility audit'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
      </AnimatedButton>

      {/* Audit Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-96 max-h-96 overflow-y-auto"
            role="dialog"
            aria-label="Accessibility audit"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Accessibility Audit
                </h3>
                <div className="flex space-x-2">
                  {auditResult && (
                    <button
                      onClick={downloadReport}
                      className="text-sm text-gray-500 hover:text-gray-700"
                      aria-label="Download audit report"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Run Audit Button */}
              <AnimatedButton
                onClick={runAudit}
                disabled={isRunning}
                variant="primary"
                size="sm"
                className="w-full"
                isLoading={isRunning}
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Running Audit...' : 'Run Accessibility Audit'}
              </AnimatedButton>

              {/* Audit Results */}
              {auditResult && (
                <div className="space-y-3">
                  {/* Score */}
                  <div className={`p-3 rounded-lg border ${getScoreColor(auditResult.score)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Accessibility Score</span>
                      <span className="text-2xl font-bold">{auditResult.score}/100</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            auditResult.score >= 90 
                              ? 'bg-green-500' 
                              : auditResult.score >= 70 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${auditResult.score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-red-600 font-bold">{auditResult.summary.errors}</div>
                      <div className="text-red-600">Errors</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="text-yellow-600 font-bold">{auditResult.summary.warnings}</div>
                      <div className="text-yellow-600">Warnings</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-blue-600 font-bold">{auditResult.summary.info}</div>
                      <div className="text-blue-600">Info</div>
                    </div>
                  </div>

                  {/* Issues */}
                  {auditResult.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Issues Found</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {auditResult.issues.slice(0, 10).map((issue: any, index: number) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="flex items-start space-x-2">
                              {getIssueIcon(issue.type)}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{issue.rule}</span>
                                  <span className={`px-1 py-0.5 rounded text-xs ${getSeverityColor(issue.severity)}`}>
                                    {issue.severity}
                                  </span>
                                </div>
                                <p className="text-gray-600 mt-1">{issue.message}</p>
                                {issue.element && (
                                  <p className="text-gray-500 text-xs mt-1">
                                    Element: {issue.element.tagName.toLowerCase()}
                                    {issue.element.id && `#${issue.element.id}`}
                                    {issue.element.className && `.${issue.element.className.split(' ').join('.')}`}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {auditResult.issues.length > 10 && (
                          <div className="text-center text-sm text-gray-500">
                            ... and {auditResult.issues.length - 10} more issues
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className={`p-2 rounded text-center text-sm ${
                    auditResult.passed 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {auditResult.passed ? (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        All accessibility checks passed!
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Accessibility issues found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Accessibility Tips
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Use semantic HTML elements</li>
                  <li>• Provide alt text for images</li>
                  <li>• Ensure proper color contrast</li>
                  <li>• Make content keyboard accessible</li>
                  <li>• Use ARIA labels appropriately</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccessibilityAudit;