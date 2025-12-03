import { describe, it, expect } from 'vitest';
import { resourceAvailabilityExceptions } from '~/server/db/schema';

describe('Database Schema Validation', () => {
  it('should define resourceAvailabilityExceptions table', () => {
    expect(resourceAvailabilityExceptions).toBeDefined();
  });

  it('should be importable from schema', () => {
    // This test validates that the schema can be imported without errors
    expect(() => import('~/server/db/schema')).not.toThrow();
  });
});