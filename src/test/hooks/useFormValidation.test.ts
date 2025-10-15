import { describe, it, expect } from 'vitest';
import * as yup from 'yup';
import {
  commonValidationSchemas,
  medicationValidationSchema,
  symptomValidationSchema,
  healthReadingValidationSchema
} from '../../hooks/useFormValidation';

describe('useFormValidation', () => {
  describe('Common Validation Schemas', () => {
    describe('email validation', () => {
      it('should validate correct email addresses', async () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org'
        ];

        for (const email of validEmails) {
          await expect(commonValidationSchemas.email.validate(email)).resolves.toBe(email);
        }
      });

      it('should reject invalid email addresses', async () => {
        const invalidEmails = [
          'invalid-email',
          '@domain.com',
          'user@',
          'user..name@domain.com',
          ''
        ];

        for (const email of invalidEmails) {
          await expect(commonValidationSchemas.email.validate(email)).rejects.toThrow();
        }
      });
    });

    describe('password validation', () => {
      it('should validate passwords with minimum length', async () => {
        const validPasswords = [
          'password123',
          'mySecureP@ss',
          'a'.repeat(8)
        ];

        for (const password of validPasswords) {
          await expect(commonValidationSchemas.password.validate(password)).resolves.toBe(password);
        }
      });

      it('should reject passwords that are too short', async () => {
        const invalidPasswords = [
          'short',
          '1234567',
          ''
        ];

        for (const password of invalidPasswords) {
          await expect(commonValidationSchemas.password.validate(password)).rejects.toThrow(/at least 8 characters/);
        }
      });
    });

    describe('name validation', () => {
      it('should validate names with minimum length', async () => {
        const validNames = [
          'John',
          'Jane Doe',
          'Dr. Smith'
        ];

        for (const name of validNames) {
          await expect(commonValidationSchemas.name.validate(name)).resolves.toBe(name);
        }
      });

      it('should reject names that are too short', async () => {
        const invalidNames = [
          'A',
          '',
          ' '
        ];

        for (const name of invalidNames) {
          await expect(commonValidationSchemas.name.validate(name)).rejects.toThrow();
        }
      });
    });

    describe('phone validation', () => {
      it('should validate correct phone numbers', async () => {
        const validPhones = [
          '+1234567890',
          '1234567890',
          '+44123456789',
          '9876543210'
        ];

        for (const phone of validPhones) {
          await expect(commonValidationSchemas.phone.validate(phone)).resolves.toBe(phone);
        }
      });

      it('should reject invalid phone numbers', async () => {
        const invalidPhones = [
          'abc123',
          '+',
          '123',
          '+0123456789' // starts with 0 after country code
        ];

        for (const phone of invalidPhones) {
          await expect(commonValidationSchemas.phone.validate(phone)).rejects.toThrow();
        }
      });
    });

    describe('number validation', () => {
      it('should validate numbers within range', async () => {
        const numberSchema = commonValidationSchemas.number(1, 10);
        
        const validNumbers = [1, 5, 10, 7.5];
        
        for (const num of validNumbers) {
          await expect(numberSchema.validate(num)).resolves.toBe(num);
        }
      });

      it('should reject numbers outside range', async () => {
        const numberSchema = commonValidationSchemas.number(1, 10);
        
        const invalidNumbers = [0, 11, -5, 15];
        
        for (const num of invalidNumbers) {
          await expect(numberSchema.validate(num)).rejects.toThrow();
        }
      });

      it('should reject non-numeric values', async () => {
        const numberSchema = commonValidationSchemas.number();
        
        const invalidValues = ['abc', 'not a number', null, undefined];
        
        for (const value of invalidValues) {
          await expect(numberSchema.validate(value)).rejects.toThrow(/valid number/);
        }
      });
    });

    describe('date validation', () => {
      it('should validate correct dates', async () => {
        const validDates = [
          new Date(),
          new Date('2024-01-01'),
          new Date('2023-12-31')
        ];

        for (const date of validDates) {
          await expect(commonValidationSchemas.date.validate(date)).resolves.toEqual(date);
        }
      });

      it('should reject invalid dates', async () => {
        const invalidDates = [
          'invalid-date',
          '2024-13-01', // invalid month
          '2024-02-30', // invalid day
          ''
        ];

        for (const date of invalidDates) {
          await expect(commonValidationSchemas.date.validate(date)).rejects.toThrow();
        }
      });
    });

    describe('time validation', () => {
      it('should validate correct time formats', async () => {
        const validTimes = [
          '09:30',
          '23:59',
          '00:00',
          '12:00'
        ];

        for (const time of validTimes) {
          await expect(commonValidationSchemas.time.validate(time)).resolves.toBe(time);
        }
      });

      it('should reject invalid time formats', async () => {
        const invalidTimes = [
          '25:00', // invalid hour
          '12:60', // invalid minute
          '9:30', // missing leading zero
          'invalid-time',
          ''
        ];

        for (const time of invalidTimes) {
          await expect(commonValidationSchemas.time.validate(time)).rejects.toThrow();
        }
      });
    });
  });

  describe('Medication Validation Schema', () => {
    it('should validate complete medication data', async () => {
      const validMedication = {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'twice_daily',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        reminders: ['08:00', '20:00'],
        notes: 'Take with meals'
      };

      await expect(medicationValidationSchema.validate(validMedication)).resolves.toEqual(validMedication);
    });

    it('should validate medication with minimal required fields', async () => {
      const minimalMedication = {
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'once_daily',
        startDate: new Date('2024-01-01'),
        reminders: []
      };

      await expect(medicationValidationSchema.validate(minimalMedication)).resolves.toEqual(
        expect.objectContaining(minimalMedication)
      );
    });

    it('should reject medication with missing required fields', async () => {
      const incompleteMedications = [
        { dosage: '500mg', frequency: 'twice_daily' }, // missing name
        { name: 'Metformin', frequency: 'twice_daily' }, // missing dosage
        { name: 'Metformin', dosage: '500mg' }, // missing frequency
        { name: 'Metformin', dosage: '500mg', frequency: 'twice_daily' } // missing startDate
      ];

      for (const medication of incompleteMedications) {
        await expect(medicationValidationSchema.validate(medication)).rejects.toThrow();
      }
    });

    it('should reject medication with end date before start date', async () => {
      const invalidMedication = {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'twice_daily',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-01-01'), // before start date
        reminders: []
      };

      await expect(medicationValidationSchema.validate(invalidMedication)).rejects.toThrow(/after start date/);
    });

    it('should reject medication with invalid reminder times', async () => {
      const invalidMedication = {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'twice_daily',
        startDate: new Date('2024-01-01'),
        reminders: ['25:00', 'invalid-time'] // invalid times
      };

      await expect(medicationValidationSchema.validate(invalidMedication)).rejects.toThrow();
    });

    it('should reject medication with notes too long', async () => {
      const invalidMedication = {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'twice_daily',
        startDate: new Date('2024-01-01'),
        reminders: [],
        notes: 'A'.repeat(501) // exceeds 500 character limit
      };

      await expect(medicationValidationSchema.validate(invalidMedication)).rejects.toThrow(/less than 500 characters/);
    });
  });

  describe('Symptom Validation Schema', () => {
    it('should validate complete symptom data', async () => {
      const validSymptom = {
        name: 'Headache',
        severity: 7,
        date: new Date('2024-01-15'),
        time: '14:30',
        notes: 'Mild headache after lunch',
        triggers: ['Stress', 'Lack of sleep'],
        duration: 120, // 2 hours
        location: 'Forehead'
      };

      await expect(symptomValidationSchema.validate(validSymptom)).resolves.toEqual(validSymptom);
    });

    it('should validate symptom with minimal required fields', async () => {
      const minimalSymptom = {
        name: 'Fatigue',
        severity: 5,
        date: new Date('2024-01-15'),
        time: '10:00'
      };

      await expect(symptomValidationSchema.validate(minimalSymptom)).resolves.toEqual(
        expect.objectContaining(minimalSymptom)
      );
    });

    it('should reject symptom with missing required fields', async () => {
      const incompleteSymptoms = [
        { severity: 5, date: new Date(), time: '10:00' }, // missing name
        { name: 'Headache', date: new Date(), time: '10:00' }, // missing severity
        { name: 'Headache', severity: 5, time: '10:00' }, // missing date
        { name: 'Headache', severity: 5, date: new Date() } // missing time
      ];

      for (const symptom of incompleteSymptoms) {
        await expect(symptomValidationSchema.validate(symptom)).rejects.toThrow();
      }
    });

    it('should reject symptom with invalid severity range', async () => {
      const invalidSymptoms = [
        {
          name: 'Headache',
          severity: 0, // below minimum
          date: new Date(),
          time: '10:00'
        },
        {
          name: 'Headache',
          severity: 11, // above maximum
          date: new Date(),
          time: '10:00'
        }
      ];

      for (const symptom of invalidSymptoms) {
        await expect(symptomValidationSchema.validate(symptom)).rejects.toThrow();
      }
    });

    it('should reject symptom with invalid duration', async () => {
      const invalidSymptoms = [
        {
          name: 'Headache',
          severity: 5,
          date: new Date(),
          time: '10:00',
          duration: -1 // negative duration
        },
        {
          name: 'Headache',
          severity: 5,
          date: new Date(),
          time: '10:00',
          duration: 1441 // exceeds 24 hours
        }
      ];

      for (const symptom of invalidSymptoms) {
        await expect(symptomValidationSchema.validate(symptom)).rejects.toThrow();
      }
    });
  });

  describe('Health Reading Validation Schema', () => {
    it('should validate blood pressure reading', async () => {
      const validReading = {
        type: 'blood_pressure',
        value: { systolic: 120, diastolic: 80 },
        unit: 'mmHg',
        timestamp: new Date().toISOString(),
        context: 'resting'
      };

      await expect(healthReadingValidationSchema.validate(validReading)).resolves.toEqual(validReading);
    });

    it('should validate single value readings', async () => {
      const validReadings = [
        {
          type: 'blood_sugar',
          value: 95,
          unit: 'mg/dL',
          timestamp: new Date().toISOString()
        },
        {
          type: 'weight',
          value: 70,
          unit: 'kg',
          timestamp: new Date().toISOString()
        },
        {
          type: 'heart_rate',
          value: 72,
          unit: 'bpm',
          timestamp: new Date().toISOString()
        },
        {
          type: 'temperature',
          value: 36.5,
          unit: '°C',
          timestamp: new Date().toISOString()
        }
      ];

      for (const reading of validReadings) {
        await expect(healthReadingValidationSchema.validate(reading)).resolves.toEqual(reading);
      }
    });

    it('should reject readings with invalid type', async () => {
      const invalidReading = {
        type: 'invalid_type',
        value: 100,
        unit: 'unit',
        timestamp: new Date().toISOString()
      };

      await expect(healthReadingValidationSchema.validate(invalidReading)).rejects.toThrow();
    });

    it('should reject blood pressure with invalid values', async () => {
      const invalidReadings = [
        {
          type: 'blood_pressure',
          value: { systolic: 50, diastolic: 80 }, // systolic too low
          unit: 'mmHg',
          timestamp: new Date().toISOString()
        },
        {
          type: 'blood_pressure',
          value: { systolic: 120, diastolic: 200 }, // diastolic too high
          unit: 'mmHg',
          timestamp: new Date().toISOString()
        }
      ];

      for (const reading of invalidReadings) {
        await expect(healthReadingValidationSchema.validate(reading)).rejects.toThrow();
      }
    });

    it('should reject single value readings with invalid ranges', async () => {
      const invalidReadings = [
        {
          type: 'blood_sugar',
          value: 30, // too low
          unit: 'mg/dL',
          timestamp: new Date().toISOString()
        },
        {
          type: 'weight',
          value: 700, // too high
          unit: 'kg',
          timestamp: new Date().toISOString()
        },
        {
          type: 'heart_rate',
          value: 300, // too high
          unit: 'bpm',
          timestamp: new Date().toISOString()
        },
        {
          type: 'temperature',
          value: 50, // too high
          unit: '°C',
          timestamp: new Date().toISOString()
        }
      ];

      for (const reading of invalidReadings) {
        await expect(healthReadingValidationSchema.validate(reading)).rejects.toThrow();
      }
    });

    it('should reject readings with missing required fields', async () => {
      const incompleteReadings = [
        { value: 100, unit: 'unit', timestamp: new Date().toISOString() }, // missing type
        { type: 'blood_sugar', unit: 'mg/dL', timestamp: new Date().toISOString() }, // missing value
        { type: 'blood_sugar', value: 100, timestamp: new Date().toISOString() }, // missing unit
        { type: 'blood_sugar', value: 100, unit: 'mg/dL' } // missing timestamp
      ];

      for (const reading of incompleteReadings) {
        await expect(healthReadingValidationSchema.validate(reading)).rejects.toThrow();
      }
    });
  });
});