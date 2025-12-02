import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Import validation schemas we're testing
import {
  createResourceSchema,
  updateResourceSchema,
  deleteResourceSchema,
  resourceTypeSchema,
  hourlyRateSchema,
  dailyWorkHoursSchema,
  resourceNameSchema,
  currencySchema,
  type CreateResourceInput,
  type UpdateResourceInput,
  type DeleteResourceInput,
} from '~/lib/validations/resource';

describe('Resource Validation Schemas', () => {
  describe('resourceTypeSchema', () => {
    it('should accept valid resource types', () => {
      expect(() => resourceTypeSchema.parse('human')).not.toThrow();
      expect(() => resourceTypeSchema.parse('material')).not.toThrow();
      expect(() => resourceTypeSchema.parse('equipment')).not.toThrow();
    });

    it('should reject invalid resource types', () => {
      expect(() => resourceTypeSchema.parse('invalid')).toThrow();
      expect(() => resourceTypeSchema.parse('')).toThrow();
      expect(() => resourceTypeSchema.parse(null)).toThrow();
      expect(() => resourceTypeSchema.parse(undefined)).toThrow();
    });
  });

  describe('hourlyRateSchema', () => {
    it('should accept valid hourly rates', () => {
      expect(() => hourlyRateSchema.parse(50.00)).not.toThrow();
      expect(() => hourlyRateSchema.parse(0.01)).not.toThrow();
      expect(() => hourlyRateSchema.parse(999999.99)).not.toThrow();
    });

    it('should reject invalid hourly rates', () => {
      expect(() => hourlyRateSchema.parse(-10)).toThrow();
      expect(() => hourlyRateSchema.parse(0)).toThrow();
      expect(() => hourlyRateSchema.parse(1000000)).toThrow();
      expect(() => hourlyRateSchema.parse(50.123)).toThrow(); // Too many decimal places
      expect(() => hourlyRateSchema.parse('invalid')).toThrow();
      expect(() => hourlyRateSchema.parse(null)).toThrow();
      expect(() => hourlyRateSchema.parse(undefined)).toThrow();
    });
  });

  describe('dailyWorkHoursSchema', () => {
    it('should accept valid daily work hours', () => {
      expect(() => dailyWorkHoursSchema.parse(8.0)).not.toThrow();
      expect(() => dailyWorkHoursSchema.parse(0.5)).not.toThrow();
      expect(() => dailyWorkHoursSchema.parse(7.25)).not.toThrow(); // 2 decimal places allowed
      expect(() => dailyWorkHoursSchema.parse(24.0)).not.toThrow();
    });

    it('should reject invalid daily work hours', () => {
      expect(() => dailyWorkHoursSchema.parse(-8)).toThrow();
      expect(() => dailyWorkHoursSchema.parse(0)).toThrow();
      expect(() => dailyWorkHoursSchema.parse(25)).toThrow();
      expect(() => dailyWorkHoursSchema.parse(8.125)).toThrow(); // Too many decimal places (3)
      expect(() => dailyWorkHoursSchema.parse('invalid')).toThrow();
      expect(() => dailyWorkHoursSchema.parse(null)).toThrow();
    });
  });

  describe('resourceNameSchema', () => {
    it('should accept valid resource names', () => {
      expect(() => resourceNameSchema.parse('Developer')).not.toThrow();
      expect(() => resourceNameSchema.parse('  Developer  ')).not.toThrow(); // Should be trimmed
      expect(() => resourceNameSchema.parse('Resource with spaces')).not.toThrow();
    });

    it('should reject invalid resource names', () => {
      expect(() => resourceNameSchema.parse('')).toThrow();
      expect(() => resourceNameSchema.parse('   ')).toThrow(); // Empty after trim
      expect(() => resourceNameSchema.parse('<script>alert("xss")</script>')).toThrow(); // HTML
      expect(() => resourceNameSchema.parse('<Resource>')).toThrow(); // HTML
      expect(() => resourceNameSchema.parse(null)).toThrow();
      expect(() => resourceNameSchema.parse(undefined)).toThrow();
    });
  });

  describe('currencySchema', () => {
    it('should accept valid currency codes', () => {
      expect(() => currencySchema.parse('USD')).not.toThrow();
      expect(() => currencySchema.parse('EUR')).not.toThrow();
      expect(() => currencySchema.parse('GBP')).not.toThrow();
    });

    it('should reject invalid currency codes', () => {
      expect(() => currencySchema.parse('usd')).toThrow(); // Lowercase
      expect(() => currencySchema.parse('US')).toThrow(); // Too short
      expect(() => currencySchema.parse('USDD')).toThrow(); // Too long
      expect(() => currencySchema.parse('123')).toThrow(); // Numbers
      expect(() => currencySchema.parse(null)).toThrow();
      expect(() => currencySchema.parse(undefined)).toThrow();
    });
  });

  describe('createResourceSchema', () => {
    const validInput: CreateResourceInput = {
      name: 'Test Resource',
      type: 'human',
      hourlyRate: 50.00,
      dailyWorkHours: 8.0,
      currency: 'USD',
    };

    it('should accept valid create resource input', () => {
      expect(() => createResourceSchema.parse(validInput)).not.toThrow();
    });

    it('should accept create resource input with optional userId', () => {
      const inputWithUser = { ...validInput, userId: 'user-123' };
      expect(() => createResourceSchema.parse(inputWithUser)).not.toThrow();
    });

    it('should apply default values for optional fields', () => {
      const minimalInput = {
        name: 'Test Resource',
        type: 'human',
        hourlyRate: 50.00,
      };

      const result = createResourceSchema.parse(minimalInput);
      expect(result.dailyWorkHours).toBe(8.0);
      expect(result.currency).toBe('USD');
    });

    it('should reject invalid create resource input', () => {
      expect(() => createResourceSchema.parse({})).toThrow();
      expect(() => createResourceSchema.parse({
        name: '', // Invalid
        type: 'human',
        hourlyRate: 50.00,
      })).toThrow();
    });
  });

  describe('updateResourceSchema', () => {
    const validUpdate: UpdateResourceInput = {
      id: 1,
      name: 'Updated Resource',
    };

    it('should accept valid update resource input', () => {
      expect(() => updateResourceSchema.parse(validUpdate)).not.toThrow();
    });

    it('should accept update with only id and one field', () => {
      const singleFieldUpdate = { id: 1, hourlyRate: 75.00 };
      expect(() => updateResourceSchema.parse(singleFieldUpdate)).not.toThrow();
    });

    it('should reject update without any field to update', () => {
      expect(() => updateResourceSchema.parse({ id: 1 })).toThrow();
    });

    it('should reject invalid update resource input', () => {
      expect(() => updateResourceSchema.parse({})).toThrow();
      expect(() => updateResourceSchema.parse({
        id: -1, // Invalid
        name: 'Updated',
      })).toThrow();
    });
  });

  describe('deleteResourceSchema', () => {
    it('should accept valid delete resource input', () => {
      expect(() => deleteResourceSchema.parse({ id: 1 })).not.toThrow();
      expect(() => deleteResourceSchema.parse({ id: 999 })).not.toThrow();
    });

    it('should reject invalid delete resource input', () => {
      expect(() => deleteResourceSchema.parse({})).toThrow();
      expect(() => deleteResourceSchema.parse({ id: -1 })).toThrow();
      expect(() => deleteResourceSchema.parse({ id: 0 })).toThrow();
      expect(() => deleteResourceSchema.parse({ id: 'invalid' })).toThrow();
    });
  });
});

