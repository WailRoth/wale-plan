import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, desc, asc, inArray } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  resourceAvailabilityExceptions,
  resources,
  organizations,
  organizationMembers,
} from "~/server/db/schema";

// Import validation schemas and types
import {
  createExceptionSchema,
  updateExceptionSchema,
  deleteExceptionSchema,
  getExceptionsByResourceIdSchema,
  type CreateExceptionInput,
  type UpdateExceptionInput,
  type DeleteExceptionInput,
  type GetExceptionsByResourceIdInput,
} from "~/lib/validations/resourceAvailabilityExceptions";
import {
  isExceptionValidationError,
  isExceptionNotFoundError,
  isExceptionConflictError,
} from "~/lib/validations/resourceAvailabilityExceptions";
import type {
  ExceptionValidationError,
  ExceptionNotFoundError,
  ExceptionConflictError,
} from "~/lib/validations/resourceAvailabilityExceptions";

// Result type for consistent error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Response types
export interface ResourceAvailabilityException {
  id: string;
  resourceId: number;
  exceptionDate: string;
  startTimeUtc?: string;
  endTimeUtc?: string;
  hoursAvailable: string;
  hourlyRate: string;
  currency: string;
  isActive: boolean;
  exceptionType: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateExceptionResponse extends ResourceAvailabilityException {}
export interface UpdateExceptionResponse extends ResourceAvailabilityException {}
export interface DeleteExceptionResponse {
  id: string;
  deleted: boolean;
}
export interface GetExceptionsByResourceIdResponse {
  exceptions: ResourceAvailabilityException[];
}

/**
 * Creates a standardized exception validation error
 */
function createExceptionValidationError(field: string, message: string, value?: unknown): ExceptionValidationError {
  const error = new Error(message) as ExceptionValidationError;
  error.code = 'VALIDATION_ERROR';
  error.field = field;
  error.value = value;
  return error;
}

/**
 * Creates a standardized exception not found error
 */
function createExceptionNotFoundError(exceptionId: string): ExceptionNotFoundError {
  const error = new Error(`Exception with ID ${exceptionId} not found`) as ExceptionNotFoundError;
  error.code = 'EXCEPTION_NOT_FOUND';
  error.exceptionId = exceptionId;
  return error;
}

/**
 * Creates a standardized exception conflict error
 */
function createExceptionConflictError(resourceId: number, exceptionDate: string): ExceptionConflictError {
  const error = new Error(`Exception already exists for resource ${resourceId} on date ${exceptionDate}`) as ExceptionConflictError;
  error.code = 'EXCEPTION_CONFLICT';
  error.resourceId = resourceId;
  error.exceptionDate = exceptionDate;
  return error;
}

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

  // All organization members can read, but we could add role-based checks for write operations
  // For now, any member can perform write operations
}

/**
 * Validates that a resource exists and belongs to the user's organization
 */
