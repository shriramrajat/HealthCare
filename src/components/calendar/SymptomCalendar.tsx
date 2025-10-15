import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { Symptom } from '../../types';

interface SymptomCalendarProps {
  symptoms: Symptom[];
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  onAddSymptom: (date: string) => void;
  view?: 'month' | 'week' | 'day';
  onViewChange?: (view: 'month' | 'week' | 'day') => void;
}

const SymptomCalendar: React.FC<SymptomCalendarProps> = ({
  symptoms,
  selectedDate,
  onDateSelect,
  onAddSymptom,
  view = 'month',
  onViewChange
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get symptoms for a specific date
  const getSymptomsForDate = (date: string) => {
    return symptoms.filter(symptom => symptom.date === date);
  };

  // Get the severity indicator color
  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-500';
    if (severity <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Generate calendar days for month view
  const generateMonthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateString = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === month;
      const isToday = dateString === new Date().toISOString().split('T')[0];
      const isSelected = dateString === selectedDate;
      const daySymptoms = getSymptomsForDate(dateString);
      
      days.push({
        date: new Date(current),
        dateString,
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        symptoms: daySymptoms,
        hasSymptoms: daySymptoms.length > 0,
        maxSeverity: daySymptoms.length > 0 ? Math.max(...daySymptoms.map(s => s.severity)) : 0
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate, symptoms, selectedDate]);

  // Generate week days for week view
  const generateWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(current.getDate() + i);
      const dateString = current.toISOString().split('T')[0];
      const isToday = dateString === new Date().toISOString().split('T')[0];
      const isSelected = dateString === selectedDate;
      const daySymptoms = getSymptomsForDate(dateString);
      
      days.push({
        date: current,
        dateString,
        day: current.getDate(),
        isToday,
        isSelected,
        symptoms: daySymptoms,
        hasSymptoms: daySymptoms.length > 0,
        maxSeverity: daySymptoms.length > 0 ? Math.max(...daySymptoms.map(s => s.severity)) : 0
      });
    }
    
    return days;
  }, [currentDate, symptoms, selectedDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (dateString: string) => {
    onDateSelect(dateString);
  };

  const handleAddSymptomClick = (dateString: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onAddSymptom(dateString);
  };

  const renderMonthView = () => (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        <AnimatePresence mode="wait">
          {generateMonthDays.map((day, index) => (
            <motion.div
              key={`${day.dateString}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.01, duration: 0.2 }}
              className={`
                relative p-2 min-h-[80px] border cursor-pointer transition-all duration-200
                ${day.isCurrentMonth 
                  ? 'bg-white hover:bg-blue-50' 
                  : 'bg-gray-50 text-gray-400'
                }
                ${day.isToday 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
                }
                ${day.isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-100' 
                  : ''
                }
                ${day.hasSymptoms && day.isCurrentMonth
                  ? 'border-l-4 border-l-red-400'
                  : ''
                }
              `}
              onClick={() => handleDateClick(day.dateString)}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-medium ${
                  day.isToday ? 'text-blue-600' : 
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.day}
                </span>
                
                {day.isCurrentMonth && (
                  <button
                    onClick={(e) => handleAddSymptomClick(day.dateString, e)}
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                    title="Add symptom"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>
              
              {/* Symptom Indicators */}
              {day.hasSymptoms && day.isCurrentMonth && (
                <div className="mt-1 space-y-1">
                  {day.symptoms.slice(0, 3).map((symptom, idx) => (
                    <motion.div
                      key={symptom.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`
                        text-xs px-2 py-1 rounded text-white truncate
                        ${getSeverityColor(symptom.severity)}
                      `}
                      title={`${symptom.name} (${symptom.severity}/10)`}
                    >
                      {symptom.name}
                    </motion.div>
                  ))}
                  {day.symptoms.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{day.symptoms.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {generateWeekDays.map((day, index) => (
          <motion.div
            key={day.dateString}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative p-4 min-h-[120px] border rounded-lg cursor-pointer transition-all duration-200
              ${day.isToday 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:bg-gray-50'
              }
              ${day.isSelected 
                ? 'ring-2 ring-blue-500 bg-blue-100' 
                : ''
              }
            `}
            onClick={() => handleDateClick(day.dateString)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase">
                  {dayNames[day.date.getDay()]}
                </div>
                <div className={`text-lg font-semibold ${
                  day.isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.day}
                </div>
              </div>
              
              <button
                onClick={(e) => handleAddSymptomClick(day.dateString, e)}
                className="opacity-0 hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                title="Add symptom"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {/* Symptom List */}
            {day.hasSymptoms && (
              <div className="space-y-1">
                {day.symptoms.map((symptom, idx) => (
                  <motion.div
                    key={symptom.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`
                      text-xs px-2 py-1 rounded text-white
                      ${getSeverityColor(symptom.severity)}
                    `}
                    title={`${symptom.name} (${symptom.severity}/10)`}
                  >
                    {symptom.name}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderDayView = () => {
    const daySymptoms = getSymptomsForDate(selectedDate || new Date().toISOString().split('T')[0]);
    
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button
              onClick={(e) => handleAddSymptomClick(
                selectedDate || new Date().toISOString().split('T')[0], 
                e
              )}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Symptom</span>
            </button>
          </div>
          
          {daySymptoms.length > 0 ? (
            <div className="space-y-3">
              {daySymptoms.map((symptom, index) => (
                <motion.div
                  key={symptom.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{symptom.name}</h4>
                    <div className={`
                      px-3 py-1 rounded-full text-sm font-medium text-white
                      ${getSeverityColor(symptom.severity)}
                    `}>
                      {symptom.severity}/10
                    </div>
                  </div>
                  
                  {symptom.time && (
                    <p className="text-sm text-gray-600 mb-2">
                      Time: {symptom.time}
                    </p>
                  )}
                  
                  {symptom.notes && (
                    <p className="text-sm text-gray-700 mb-2">{symptom.notes}</p>
                  )}
                  
                  {symptom.triggers && symptom.triggers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {symptom.triggers.map((trigger, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No symptoms recorded for this day</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {view === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            {view === 'week' && `Week of ${generateWeekDays[0]?.date.toLocaleDateString()}`}
            {view === 'day' && currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => view === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => view === 'month' ? navigateMonth('next') : navigateWeek('next')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* View Toggle */}
        {onViewChange && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <button
                key={viewType}
                onClick={() => onViewChange(viewType)}
                className={`
                  px-3 py-1 text-sm font-medium rounded-md transition-colors capitalize
                  ${view === viewType 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {viewType}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Calendar Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SymptomCalendar;