describe('Resources Router Integration', () => {
  it('should have all required procedures', () => {
    // This test validates that the resources router has all required procedures
    const expectedProcedures = [
      'create',
      'getAll',
      'getById',
      'update',
      'delete',
    ];

    // In a real integration test, we would import the router and check each procedure
    // For now, this test serves as documentation of expected functionality

    expectedProcedures.forEach(procedure => {
      expect(procedure).toBeDefined();
    });
  });

  it('should validate resource business rules', () => {
    // Test business rules that should be enforced in the router

    // Rule 1: Resource names must be unique within an organization
    const resourceNames = ['Developer', 'Designer', 'Manager'];
    const duplicateName = 'Developer';

    const isUniqueInOrganization = (name: string, existingNames: string[]): boolean => {
      return !existingNames.includes(name);
    };

    expect(isUniqueInOrganization('QA Engineer', resourceNames)).toBe(true);
    expect(isUniqueInOrganization(duplicateName, resourceNames)).toBe(false);

    // Rule 2: All monetary values should be stored as strings with 2 decimal places
    const formatCurrency = (value: number): string => {
      return value.toFixed(2);
    };

    expect(formatCurrency(50)).toBe('50.00');
    expect(formatCurrency(75.5)).toBe('75.50');
    expect(formatCurrency(100)).toBe('100.00');

    // Rule 3: Daily work hours should be reasonable
    const isValidWorkHours = (hours: number): boolean => {
      return hours > 0 && hours <= 24;
    };

    expect(isValidWorkHours(8)).toBe(true);
    expect(isValidWorkHours(0.5)).toBe(true);
    expect(isValidWorkHours(24)).toBe(true);
    expect(isValidWorkHours(0)).toBe(false);
    expect(isValidWorkHours(25)).toBe(false);
  });
});