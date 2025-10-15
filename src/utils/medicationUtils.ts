// Medication utility functions for interactions and dosage calculations

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
}

export interface DosageCalculation {
  medication: string;
  weight?: number;
  age?: number;
  condition?: string;
  recommendedDose: string;
  maxDailyDose: string;
  frequency: string;
  notes: string[];
}

// Common drug interactions database (simplified for demo)
const DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    drug1: 'warfarin',
    drug2: 'aspirin',
    severity: 'severe',
    description: 'Increased risk of bleeding',
    recommendation: 'Monitor INR closely and consider alternative pain relief'
  },
  {
    drug1: 'metformin',
    drug2: 'lisinopril',
    severity: 'mild',
    description: 'May enhance hypoglycemic effect',
    recommendation: 'Monitor blood glucose levels regularly'
  },
  {
    drug1: 'atorvastatin',
    drug2: 'amlodipine',
    severity: 'moderate',
    description: 'Increased statin levels may increase muscle toxicity risk',
    recommendation: 'Consider lower statin dose and monitor for muscle symptoms'
  },
  {
    drug1: 'omeprazole',
    drug2: 'metformin',
    severity: 'mild',
    description: 'May affect vitamin B12 absorption',
    recommendation: 'Monitor B12 levels with long-term use'
  },
  {
    drug1: 'levothyroxine',
    drug2: 'metformin',
    severity: 'mild',
    description: 'May affect thyroid hormone absorption',
    recommendation: 'Take medications at different times (4+ hours apart)'
  }
];

// Common medication dosage guidelines (simplified for demo)
const DOSAGE_GUIDELINES: Record<string, DosageCalculation> = {
  'aspirin': {
    medication: 'Aspirin',
    recommendedDose: '75-100mg daily (cardioprotective)',
    maxDailyDose: '4000mg',
    frequency: 'Once daily with food',
    notes: [
      'Take with food to reduce stomach irritation',
      'Avoid if allergic to NSAIDs',
      'Consult doctor if taking blood thinners'
    ]
  },
  'ibuprofen': {
    medication: 'Ibuprofen',
    recommendedDose: '200-400mg every 4-6 hours',
    maxDailyDose: '1200mg (OTC) / 3200mg (prescription)',
    frequency: 'Every 4-6 hours as needed',
    notes: [
      'Take with food or milk',
      'Do not exceed maximum daily dose',
      'Avoid if you have kidney problems or heart disease'
    ]
  },
  'acetaminophen': {
    medication: 'Acetaminophen',
    recommendedDose: '325-650mg every 4-6 hours',
    maxDailyDose: '3000mg',
    frequency: 'Every 4-6 hours as needed',
    notes: [
      'Can be taken with or without food',
      'Do not exceed 3000mg in 24 hours',
      'Avoid alcohol while taking this medication'
    ]
  },
  'lisinopril': {
    medication: 'Lisinopril',
    recommendedDose: '5-10mg daily (starting dose)',
    maxDailyDose: '40mg',
    frequency: 'Once daily',
    notes: [
      'Take at the same time each day',
      'May cause dizziness when standing up',
      'Monitor blood pressure regularly'
    ]
  },
  'metformin': {
    medication: 'Metformin',
    recommendedDose: '500mg twice daily with meals',
    maxDailyDose: '2550mg',
    frequency: 'Twice daily with meals',
    notes: [
      'Take with meals to reduce stomach upset',
      'Start with lower dose and increase gradually',
      'Monitor kidney function regularly'
    ]
  }
};

/**
 * Check for drug interactions between medications
 */
export const checkDrugInteractions = (medications: string[]): DrugInteraction[] => {
  const interactions: DrugInteraction[] = [];
  const normalizedMeds = medications.map(med => med.toLowerCase().trim());

  for (let i = 0; i < normalizedMeds.length; i++) {
    for (let j = i + 1; j < normalizedMeds.length; j++) {
      const med1 = normalizedMeds[i];
      const med2 = normalizedMeds[j];

      // Check both directions of interaction
      const interaction = DRUG_INTERACTIONS.find(
        inter => 
          (inter.drug1.toLowerCase() === med1 && inter.drug2.toLowerCase() === med2) ||
          (inter.drug1.toLowerCase() === med2 && inter.drug2.toLowerCase() === med1)
      );

      if (interaction) {
        interactions.push(interaction);
      }
    }
  }

  return interactions;
};

/**
 * Get dosage information for a medication
 */
export const getDosageInformation = (medicationName: string): DosageCalculation | null => {
  const normalizedName = medicationName.toLowerCase().trim();
  return DOSAGE_GUIDELINES[normalizedName] || null;
};

/**
 * Calculate personalized dosage based on weight and age (simplified)
 */
export const calculatePersonalizedDosage = (
  medicationName: string,
  weight?: number,
  age?: number
): DosageCalculation | null => {
  const baseDosage = getDosageInformation(medicationName);
  if (!baseDosage) return null;

  // Simple weight-based adjustments (this would be more complex in real implementation)
  let adjustedDosage = { ...baseDosage };

  if (weight && medicationName.toLowerCase() === 'acetaminophen') {
    // Pediatric dosing: 10-15mg/kg every 4-6 hours
    if (age && age < 18) {
      const dosePerKg = 12; // mg/kg
      const calculatedDose = Math.round(weight * dosePerKg);
      adjustedDosage.recommendedDose = `${calculatedDose}mg every 4-6 hours`;
      adjustedDosage.notes = [
        ...adjustedDosage.notes,
        `Calculated based on weight: ${weight}kg`
      ];
    }
  }

  if (age && age >= 65) {
    adjustedDosage.notes = [
      ...adjustedDosage.notes,
      'Consider lower starting dose due to age (65+)',
      'Monitor for increased sensitivity to medication effects'
    ];
  }

  return adjustedDosage;
};

/**
 * Search medications with autocomplete
 */
export const searchMedications = (query: string, limit: number = 10): string[] => {
  const allMedications = [
    'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Lisinopril', 'Metformin',
    'Atorvastatin', 'Amlodipine', 'Omeprazole', 'Levothyroxine', 'Metoprolol',
    'Warfarin', 'Prednisone', 'Albuterol', 'Furosemide', 'Gabapentin',
    'Sertraline', 'Trazodone', 'Tramadol', 'Hydrochlorothiazide', 'Losartan',
    'Simvastatin', 'Pantoprazole', 'Citalopram', 'Montelukast', 'Escitalopram'
  ];

  if (!query.trim()) return allMedications.slice(0, limit);

  const filtered = allMedications.filter(med =>
    med.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.slice(0, limit);
};

/**
 * Get severity color for interactions
 */
export const getInteractionSeverityColor = (severity: DrugInteraction['severity']): string => {
  switch (severity) {
    case 'mild':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'moderate':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'severe':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * Get severity icon for interactions
 */
export const getInteractionSeverityIcon = (severity: DrugInteraction['severity']): string => {
  switch (severity) {
    case 'mild':
      return '⚠️';
    case 'moderate':
      return '🔶';
    case 'severe':
      return '🚨';
    default:
      return 'ℹ️';
  }
};