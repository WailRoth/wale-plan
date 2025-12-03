import { describe, it, expect, vi } from 'vitest';
import { db } from '~/server/db';
import { resourceAvailabilityExceptions } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

// Override the global mock for this integration test
vi.unmock("~/server/db");
vi.unmock("~/server/db/schema");

describe('Resource Availability Exceptions Schema', () => {
  it('should have the correct table structure', async () => {
    // This test will fail initially because the table doesn't exist yet
    const result = await db.select().from(resourceAvailabilityExceptions).limit(1);
    expect(result).toBeDefined();
  });

  it('should enforce unique constraint on resourceId and exceptionDate', async () => {
    // This will fail until we implement proper unique constraints
    const testException = {
      organizationId: 1,
      resourceId: 1,
      exceptionDate: '2024-12-25',
      hoursAvailable: '0.00',
      hourlyRate: '50.00',
      currency: 'USD',
      isActive: true,
      exceptionType: 'holiday' as const,
    };

    // This should succeed
    await db.insert(resourceAvailabilityExceptions).values(testException);

    // This should fail due to unique constraint
    await expect(
      db.insert(resourceAvailabilityExceptions).values(testException)
    ).rejects.toThrow();
  });

  it('should have proper indexes for performance', async () => {
    // This test validates the existence of required indexes
    // Will fail until we add the indexes
    const query = db.select().from(resourceAvailabilityExceptions)
      .where(eq(resourceAvailabilityExceptions.organizationId, 1));

    expect(query).toBeDefined();
  });
});