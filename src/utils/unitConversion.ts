/**
 * Unit conversion utilities for health metrics
 */

export interface ConversionResult {
  value: number;
  unit: string;
  originalValue: number;
  originalUnit: string;
}

/**
 * Convert blood sugar between mg/dL and mmol/L
 */
export const convertBloodSugar = (value: number, fromUnit: string, toUnit: string): ConversionResult => {
  let convertedValue = value;
  
  if (fromUnit === 'mg/dL' && toUnit === 'mmol/L') {
    convertedValue = value / 18.0182;
  } else if (fromUnit === 'mmol/L' && toUnit === 'mg/dL') {
    convertedValue = value * 18.0182;
  }
  
  return {
    value: Math.round(convertedValue * 100) / 100, // Round to 2 decimal places
    unit: toUnit,
    originalValue: value,
    originalUnit: fromUnit
  };
};

/**
 * Convert weight between kg and lbs
 */
export const convertWeight = (value: number, fromUnit: string, toUnit: string): ConversionResult => {
  let convertedValue = value;
  
  if (fromUnit === 'kg' && toUnit === 'lbs') {
    convertedValue = value * 2.20462;
  } else if (fromUnit === 'lbs' && toUnit === 'kg') {
    convertedValue = value / 2.20462;
  }
  
  return {
    value: Math.round(convertedValue * 100) / 100,
    unit: toUnit,
    originalValue: value,
    originalUnit: fromUnit
  };
};

/**
 * Convert temperature between Celsius and Fahrenheit
 */
export const convertTemperature = (value: number, fromUnit: string, toUnit: string): ConversionResult => {
  let convertedValue = value;
  
  if (fromUnit === '°C' && toUnit === '°F') {
    convertedValue = (value * 9/5) + 32;
  } else if (fromUnit === '°F' && toUnit === '°C') {
    convertedValue = (value - 32) * 5/9;
  }
  
  return {
    value: Math.round(convertedValue * 100) / 100,
    unit: toUnit,
    originalValue: value,
    originalUnit: fromUnit
  };
};

/**
 * Generic unit converter that routes to specific conversion functions
 */
export const convertUnit = (
  value: number, 
  fromUnit: string, 
  toUnit: string, 
  metricType: string
): ConversionResult => {
  if (fromUnit === toUnit) {
    return {
      value,
      unit: toUnit,
      originalValue: value,
      originalUnit: fromUnit
    };
  }
  
  switch (metricType) {
    case 'blood_sugar':
      return convertBloodSugar(value, fromUnit, toUnit);
    case 'weight':
      return convertWeight(value, fromUnit, toUnit);
    case 'temperature':
      return convertTemperature(value, fromUnit, toUnit);
    default:
      // For metrics without conversion (heart_rate, blood_pressure, steps)
      return {
        value,
        unit: toUnit,
        originalValue: value,
        originalUnit: fromUnit
      };
  }
};

/**
 * Get available units for a metric type
 */
export const getAvailableUnits = (metricType: string): string[] => {
  const unitMap: Record<string, string[]> = {
    blood_sugar: ['mg/dL', 'mmol/L'],
    weight: ['kg', 'lbs'],
    temperature: ['°C', '°F'],
    heart_rate: ['bpm'],
    blood_pressure: ['mmHg'],
    steps: ['steps']
  };
  
  return unitMap[metricType] || [];
};

/**
 * Get the default unit for a metric type based on locale
 */
export const getDefaultUnit = (metricType: string, locale: string = 'en-US'): string => {
  const isMetric = locale !== 'en-US'; // Simplified locale check
  
  const defaultUnits: Record<string, { metric: string; imperial: string }> = {
    blood_sugar: { metric: 'mmol/L', imperial: 'mg/dL' },
    weight: { metric: 'kg', imperial: 'lbs' },
    temperature: { metric: '°C', imperial: '°F' },
    heart_rate: { metric: 'bpm', imperial: 'bpm' },
    blood_pressure: { metric: 'mmHg', imperial: 'mmHg' },
    steps: { metric: 'steps', imperial: 'steps' }
  };
  
  const units = defaultUnits[metricType];
  if (!units) return '';
  
  return isMetric ? units.metric : units.imperial;
};

/**
 * Format a health reading value with proper units and precision
 */
export const formatHealthReading = (
  value: string | number, 
  unit: string, 
  metricType: string
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return `${value} ${unit}`;
  
  // Special formatting for different metric types
  switch (metricType) {
    case 'blood_sugar':
      return unit === 'mmol/L' 
        ? `${numValue.toFixed(1)} ${unit}`
        : `${Math.round(numValue)} ${unit}`;
    case 'weight':
      return `${numValue.toFixed(1)} ${unit}`;
    case 'temperature':
      return `${numValue.toFixed(1)}${unit}`;
    case 'heart_rate':
    case 'steps':
      return `${Math.round(numValue)} ${unit}`;
    case 'blood_pressure':
      return `${value} ${unit}`; // Blood pressure is already formatted as "120/80"
    default:
      return `${numValue} ${unit}`;
  }
};

/**
 * Validate if a unit is valid for a given metric type
 */
export const isValidUnit = (unit: string, metricType: string): boolean => {
  const availableUnits = getAvailableUnits(metricType);
  return availableUnits.includes(unit);
};

/**
 * Get conversion suggestions for better user experience
 */
export const getConversionSuggestion = (
  value: number, 
  unit: string, 
  metricType: string
): string | null => {
  const availableUnits = getAvailableUnits(metricType);
  const otherUnits = availableUnits.filter(u => u !== unit);
  
  if (otherUnits.length === 0) return null;
  
  const converted = convertUnit(value, unit, otherUnits[0], metricType);
  return `${formatHealthReading(converted.value, converted.unit, metricType)}`;
};