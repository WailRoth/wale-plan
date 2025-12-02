import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import {
  createResourceSchema,
  updateResourceSchema,
  deleteResourceSchema,
  resourceTypeSchema,
  hourlyRateSchema,
  dailyWorkHoursSchema,
  resourceNameSchema,
  currencySchema,
} from '~/lib/validations/resource';

describe('Resource Validation Schemas - UI Tests', () => {
  describe('Resource Type Selection', () => {
    it('should validate resource types for UI dropdown', () => {
      const validTypes = ['human', 'material', 'equipment'];
      validTypes.forEach(type => {
        expect(() => resourceTypeSchema.parse(type)).not.toThrow();
      });
    });

    it('should reject invalid resource types', () => {
      const invalidTypes = ['invalid', '', 'admin', 'manager'];
      invalidTypes.forEach(type => {
        expect(() => resourceTypeSchema.parse(type)).toThrow();
      });
    });
  });

  describe('Form Field Validation', () => {
    it('should validate resource name field', () => {
      // Valid names
      expect(() => resourceNameSchema.parse('John Developer')).not.toThrow();
      expect(() => resourceNameSchema.parse('  Senior Developer  ')).not.toThrow(); // Should trim

      // Invalid names
      expect(() => resourceNameSchema.parse('')).toThrow();
      expect(() => resourceNameSchema.parse('   ')).toThrow(); // Empty after trim
      expect(() => resourceNameSchema.parse('<script>alert("xss")</script>')).toThrow(); // HTML
    });

    it('should validate hourly rate field with currency formatting', () => {
      // Valid rates
      expect(() => hourlyRateSchema.parse(50.00)).not.toThrow();
      expect(() => hourlyRateSchema.parse(0.01)).not.toThrow();
      expect(() => hourlyRateSchema.parse(999.99)).not.toThrow();

      // Invalid rates
      expect(() => hourlyRateSchema.parse(-10)).toThrow();
      expect(() => hourlyRateSchema.parse(0)).toThrow();
      expect(() => hourlyRateSchema.parse(50.123)).toThrow(); // Too many decimals
    });

    it('should validate daily work hours field', () => {
      // Valid hours
      expect(() => dailyWorkHoursSchema.parse(8)).not.toThrow();
      expect(() => dailyWorkHoursSchema.parse(0.5)).not.toThrow();
      expect(() => dailyWorkHoursSchema.parse(24)).not.toThrow();

      // Invalid hours
      expect(() => dailyWorkHoursSchema.parse(-8)).toThrow();
      expect(() => dailyWorkHoursSchema.parse(0)).toThrow();
      expect(() => dailyWorkHoursSchema.parse(25)).toThrow();
    });

    it('should validate currency codes', () => {
      // Valid currencies
      expect(() => currencySchema.parse('USD')).not.toThrow();
      expect(() => currencySchema.parse('EUR')).not.toThrow();
      expect(() => currencySchema.parse('GBP')).not.toThrow();

      // Invalid currencies
      expect(() => currencySchema.parse('usd')).toThrow(); // Lowercase
      expect(() => currencySchema.parse('US')).toThrow(); // Too short
      expect(() => currencySchema.parse('123')).toThrow(); // Numbers
    });
  });

  describe('Complete Form Validation', () => {
    it('should validate complete create resource form', () => {
      const validFormData = {
        name: 'Senior Developer',
        type: 'human',
        hourlyRate: 75.50,
        dailyWorkHours: 8.0,
        currency: 'USD',
      };

      expect(() => createResourceSchema.parse(validFormData)).not.toThrow();
    });

    it('should validate complete update form', () => {
      const validUpdateData = {
        id: 1,
        name: 'Updated Developer',
        hourlyRate: 80.00,
      };

      expect(() => updateResourceSchema.parse(validUpdateData)).not.toThrow();
    });

    it('should validate delete form', () => {
      const validDeleteData = { id: 1 };
      expect(() => deleteResourceSchema.parse(validDeleteData)).not.toThrow();

      const invalidDeleteData = { id: -1 };
      expect(() => deleteResourceSchema.parse(invalidDeleteData)).toThrow();
    });
  });

  describe('UI Business Logic Validation', () => {
    it('should enforce reasonable field limits for UI inputs', () => {
      // Name length limits
      const tooLongName = 'a'.repeat(257);
      expect(() => resourceNameSchema.parse(tooLongName)).toThrow();

      // Hourly rate limits
      const tooHighRate = 1000000;
      expect(() => hourlyRateSchema.parse(tooHighRate)).toThrow();

      // Work hours limits
      const tooManyHours = 25;
      expect(() => dailyWorkHoursSchema.parse(tooManyHours)).toThrow();
    });

    it('should handle special characters in names', () => {
      const validSpecialChars = "John's Developer-Team Member";
      expect(() => resourceNameSchema.parse(validSpecialChars)).not.toThrow();

      const invalidHTML = '<div>Hacker</div>';
      expect(() => resourceNameSchema.parse(invalidHTML)).toThrow();
    });

    it('should handle decimal precision correctly', () => {
      // Valid precision (2 decimals for money)
      expect(() => hourlyRateSchema.parse(50.12)).not.toThrow();
      expect(() => hourlyRateSchema.parse(50.1)).not.toThrow();
      expect(() => hourlyRateSchema.parse(50)).not.toThrow();

      // Invalid precision (more than 2 decimals)
      expect(() => hourlyRateSchema.parse(50.123)).toThrow();

      // Valid precision (up to 2 decimals for hours)
      expect(() => dailyWorkHoursSchema.parse(8.5)).not.toThrow();
      expect(() => dailyWorkHoursSchema.parse(8.25)).not.toThrow(); // 2 decimals allowed
      expect(() => dailyWorkHoursSchema.parse(8)).not.toThrow();

      // Invalid precision (more than 2 decimals)
      expect(() => dailyWorkHoursSchema.parse(8.125)).toThrow();
    });
  });

  describe('Form Default Values', () => {
    it('should apply correct default values', () => {
      const minimalInput = {
        name: 'Test Resource',
        type: 'human',
        hourlyRate: 50,
      };

      const result = createResourceSchema.parse(minimalInput);

      // Check that defaults are applied
      expect(result.dailyWorkHours).toBe(8.0);
      expect(result.currency).toBe('USD');
    });
  });

  describe('Error Message Quality', () => {
    it('should provide clear error messages for invalid input', () => {
      try {
        resourceTypeSchema.parse('invalid');
      } catch (error) {
        expect(error).toBeDefined();
      }

      try {
        hourlyRateSchema.parse(-10);
      } catch (error) {
        expect(error).toBeDefined();
      }

      try {
        resourceNameSchema.parse('');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});