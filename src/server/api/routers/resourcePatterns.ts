import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, desc, asc } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  resourceWorkSchedules,
  resources,
  organizationMembers,
} from "~/server/db/schema";

// Import validation schemas and types
import {
  updateDailyPatternSchema,
  getByResourceIdSchema,
  resetToDefaultsSchema,
  validateTimeRange,
  validateWorkingHours,
  validateAtLeastOneActiveDay,
  getDefaultAvailabilityPatterns,
  type UpdateDailyPatternInput,
  type GetByResourceIdInput,
  type ResetToDefaultsInput,
} from "~/lib/validations/resourcePattern";
import type {
  ResourceWorkScheduleResponse,
  GetByResourceIdResponse,
  UpdateDailyPatternResponse,
  ResetToDefaultsResponse,
  ResourcePatternValidationError,
  ResourcePatternNotFoundError,
  ResourcePatternAccessError,
} from "~/lib/types/resourcePattern";

// Result type for consistent error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Helper functions for error handling
function createResourcePatternValidationError(field: string, message: string, value?: unknown): ResourcePatternValidationError {
  const error = new Error(message) as ResourcePatternValidationError;
  error.code = 'VALIDATION_ERROR';
  error.field = field;
  error.value = value;
  return error;
}

function createResourcePatternNotFoundError(resourceId: number): ResourcePatternNotFoundError {
  const error = new Error(`Resource with ID ${resourceId} not found`) as ResourcePatternNotFoundError;
  error.code = 'RESOURCE_NOT_FOUND';
  error.resourceId = resourceId;
  return error;
}

function createResourcePatternAccessError(organizationId: number, resourceId?: number): ResourcePatternAccessError {
  const message = resourceId
    ? `Access denied to resource ${resourceId} patterns in organization ${organizationId}`
    : `Access denied to resource patterns in organization ${organizationId}`;

  const error = new Error(message) as ResourcePatternAccessError;
  error.code = 'ACCESS_DENIED';
  error.organizationId = organizationId;
  error.resourceId = resourceId;
  return error;
}

// Day of week mapping
const DAY_OF_WEEK_NAMES = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
];

const DAY_OF_WEEK_TO_NUMBER: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const NUMBER_TO_DAY_NAME: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

// Validation functions
async function validateResourceAccess(
  ctx: any,
  resourceId: number,
  action: 'read' | 'write' = 'read'
): Promise<typeof resources.$inferSelect> {
  const resource = await ctx.db.query.resources.findFirst({
    where: eq(resources.id, resourceId),
  });

  if (!resource) {
    throw createResourcePatternNotFoundError(resourceId);
  }

  // Validate organization access
  const membership = await ctx.db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, ctx.session.user.id),
      eq(organizationMembers.organizationId, resource.organizationId)
    ),
  });

  if (!membership) {
    throw createResourcePatternAccessError(resource.organizationId, resourceId);
  }

  return resource;
}

