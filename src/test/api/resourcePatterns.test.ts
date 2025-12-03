import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { resourcePatternsRouter } from "~/server/api/routers/resourcePatterns";
import { createContextInner } from "~/server/api/trpc";
import { resourceWorkSchedules, resources, organizations, organizationMembers } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { DailyAvailabilityPattern } from "~/lib/validations/resourcePattern";

// Mock data setup
interface MockContext {
  session: {
    user: {
      id: string;
    };
  };
  db: typeof db;
}

describe("resourcePatternsRouter", () => {
  let mockContext: MockContext;
  let testOrganization: typeof organizations.$inferSelect;
  let testUser: typeof organizationMembers.$inferSelect;
  let testResource: typeof resources.$inferSelect;

  beforeEach(async () => {
    // Setup test organization
    const [org] = await db.insert(organizations).values({
      name: "Test Organization",
      slug: "test-org-" + Math.random().toString(36).substring(7),
      timezone: "UTC",
    }).returning();
    testOrganization = org!;

    // Setup test user (mock user ID)
    const mockUserId = "test-user-" + Math.random().toString(36).substring(7);

    // Setup test user membership
    const [member] = await db.insert(organizationMembers).values({
      organizationId: testOrganization.id,
      userId: mockUserId,
      role: "admin",
    }).returning();
    testUser = member!;

    // Setup test resource
    const [resource] = await db.insert(resources).values({
      organizationId: testOrganization.id,
      name: "Test Resource",
      type: "human",
      hourlyRate: "50.00",
      dailyWorkHours: "8.00",
      currency: "USD",
      isActive: true,
    }).returning();
    testResource = resource!;

    // Create mock context
    mockContext = {
      session: {
        user: {
          id: mockUserId,
        },
      },
      db,
    };
  });

  afterEach(async () => {
    // Clean up test data in reverse order
    await db.delete(resourceWorkSchedules).where(eq(resourceWorkSchedules.resourceId, testResource.id));
    await db.delete(resources).where(eq(resources.id, testResource.id));
    await db.delete(organizationMembers).where(eq(organizationMembers.id, testUser.id));
    await db.delete(organizations).where(eq(organizations.id, testOrganization.id));
  });

  describe("getByResourceId", () => {
    it("should return default patterns when no schedules exist", async () => {
      const caller = resourcePatternsRouter.createCaller(mockContext);

      const result = await caller.getByResourceId({ resourceId: testResource.id });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.resourceId).toBe(testResource.id);
        expect(result.data.patterns).toHaveLength(7);
        expect(result.data.patterns.filter(p => p.isActive === true)).toHaveLength(5); // Mon-Fri
        expect(result.data.patterns.filter(p => p.isActive === false)).toHaveLength(2); // Sat-Sun
      }
    });

    it("should return existing patterns when schedules exist", async () => {
      // Create test schedules
      const schedules = [
        { dayOfWeek: 1, isActive: true, workStartTime: "08:00", workEndTime: "16:00", hourlyRate: "45.00" },
        { dayOfWeek: 2, isActive: true, workStartTime: "08:00", workEndTime: "16:00", hourlyRate: "45.00" },
      ];

      for (const schedule of schedules) {
        await db.insert(resourceWorkSchedules).values({
          resourceId: testResource.id,
          dayOfWeek: schedule.dayOfWeek,
          isActive: schedule.isActive,
          workStartTime: schedule.workStartTime,
          workEndTime: schedule.workEndTime,
          totalWorkHours: "8.00",
          hourlyRate: schedule.hourlyRate,
          currency: "USD",
          isWorkingDay: schedule.isActive,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      const caller = resourcePatternsRouter.createCaller(mockContext);
      const result = await caller.getByResourceId({ resourceId: testResource.id });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.patterns).toHaveLength(7);
        const mondayPattern = result.data.patterns.find(p => p.dayOfWeekName === "monday");
        expect(mondayPattern).toBeDefined();
        expect(mondayPattern!.workStartTime).toBe("08:00");
        expect(mondayPattern!.workEndTime).toBe("16:00");
      }
    });

    it("should throw NOT_FOUND error for non-existent resource", async () => {
      const caller = resourcePatternsRouter.createCaller(mockContext);

      await expect(caller.getByResourceId({ resourceId: 99999 }))
        .rejects.toThrow(TRPCError);
    });

    it("should throw FORBIDDEN error for unauthorized user", async () => {
      // Create context for unauthorized user
      const unauthorizedContext = {
        session: {
          user: {
            id: "unauthorized-user",
          },
        },
        db,
      };

      const caller = resourcePatternsRouter.createCaller(unauthorizedContext);

      await expect(caller.getByResourceId({ resourceId: testResource.id }))
        .rejects.toThrow(TRPCError);
    });
  });

  describe("updateDailyPattern", () => {
    const validPatterns: DailyAvailabilityPattern[] = [
      { dayOfWeek: "monday", isActive: true, startTime: "09:00", endTime: "17:00", hourlyRate: 50 },
      { dayOfWeek: "tuesday", isActive: true, startTime: "09:00", endTime: "17:00", hourlyRate: 50 },
      { dayOfWeek: "wednesday", isActive: true, startTime: "09:00", endTime: "17:00", hourlyRate: 50 },
      { dayOfWeek: "thursday", isActive: true, startTime: "09:00", endTime: "17:00", hourlyRate: 50 },
      { dayOfWeek: "friday", isActive: true, startTime: "09:00", endTime: "17:00", hourlyRate: 50 },
      { dayOfWeek: "saturday", isActive: false, startTime: "00:00", endTime: "00:00", hourlyRate: undefined },
      { dayOfWeek: "sunday", isActive: false, startTime: "00:00", endTime: "00:00", hourlyRate: undefined },
    ];

    it("should successfully update patterns", async () => {
      const caller = resourcePatternsRouter.createCaller(mockContext);

      const result = await caller.updateDailyPattern({
        resourceId: testResource.id,
        patterns: validPatterns,
        currency: "USD",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.resourceId).toBe(testResource.id);
        expect(result.data.updated).toBe(true);
        expect(result.data.patterns).toHaveLength(7);

        // Verify database state
        const savedPatterns = await db.query.resourceWorkSchedules.findMany({
          where: eq(resourceWorkSchedules.resourceId, testResource.id),
        });
        expect(savedPatterns).toHaveLength(7);
      }
    });

    it("should throw validation error when no active days", async () => {
      const caller = resourcePatternsRouter.createCaller(mockContext);
      const allInactivePatterns = validPatterns.map(p => ({ ...p, isActive: false }));

      await expect(caller.updateDailyPattern({
        resourceId: testResource.id,
        patterns: allInactivePatterns,
        currency: "USD",
      })).rejects.toThrow(TRPCError);
    });

    it("should throw validation error for invalid time range", async () => {
      const caller = resourcePatternsRouter.createCaller(mockContext);
      const invalidPatterns = [
        ...validPatterns.slice(0, 6),
        { dayOfWeek: "sunday" as const, isActive: true, startTime: "17:00", endTime: "09:00", hourlyRate: 50 },
      ];

      await expect(caller.updateDailyPattern({
        resourceId: testResource.id,
        patterns: invalidPatterns,
        currency: "USD",
      })).rejects.toThrow(TRPCError);
    });

    it("should throw validation error for negative hourly rate", async () => {
      const caller = resourcePatternsRouter.createCaller(mockContext);
      const invalidPatterns = [
        ...validPatterns.slice(0, 6),
        { dayOfWeek: "sunday" as const, isActive: true, startTime: "09:00", endTime: "17:00", hourlyRate: -10 },
      ];

      await expect(caller.updateDailyPattern({
        resourceId: testResource.id,
        patterns: invalidPatterns,
        currency: "USD",
      })).rejects.toThrow(TRPCError);
    });
  });

  describe("resetToDefaults", () => {
    it("should successfully reset to default patterns", async () => {
      const caller = resourcePatternsRouter.createCaller(mockContext);

      // First, create some custom patterns
      const customPatterns: DailyAvailabilityPattern[] = [
        { dayOfWeek: "monday", isActive: true, startTime: "08:00", endTime: "16:00", hourlyRate: 75 },
        { dayOfWeek: "tuesday", isActive: true, startTime: "08:00", endTime: "16:00", hourlyRate: 75 },
        { dayOfWeek: "wednesday", isActive: true, startTime: "08:00", endTime: "16:00", hourlyRate: 75 },
        { dayOfWeek: "thursday", isActive: true, startTime: "08:00", endTime: "16:00", hourlyRate: 75 },
        { dayOfWeek: "friday", isActive: true, startTime: "08:00", endTime: "16:00", hourlyRate: 75 },
        { dayOfWeek: "saturday", isActive: true, startTime: "08:00", endTime: "12:00", hourlyRate: 75 },
        { dayOfWeek: "sunday", isActive: true, startTime: "08:00", endTime: "12:00", hourlyRate: 75 },
      ];

      await caller.updateDailyPattern({
        resourceId: testResource.id,
        patterns: customPatterns,
        currency: "USD",
      });

      // Then reset to defaults
      const result = await caller.resetToDefaults({ resourceId: testResource.id });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.resourceId).toBe(testResource.id);
        expect(result.data.reset).toBe(true);
        expect(result.data.patterns).toHaveLength(7);

        // Check that weekdays are active and weekends are inactive
        const activeDays = result.data.patterns.filter(p => p.isActive === true);
        expect(activeDays).toHaveLength(5);

        const mondayPattern = result.data.patterns.find(p => p.dayOfWeekName === "monday");
        expect(mondayPattern!.workStartTime).toBe("09:00");
        expect(mondayPattern!.workEndTime).toBe("17:00");
      }
    });

    it("should throw NOT_FOUND error for non-existent resource", async () => {
      const caller = resourcePatternsRouter.createCaller(mockContext);

      await expect(caller.resetToDefaults({ resourceId: 99999 }))
        .rejects.toThrow(TRPCError);
    });
  });
});