async function validateResourceAccess(
  ctx: any,
  resourceId: number,
  action: 'read' | 'write' = 'read'
): Promise<typeof resources.$inferSelect> {
  const resource = await ctx.db.query.resources.findFirst({
    where: eq(resources.id, resourceId),
  });

  if (!resource) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Resource with ID ${resourceId} not found`,
    });
  }

  await validateOrganizationAccess(ctx, resource.organizationId, action);

  return resource;
}

/**
 * Validates that an exception exists and the user has access to it
 */
async function validateExceptionAccess(
  ctx: any,
  exceptionId: string,
  action: 'read' | 'write' = 'read'
): Promise<typeof resourceAvailabilityExceptions.$inferSelect> {
  const exception = await ctx.db.query.resourceAvailabilityExceptions.findFirst({
    where: eq(resourceAvailabilityExceptions.id, exceptionId),
    with: {
      resource: true,
    },
  });

  if (!exception) {
    throw createExceptionNotFoundError(exceptionId);
  }

  await validateResourceAccess(ctx, exception.resourceId, action);

  return exception;
}

export const resourceAvailabilityExceptionsRouter = createTRPCRouter({
  /**
   * Create a new availability exception
   */
  create: protectedProcedure
    .input(createExceptionSchema)
    .mutation(async ({ ctx, input }): Promise<Result<CreateExceptionResponse>> => {
      try {
        // Validate resource access
        const resource = await validateResourceAccess(ctx, input.resourceId, 'write');

        // Check for existing exception on the same date
        const existingException = await ctx.db.query.resourceAvailabilityExceptions.findFirst({
          where: and(
            eq(resourceAvailabilityExceptions.resourceId, input.resourceId),
            eq(resourceAvailabilityExceptions.exceptionDate, input.exceptionDate)
          ),
        });

        if (existingException) {
          throw createExceptionConflictError(input.resourceId, input.exceptionDate);
        }

        // Prepare exception data
        type ExceptionInsert = typeof resourceAvailabilityExceptions.$inferInsert;
        const exceptionData: ExceptionInsert = {
          organizationId: resource.organizationId,
          resourceId: input.resourceId,
          exceptionDate: input.exceptionDate,
          startTimeUtc: input.startTimeUtc || null,
          endTimeUtc: input.endTimeUtc || null,
          hoursAvailable: input.hoursAvailable.toString(),
          hourlyRate: input.hourlyRate.toString(),
          currency: input.currency,
          isActive: input.isActive,
          exceptionType: input.exceptionType,
          notes: input.notes || null,
        };

        // Insert the exception
        const [newException] = await ctx.db
          .insert(resourceAvailabilityExceptions)
          .values(exceptionData)
          .returning({
            id: resourceAvailabilityExceptions.id,
            resourceId: resourceAvailabilityExceptions.resourceId,
            exceptionDate: resourceAvailabilityExceptions.exceptionDate,
            startTimeUtc: resourceAvailabilityExceptions.startTimeUtc,
            endTimeUtc: resourceAvailabilityExceptions.endTimeUtc,
            hoursAvailable: resourceAvailabilityExceptions.hoursAvailable,
            hourlyRate: resourceAvailabilityExceptions.hourlyRate,
            currency: resourceAvailabilityExceptions.currency,
            isActive: resourceAvailabilityExceptions.isActive,
            exceptionType: resourceAvailabilityExceptions.exceptionType,
            notes: resourceAvailabilityExceptions.notes,
            createdAt: resourceAvailabilityExceptions.createdAt,
            updatedAt: resourceAvailabilityExceptions.updatedAt,
          });

        if (!newException) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create availability exception',
          });
        }

        return {
          success: true,
          data: {
            id: newException.id,
            resourceId: newException.resourceId,
            exceptionDate: newException.exceptionDate,
            startTimeUtc: newException.startTimeUtc || undefined,
            endTimeUtc: newException.endTimeUtc || undefined,
            hoursAvailable: newException.hoursAvailable || '0.00',
            hourlyRate: newException.hourlyRate || '0.00',
            currency: newException.currency || 'USD',
            isActive: newException.isActive,
            exceptionType: newException.exceptionType,
            notes: newException.notes || undefined,
            createdAt: newException.createdAt,
            updatedAt: newException.updatedAt || undefined,
          },
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error; // Re-throw TRPC errors as-is
        }

        // Convert our custom errors to TRPC errors
        if (isExceptionConflictError(error)) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: error.message,
            cause: error,
          });
        }

        if (isExceptionValidationError(error)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
            cause: error,
          });
        }

        // Handle database errors
        if (error instanceof Error && error.message.includes('unique constraint')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'An exception for this resource and date already exists',
          });
        }

        // Generic error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create availability exception',
          cause: error,
        });
      }
    }),

  /**
   * Get exceptions by resource ID
   */
  getByResourceId: protectedProcedure
    .input(getExceptionsByResourceIdSchema)
    .query(async ({ ctx, input }): Promise<Result<GetExceptionsByResourceIdResponse>> => {
      try {
        // Validate resource access
        const resource = await validateResourceAccess(ctx, input.resourceId, 'read');

        // Build query conditions
        let whereConditions = [eq(resourceAvailabilityExceptions.resourceId, input.resourceId)];

        // Add date range filters if provided
        if (input.startDate) {
          whereConditions.push(eq(resourceAvailabilityExceptions.exceptionDate, input.startDate));
        }

        if (input.endDate && input.startDate) {
          // For date range, we need to use a different approach
          whereConditions = [
            eq(resourceAvailabilityExceptions.resourceId, input.resourceId),
            // Note: This would need to be adjusted for proper date range queries
            // For now, we'll just filter by resourceId and handle date range in application
          ];
        }

        // Get exceptions for the resource
        const exceptions = await ctx.db.query.resourceAvailabilityExceptions.findMany({
          where: and(...whereConditions),
          orderBy: [desc(resourceAvailabilityExceptions.exceptionDate)],
          columns: {
            id: true,
            resourceId: true,
            exceptionDate: true,
            startTimeUtc: true,
            endTimeUtc: true,
            hoursAvailable: true,
            hourlyRate: true,
            currency: true,
            isActive: true,
            exceptionType: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // Filter by date range if needed (client-side filtering for now)
        let filteredExceptions = exceptions;
        if (input.startDate && input.endDate) {
          filteredExceptions = exceptions.filter(exception => {
            return exception.exceptionDate >= input.startDate! && exception.exceptionDate <= input.endDate!;
          });
        } else if (input.startDate) {
          filteredExceptions = exceptions.filter(exception => {
            return exception.exceptionDate === input.startDate;
          });
        }

        return {
          success: true,
          data: {
            exceptions: filteredExceptions.map(exception => ({
              id: exception.id,
              resourceId: exception.resourceId,
              exceptionDate: exception.exceptionDate,
              startTimeUtc: exception.startTimeUtc || undefined,
              endTimeUtc: exception.endTimeUtc || undefined,
              hoursAvailable: exception.hoursAvailable || '0.00',
              hourlyRate: exception.hourlyRate || '0.00',
              currency: exception.currency || 'USD',
              isActive: exception.isActive,
              exceptionType: exception.exceptionType,
              notes: exception.notes || undefined,
              createdAt: exception.createdAt,
              updatedAt: exception.updatedAt || undefined,
            })),
          },
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve availability exceptions',
          cause: error,
        });
      }
    }),

  /**
   * Update an existing availability exception
   */
  update: protectedProcedure
    .input(updateExceptionSchema)
    .mutation(async ({ ctx, input }): Promise<Result<UpdateExceptionResponse>> => {
      try {
        // Validate exception access
        const exception = await validateExceptionAccess(ctx, input.id, 'write');

        // Check for conflicts if date is being updated
        if (input.exceptionDate && input.exceptionDate !== exception.exceptionDate) {
          const existingException = await ctx.db.query.resourceAvailabilityExceptions.findFirst({
            where: and(
              eq(resourceAvailabilityExceptions.resourceId, exception.resourceId),
              eq(resourceAvailabilityExceptions.exceptionDate, input.exceptionDate),
              // Exclude current exception from the check
              eq(resourceAvailabilityExceptions.id, input.id)
            ),
          });

          if (existingException) {
            throw createExceptionConflictError(exception.resourceId, input.exceptionDate);
          }
        }

        // Prepare update data (exclude undefined values)
        const updateData: Partial<typeof resourceAvailabilityExceptions.$inferInsert> = {};
        if (input.exceptionDate !== undefined) updateData.exceptionDate = input.exceptionDate;
        if (input.startTimeUtc !== undefined) updateData.startTimeUtc = input.startTimeUtc || null;
        if (input.endTimeUtc !== undefined) updateData.endTimeUtc = input.endTimeUtc || null;
        if (input.hoursAvailable !== undefined) updateData.hoursAvailable = input.hoursAvailable.toString();
        if (input.hourlyRate !== undefined) updateData.hourlyRate = input.hourlyRate.toString();
        if (input.currency !== undefined) updateData.currency = input.currency;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.exceptionType !== undefined) updateData.exceptionType = input.exceptionType;
        if (input.notes !== undefined) updateData.notes = input.notes || null;

        // Add updated timestamp
        updateData.updatedAt = new Date();

        // Update the exception
        const [updatedException] = await ctx.db
          .update(resourceAvailabilityExceptions)
          .set(updateData)
          .where(eq(resourceAvailabilityExceptions.id, input.id))
          .returning({
            id: resourceAvailabilityExceptions.id,
            resourceId: resourceAvailabilityExceptions.resourceId,
            exceptionDate: resourceAvailabilityExceptions.exceptionDate,
            startTimeUtc: resourceAvailabilityExceptions.startTimeUtc,
            endTimeUtc: resourceAvailabilityExceptions.endTimeUtc,
            hoursAvailable: resourceAvailabilityExceptions.hoursAvailable,
            hourlyRate: resourceAvailabilityExceptions.hourlyRate,
            currency: resourceAvailabilityExceptions.currency,
            isActive: resourceAvailabilityExceptions.isActive,
            exceptionType: resourceAvailabilityExceptions.exceptionType,
            notes: resourceAvailabilityExceptions.notes,
            createdAt: resourceAvailabilityExceptions.createdAt,
            updatedAt: resourceAvailabilityExceptions.updatedAt,
          });

        if (!updatedException) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Exception not found or update failed',
          });
        }

        return {
          success: true,
          data: {
            id: updatedException.id,
            resourceId: updatedException.resourceId,
            exceptionDate: updatedException.exceptionDate,
            startTimeUtc: updatedException.startTimeUtc || undefined,
            endTimeUtc: updatedException.endTimeUtc || undefined,
            hoursAvailable: updatedException.hoursAvailable || '0.00',
            hourlyRate: updatedException.hourlyRate || '0.00',
            currency: updatedException.currency || 'USD',
            isActive: updatedException.isActive,
            exceptionType: updatedException.exceptionType,
            notes: updatedException.notes || undefined,
            createdAt: updatedException.createdAt,
            updatedAt: updatedException.updatedAt || undefined,
          },
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (isExceptionNotFoundError(error)) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: error.message,
            cause: error,
          });
        }

        if (isExceptionValidationError(error) || isExceptionConflictError(error)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update availability exception',
          cause: error,
        });
      }
    }),

  /**
   * Delete an availability exception
   */
  delete: protectedProcedure
    .input(deleteExceptionSchema)
    .mutation(async ({ ctx, input }): Promise<Result<DeleteExceptionResponse>> => {
      try {
        // Validate exception access
        await validateExceptionAccess(ctx, input.id, 'write');

        // Delete the exception
        const [deletedException] = await ctx.db
          .delete(resourceAvailabilityExceptions)
          .where(eq(resourceAvailabilityExceptions.id, input.id))
          .returning({ id: resourceAvailabilityExceptions.id });

        if (!deletedException) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Exception not found or delete failed',
          });
        }

        return {
          success: true,
          data: {
            id: deletedException.id,
            deleted: true,
          },
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (isExceptionNotFoundError(error)) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: error.message,
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete availability exception',
          cause: error,
        });
      }
    }),
});