function mapWorkScheduleToResponse(schedule: typeof resourceWorkSchedules.$inferSelect): ResourceWorkScheduleResponse {
  return {
    resourceId: schedule.resourceId,
    dayOfWeek: schedule.dayOfWeek,
    dayOfWeekName: NUMBER_TO_DAY_NAME[schedule.dayOfWeek]!,
    isActive: schedule.isActive,
    workStartTime: (schedule.workStartTime?.substring(0, 5) || null) as string | null, // Format HH:MM
    workEndTime: (schedule.workEndTime?.substring(0, 5) || null) as string | null, // Format HH:MM
    totalWorkHours: schedule.totalWorkHours ? parseFloat(schedule.totalWorkHours) : null,
    hourlyRate: schedule.hourlyRate ? parseFloat(schedule.hourlyRate) : null,
    currency: schedule.currency || "USD",
    createdAt: schedule.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: schedule.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export const resourcePatternsRouter = createTRPCRouter({
  /**
   * Get availability patterns for a specific resource
   */
  getByResourceId: protectedProcedure
    .input(getByResourceIdSchema)
    .query(async ({ ctx, input }): Promise<Result<GetByResourceIdResponse>> => {
      try {
        // Validate resource access
        const resource = await validateResourceAccess(ctx, input.resourceId, 'read');

        // Get existing work schedules for the resource
        const schedules = await ctx.db.query.resourceWorkSchedules.findMany({
          where: eq(resourceWorkSchedules.resourceId, input.resourceId),
          orderBy: asc(resourceWorkSchedules.dayOfWeek),
        });

        // If no schedules exist, return default patterns
        if (schedules.length === 0) {
          const defaultPatterns = getDefaultAvailabilityPatterns();
          const defaultSchedules: ResourceWorkScheduleResponse[] = defaultPatterns.map((pattern, index) => ({
            resourceId: input.resourceId,
            dayOfWeek: DAY_OF_WEEK_TO_NUMBER[pattern.dayOfWeek]!,
            dayOfWeekName: pattern.dayOfWeek,
            isActive: pattern.isActive,
            workStartTime: pattern.isActive ? pattern.startTime.substring(0, 5) : null, // Format HH:MM
            workEndTime: pattern.isActive ? pattern.endTime.substring(0, 5) : null, // Format HH:MM
            totalWorkHours: pattern.isActive ? validateWorkingHours(pattern.startTime, pattern.endTime) : null,
            hourlyRate: null,
            currency: "USD",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

          // The schedules are already in the correct format
          const responseSchedules = defaultSchedules;

          return {
            success: true,
            data: {
              resourceId: input.resourceId,
              patterns: responseSchedules,
              currency: "USD",
            },
          };
        }

        // Convert existing schedules to response format
        const responseSchedules = schedules.map(mapWorkScheduleToResponse);

        return {
          success: true,
          data: {
            resourceId: input.resourceId,
            patterns: responseSchedules,
            currency: responseSchedules[0]?.currency || "USD",
          },
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error && (
          (error as any).code === 'RESOURCE_NOT_FOUND' ||
          (error as any).code === 'ACCESS_DENIED'
        )) {
          const errorCode = (error as any).code;
          throw new TRPCError({
            code: errorCode === 'RESOURCE_NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
            message: error.message,
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve resource patterns',
          cause: error,
        });
      }
    }),

  /**
   * Update daily availability patterns for a resource
   */
  updateDailyPattern: protectedProcedure
    .input(updateDailyPatternSchema)
    .mutation(async ({ ctx, input }): Promise<Result<UpdateDailyPatternResponse>> => {
      try {
        // Validate resource access
        const resource = await validateResourceAccess(ctx, input.resourceId, 'write');

        // Validate at least one active day
        if (!validateAtLeastOneActiveDay(input)) {
          throw createResourcePatternValidationError('patterns', 'At least one day must be active');
        }

        // Validate each pattern
        for (const pattern of input.patterns) {
          if (pattern.isActive) {
            // Validate time range
            if (!validateTimeRange(pattern.startTime, pattern.endTime)) {
              throw createResourcePatternValidationError(
                'endTime',
                `End time must be after start time for ${pattern.dayOfWeek}`,
                { startTime: pattern.startTime, endTime: pattern.endTime }
              );
            }

            // Validate working hours are reasonable (0-24 hours)
            const hours = validateWorkingHours(pattern.startTime, pattern.endTime);
            if (hours <= 0 || hours > 24) {
              throw createResourcePatternValidationError(
                'workingHours',
                `Working hours must be between 0 and 24 for ${pattern.dayOfWeek}`,
                { hours }
              );
            }
          }

          if (pattern.isActive && pattern.hourlyRate && pattern.hourlyRate <= 0) {
            throw createResourcePatternValidationError(
              'hourlyRate',
              `Hourly rate must be positive for active day ${pattern.dayOfWeek}`,
              { hourlyRate: pattern.hourlyRate }
            );
          }
        }

        // Begin transaction to update all patterns atomically
        await ctx.db.transaction(async (tx) => {
          // Delete existing schedules for this resource
          await tx.delete(resourceWorkSchedules)
            .where(eq(resourceWorkSchedules.resourceId, input.resourceId));

          // Insert new schedules
          for (const pattern of input.patterns) {
            const dayOfWeek = DAY_OF_WEEK_TO_NUMBER[pattern.dayOfWeek];
            if (!dayOfWeek) continue; // Skip invalid dayOfWeek

            const workHours = pattern.isActive ? validateWorkingHours(pattern.startTime, pattern.endTime) : 0;

            await tx.insert(resourceWorkSchedules).values({
              resourceId: input.resourceId,
              dayOfWeek,
              isActive: pattern.isActive,
              workStartTime: pattern.isActive ? pattern.startTime.substring(0, 5) : null, // Format HH:MM
              workEndTime: pattern.isActive ? pattern.endTime.substring(0, 5) : null, // Format HH:MM
              totalWorkHours: workHours.toString(),
              hourlyRate: pattern.isActive && pattern.hourlyRate ? pattern.hourlyRate.toString() : null,
              currency: input.currency || "USD",
            });
          }
        });

        // Fetch updated schedules
        const updatedSchedules = await ctx.db.query.resourceWorkSchedules.findMany({
          where: eq(resourceWorkSchedules.resourceId, input.resourceId),
          orderBy: asc(resourceWorkSchedules.dayOfWeek),
        });

        const responseSchedules = updatedSchedules.map(mapWorkScheduleToResponse);

        return {
          success: true,
          data: {
            resourceId: input.resourceId,
            updated: true,
            patterns: responseSchedules,
          },
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error && (
          (error as any).code === 'RESOURCE_NOT_FOUND' ||
          (error as any).code === 'ACCESS_DENIED' ||
          (error as any).code === 'VALIDATION_ERROR'
        )) {
          const errorCode = (error as any).code;
          throw new TRPCError({
            code: errorCode === 'VALIDATION_ERROR' ? 'BAD_REQUEST' :
                  errorCode === 'RESOURCE_NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
            message: error.message,
            cause: error,
          });
        }

        // Handle database errors
        if (error instanceof Error && error.message.includes('duplicate key')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Duplicate schedule entries detected',
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update resource patterns',
          cause: error,
        });
      }
    }),

  /**
   * Reset resource patterns to default values
   */
  resetToDefaults: protectedProcedure
    .input(resetToDefaultsSchema)
    .mutation(async ({ ctx, input }): Promise<Result<ResetToDefaultsResponse>> => {
      try {
        // Validate resource access
        const resource = await validateResourceAccess(ctx, input.resourceId, 'write');

        // Get default patterns
        const defaultPatterns = getDefaultAvailabilityPatterns();

        // Begin transaction to reset patterns
        await ctx.db.transaction(async (tx) => {
          // Delete existing schedules
          await tx.delete(resourceWorkSchedules)
            .where(eq(resourceWorkSchedules.resourceId, input.resourceId));

          // Insert default schedules
          for (const pattern of defaultPatterns) {
            const dayOfWeek = DAY_OF_WEEK_TO_NUMBER[pattern.dayOfWeek];
            if (!dayOfWeek) continue; // Skip invalid dayOfWeek

            const workHours = pattern.isActive ? validateWorkingHours(pattern.startTime, pattern.endTime) : 0;

            await tx.insert(resourceWorkSchedules).values({
              resourceId: input.resourceId,
              dayOfWeek,
              isActive: pattern.isActive,
              workStartTime: pattern.isActive ? pattern.startTime.substring(0, 5) : null, // Format HH:MM
              workEndTime: pattern.isActive ? pattern.endTime.substring(0, 5) : null, // Format HH:MM
              totalWorkHours: workHours.toString(),
              hourlyRate: null, // Use resource's default hourly rate
              currency: "USD",
            });
          }
        });

        // Fetch updated schedules
        const updatedSchedules = await ctx.db.query.resourceWorkSchedules.findMany({
          where: eq(resourceWorkSchedules.resourceId, input.resourceId),
          orderBy: asc(resourceWorkSchedules.dayOfWeek),
        });

        const responseSchedules = updatedSchedules.map(mapWorkScheduleToResponse);

        return {
          success: true,
          data: {
            resourceId: input.resourceId,
            reset: true,
            patterns: responseSchedules,
          },
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error && (
          (error as any).code === 'RESOURCE_NOT_FOUND' ||
          (error as any).code === 'ACCESS_DENIED'
        )) {
          const errorCode = (error as any).code;
          throw new TRPCError({
            code: errorCode === 'RESOURCE_NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
            message: error.message,
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reset resource patterns',
          cause: error,
        });
      }
    }),
});