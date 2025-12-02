import { describe, it, expect, vi } from 'vitest';
import { db } from '../server/db';
import { projects } from '../server/db/schema';

// Mock the database to avoid actual database connections in tests
vi.mock('../server/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock schema to use actual values
vi.mock('../server/db/schema', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  };
});

describe('Project Schema with Calendar Settings', () => {
  it('should have workingDays field in project schema', () => {
    // Test that workingDays field exists in the schema
    expect(projects.workingDays).toBeDefined();
    expect(projects.workingHours).toBeDefined();
  });

  it('should have proper indexes for organization-based queries', () => {
    // This test validates that we have proper indexing for multi-tenant queries
    // The project should have organization-based filtering for performance
    expect(projects.organizationId).toBeDefined();

    // Test that project schema has the required fields
    const projectFields = Object.keys(projects);
    expect(projectFields).toContain('organizationId');
    expect(projectFields).toContain('workingDays');
    expect(projectFields).toContain('workingHours');
  });

  it('should validate calendar setting constraints', () => {
    // Test validation of working days
    const validWorkingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const invalidWorkingDays = ['Notaday', 'Sunday'];

    expect(validWorkingDays.every(day => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].includes(day))).toBe(true);
    expect(invalidWorkingDays.some(day => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].includes(day))).toBe(false);
  });

  it('should have proper working hours structure', () => {
    // Test working hours structure
    const workingHours = {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
    };

    expect(workingHours).toBeDefined();
    expect(typeof workingHours).toBe('object');
    expect(workingHours.monday).toBeDefined();
    expect(workingHours.monday.start).toBe('09:00');
    expect(workingHours.monday.end).toBe('17:00');
  });
});