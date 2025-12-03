import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, inArray, gte, lte, desc, asc } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  resources,
  organizations,
  organizationMembers,
  resourceWorkSchedules,
  resourceAvailabilityExceptions,
} from "~/server/db/schema";

// Import validation schemas and types
import {
  resourceTimelineInputSchema,
  type ResourceTimelineInput,
} from "~/lib/validations/resourceTimeline";
import type {
  ResourceTimelineData,
  ResourceTimelineResource,
  ResourceTimelineDay,
  ResourceTimelineDateRange,
  ResourceTimelineMetadata,
  GetResourceTimelineResponse,
} from "~/lib/types/resourceTimeline";
import type { ResourceWorkScheduleResponse } from "~/lib/types/resourcePattern";
import type { ResourceAvailabilityException } from "~/lib/validations/resourceAvailabilityExceptions";

import { ResourceAvailabilityCalculator } from "~/lib/ResourceAvailabilityCalculator";
import { toZonedTime, format as formatTz } from 'date-fns-tz';

// Result type for consistent error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Validates that the user has access to the specified organization
 */
async function validateOrganizationAccess(
  ctx: any,
  organizationId: number,
  action: 'read' | 'write' = 'read'
): Promise<void> {
  // Get user's organization membership
  const membership = await ctx.db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, ctx.session.user.id),
      eq(organizationMembers.organizationId, organizationId)
    ),
  });

  if (!membership) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Access denied to organization ${organizationId}`,
    });
  }
}

/**
 * Get timezone for organization with validation
 */
async function getOrganizationTimezone(
  ctx: any,
  organizationId: number
): Promise<string> {
  const organization = await ctx.db.query.organizations.findFirst({
    where: eq(organizations.id, organizationId),
    columns: {
      timezone: true,
    },
  });

  const timezone = organization?.timezone || 'UTC';

  // Validate timezone is supported
  try {
    // Test if timezone is valid by attempting a conversion
    const testDate = new Date();
    toZonedTime(testDate, timezone);
    return timezone;
  } catch (error) {
    console.warn(`Invalid timezone ${timezone}, falling back to UTC`);
    return 'UTC';
  }
}

/**
 * Convert UTC date to organization timezone, handling daylight savings
 */
function convertUtcToOrgTimezone(utcDate: Date, timezone: string): Date {
  try {
    return toZonedTime(utcDate, timezone);
  } catch (error) {
    console.warn(`Failed to convert ${utcDate} to timezone ${timezone}, using UTC`);
    return utcDate;
  }
}

/**
 * Convert day index to Monday-based (0=Monday, 6=Sunday)
 */
function toMondayBased(dayOfWeek: number): number {
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

/**
 * Convert database work schedule to ResourceWorkScheduleResponse format
 */
function convertWorkSchedule(dbSchedule: any): ResourceWorkScheduleResponse {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    resourceId: dbSchedule.resourceId,
    dayOfWeek: dbSchedule.dayOfWeek,
    dayOfWeekName: dayNames[dbSchedule.dayOfWeek] || 'Unknown',
    isActive: dbSchedule.isActive,
    workStartTime: null, // Not used in current schema
    workEndTime: null,   // Not used in current schema
    totalWorkHours: dbSchedule.totalWorkHours ? parseFloat(dbSchedule.totalWorkHours) : null,
    hourlyRate: dbSchedule.hourlyRate ? parseFloat(dbSchedule.hourlyRate) : null,
    currency: dbSchedule.currency || 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Convert database exception to ResourceAvailabilityException format
 */
function convertException(dbException: any): ResourceAvailabilityException {
  return {
    id: dbException.id,
    resourceId: dbException.resourceId,
    exceptionDate: dbException.exceptionDate,
    startTimeUtc: dbException.startTimeUtc,
    endTimeUtc: dbException.endTimeUtc,
    hoursAvailable: dbException.hoursAvailable,
    hourlyRate: dbException.hourlyRate,
    currency: dbException.currency,
    isActive: dbException.isActive,
    exceptionType: dbException.exceptionType,
    notes: dbException.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Process availability data using ResourceAvailabilityCalculator
 */
function processTimelineData(
  resource: any,
  calculator: ResourceAvailabilityCalculator,
  startDate: string,
  endDate: string
): ResourceTimelineResource {
  const availabilityResults = calculator.calculateAvailabilityRange(startDate, endDate);

  const timelineData: ResourceTimelineDay[] = availabilityResults.map(result => ({
    date: result.date,
    hoursAvailable: result.hoursAvailable,
    hourlyRate: result.hourlyRate,
    currency: result.currency,
    isWorkingDay: result.isWorkingDay,
    source: result.source,
    dayOfWeek: result.dayOfWeek,
    cost: result.hoursAvailable * result.hourlyRate,
    notes: result.notes,
  }));

  return {
    id: resource.id,
    name: resource.name,
    type: resource.type,
    hourlyRate: parseFloat(resource.hourlyRate || '0'),
    currency: resource.currency || 'USD',
    isActive: resource.isActive,
    timelineData,
  };
}

/**
 * Apply filters to timeline data
 */
function applyFilters(
  resources: ResourceTimelineResource[],
  filters?: ResourceTimelineInput['filters']
): ResourceTimelineResource[] {
  if (!filters) return resources;

  return resources.filter(resource => {
    // Resource type filter
    if (filters.resourceType && resource.type !== filters.resourceType) {
      return false;
    }

    // Filter timeline data based on availability status
    let filteredTimelineData = resource.timelineData;

    if (filters.availabilityStatus) {
      filteredTimelineData = filteredTimelineData.filter(day => {
        switch (filters.availabilityStatus) {
          case 'working':
            return day.isWorkingDay;
          case 'non-working':
            return !day.isWorkingDay;
          case 'exception':
            return day.source === 'exception';
          default:
            return true;
        }
      });
    }

    // Hours range filter
    if (filters.minHours !== undefined) {
      filteredTimelineData = filteredTimelineData.filter(day =>
        day.hoursAvailable >= filters.minHours!
      );
    }

    if (filters.maxHours !== undefined) {
      filteredTimelineData = filteredTimelineData.filter(day =>
        day.hoursAvailable <= filters.maxHours!
      );
    }

    // If all timeline data is filtered out, exclude the resource
    return filteredTimelineData.length > 0;
  });
}

export const resourceTimelineRouter = createTRPCRouter({
  /**
   * Get timeline data for resources within a date range
   */
  getTimeline: protectedProcedure
    .input(resourceTimelineInputSchema)
    .query(async ({ ctx, input }): Promise<Result<GetResourceTimelineResponse>> => {
      try {
        // Validate organization access
        await validateOrganizationAccess(ctx, input.organizationId, 'read');

        // Get organization timezone
        const timezone = await getOrganizationTimezone(ctx, input.organizationId);

        // Calculate date range
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Build query for resources
        let resourceQuery = ctx.db.query.resources.findMany({
          where: and(
            eq(resources.organizationId, input.organizationId),
            eq(resources.isActive, true)
          ),
          orderBy: [asc(resources.name)],
          columns: {
            id: true,
            name: true,
            type: true,
            hourlyRate: true,
            currency: true,
            isActive: true,
          },
        });

        // Apply resource ID filter if provided
        if (input.resourceIds && input.resourceIds.length > 0) {
          resourceQuery = ctx.db.query.resources.findMany({
            where: and(
              eq(resources.organizationId, input.organizationId),
              eq(resources.isActive, true),
              inArray(resources.id, input.resourceIds)
            ),
            orderBy: [asc(resources.name)],
            columns: {
              id: true,
              name: true,
              type: true,
              hourlyRate: true,
              currency: true,
              isActive: true,
            },
          });
        }

        const resourceList = await resourceQuery;

        // Check if we found any resources
        if (resourceList.length === 0) {
          return {
            success: true,
            data: {
              data: {
                resources: [],
                dateRange: {
                  startDate: input.startDate,
                  endDate: input.endDate,
                  totalDays,
                },
                metadata: {
                  generatedAt: new Date().toISOString(),
                  timezone,
                  totalResources: 0,
                  organizationId: input.organizationId,
                },
              },
            },
          };
        }

        // Get all work schedules for these resources
        const workSchedules = await ctx.db.query.resourceWorkSchedules.findMany({
          where: inArray(resourceWorkSchedules.resourceId, resourceList.map(r => r.id)),
          columns: {
            resourceId: true,
            dayOfWeek: true,
            isActive: true,
            totalWorkHours: true,
            hourlyRate: true,
            currency: true,
          },
        });

        // Get all availability exceptions for these resources within the date range
        const exceptions = await ctx.db.query.resourceAvailabilityExceptions.findMany({
          where: and(
            inArray(resourceAvailabilityExceptions.resourceId, resourceList.map(r => r.id)),
            gte(resourceAvailabilityExceptions.exceptionDate, input.startDate),
            lte(resourceAvailabilityExceptions.exceptionDate, input.endDate),
            eq(resourceAvailabilityExceptions.isActive, true)
          ),
          columns: {
            id: true,
            resourceId: true,
            exceptionDate: true,
            hoursAvailable: true,
            hourlyRate: true,
            currency: true,
            isActive: true,
            exceptionType: true,
            notes: true,
          },
        });

        // Process each resource
        const timelineResources: ResourceTimelineResource[] = [];

        for (const resource of resourceList) {
          const resourceWorkSchedules = workSchedules
            .filter(ws => ws.resourceId === resource.id)
            .map(convertWorkSchedule);
          const resourceExceptions = exceptions
            .filter(exc => exc.resourceId === resource.id)
            .map(convertException);

          // Create calculator for this resource
          const calculator = new ResourceAvailabilityCalculator(
            resourceWorkSchedules,
            resourceExceptions
          );

          // Process timeline data
          const timelineResource = processTimelineData(
            resource,
            calculator,
            input.startDate,
            input.endDate
          );

          timelineResources.push(timelineResource);
        }

        // Apply filters if provided
        const filteredResources = applyFilters(timelineResources, input.filters);

        const dateRange: ResourceTimelineDateRange = {
          startDate: input.startDate,
          endDate: input.endDate,
          totalDays,
        };

        const metadata: ResourceTimelineMetadata = {
          generatedAt: new Date().toISOString(),
          timezone,
          totalResources: filteredResources.length,
          organizationId: input.organizationId,
        };

        const timelineData: ResourceTimelineData = {
          resources: filteredResources,
          dateRange,
          metadata,
        };

        return {
          success: true,
          data: {
            data: timelineData,
          },
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle validation errors
        if (error instanceof Error) {
          if (error.message.includes('Access denied')) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: error.message,
              cause: error,
            });
          }

          if (error.message.includes('Invalid date') || error.message.includes('date format')) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: error.message,
              cause: error,
            });
          }
        }

        // Generic error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve timeline data',
          cause: error,
        });
      }
    }),
});