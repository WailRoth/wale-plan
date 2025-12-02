import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, desc, asc, inArray } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  resources,
  organizations,
  organizationMembers,
} from "~/server/db/schema";

// Import validation schemas and types
import {
  createResourceSchema,
  updateResourceSchema,
  deleteResourceSchema,
  type CreateResourceInput,
  type UpdateResourceInput,
  type DeleteResourceInput,
} from "~/lib/validations/resource";
import type {
  ResourceResult,
  CreateResourceResponse,
  UpdateResourceResponse,
  DeleteResourceResponse,
  GetResourceResponse,
} from "~/lib/types/resource";
import {
  isResourceValidationError,
  isResourceNotFoundError,
  isResourceAccessError,
} from "~/lib/validations/resource";
import type {
  ResourceValidationError,
  ResourceNotFoundError,
  ResourceAccessError,
} from "~/lib/validations/resource";

// Result type for consistent error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Creates a standardized resource validation error
 */
function createResourceValidationError(field: string, message: string, value?: unknown): ResourceValidationError {
  const error = new Error(message) as ResourceValidationError;
  error.code = 'VALIDATION_ERROR';
  error.field = field;
  error.value = value;
  return error;
}

/**
 * Creates a standardized resource not found error
 */
function createResourceNotFoundError(resourceId: number): ResourceNotFoundError {
  const error = new Error(`Resource with ID ${resourceId} not found`) as ResourceNotFoundError;
  error.code = 'RESOURCE_NOT_FOUND';
  error.resourceId = resourceId;
  return error;
}

/**
 * Creates a standardized resource access error
 */
function createResourceAccessError(organizationId: number, resourceId?: number): ResourceAccessError {
  const message = resourceId
    ? `Access denied to resource ${resourceId} in organization ${organizationId}`
    : `Access denied to resources in organization ${organizationId}`;

  const error = new Error(message) as ResourceAccessError;
  error.code = 'ACCESS_DENIED';
  error.organizationId = organizationId;
  error.resourceId = resourceId;
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
    throw createResourceAccessError(organizationId);
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
    throw createResourceNotFoundError(resourceId);
  }

  await validateOrganizationAccess(ctx, resource.organizationId, action);

  return resource;
}

export const resourcesRouter = createTRPCRouter({
  /**
   * Create a new resource
   */
  create: protectedProcedure
    .input(createResourceSchema.extend({
      organizationId: z.number().min(1, "Organization ID is required"),
    }))
    .mutation(async ({ ctx, input }): Promise<Result<CreateResourceResponse>> => {
      try {
        // Validate organization access
        await validateOrganizationAccess(ctx, input.organizationId, 'write');

        // Check for duplicate resource names within the same organization
        const existingResource = await ctx.db.query.resources.findFirst({
          where: and(
            eq(resources.organizationId, input.organizationId),
            eq(resources.name, input.name)
          ),
        });

        if (existingResource) {
          throw createResourceValidationError('name', `Resource with name "${input.name}" already exists in this organization`);
        }

        // Prepare resource data
        type ResourceInsert = typeof resources.$inferInsert;
        const resourceData: ResourceInsert = {
          organizationId: input.organizationId,
          userId: input.userId || null,
          name: input.name,
          type: input.type,
          hourlyRate: input.hourlyRate.toString(),
          dailyWorkHours: input.dailyWorkHours.toString(),
          currency: input.currency,
          isActive: true,
        };

        // Insert the resource
        const [newResource] = await ctx.db
          .insert(resources)
          .values(resourceData)
          .returning({
            id: resources.id,
            name: resources.name,
            organizationId: resources.organizationId,
            type: resources.type,
            hourlyRate: resources.hourlyRate,
            dailyWorkHours: resources.dailyWorkHours,
            currency: resources.currency,
            isActive: resources.isActive,
          });

        if (!newResource) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create resource',
          });
        }

        return {
          success: true,
          data: {
            id: newResource.id,
            name: newResource.name,
            organizationId: newResource.organizationId,
            type: newResource.type as any,
            hourlyRate: newResource.hourlyRate || '0.00',
            dailyWorkHours: newResource.dailyWorkHours || '8.0',
            currency: newResource.currency || 'USD',
            isActive: newResource.isActive,
          },
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error; // Re-throw TRPC errors as-is
        }

        // Convert our custom errors to TRPC errors
        if (isResourceValidationError(error) || isResourceAccessError(error)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
            cause: error,
          });
        }

        // Handle database errors
        if (error instanceof Error && error.message.includes('duplicate key')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A resource with this name already exists in this organization',
          });
        }

        // Generic error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create resource',
          cause: error,
        });
      }
    }),

  /**
   * Get all resources for the user's organization
   */
  getAll: protectedProcedure
    .query(async ({ ctx }): Promise<Result<GetResourceResponse[]>> => {
      try {
        // Get all organizations the user belongs to
        const userMemberships = await ctx.db.query.organizationMembers.findMany({
          where: eq(organizationMembers.userId, ctx.session.user.id),
          columns: {
            organizationId: true,
          },
        });

        if (userMemberships.length === 0) {
          return {
            success: true,
            data: [],
          };
        }

        const organizationIds = userMemberships.map(m => m.organizationId);

        // Get all resources for the user's organizations
        const resourceList = await ctx.db.query.resources.findMany({
          where: organizationIds.length > 0 ? inArray(resources.organizationId, organizationIds) : undefined,
          orderBy: [asc(resources.name)],
          columns: {
            id: true,
            name: true,
            type: true,
            hourlyRate: true,
            dailyWorkHours: true,
            currency: true,
            isActive: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return {
          success: true,
          data: resourceList.map(resource => ({
            id: resource.id,
            name: resource.name,
            type: resource.type as any,
            hourlyRate: resource.hourlyRate || '0.00',
            dailyWorkHours: resource.dailyWorkHours || '8.0',
            currency: resource.currency || 'USD',
            isActive: resource.isActive,
            userId: resource.userId,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt,
          })),
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve resources',
          cause: error,
        });
      }
    }),

  /**
   * Get a single resource by ID
   */
  getById: protectedProcedure
    .input(z.object({
      id: z.number().positive(),
    }))
    .query(async ({ ctx, input }): Promise<Result<GetResourceResponse>> => {
      try {
        // Validate resource access
        const resource = await validateResourceAccess(ctx, input.id, 'read');

        return {
          success: true,
          data: {
            id: resource.id,
            name: resource.name,
            type: resource.type as any,
            hourlyRate: resource.hourlyRate || '0.00',
            dailyWorkHours: resource.dailyWorkHours || '8.0',
            currency: resource.currency || 'USD',
            isActive: resource.isActive,
            userId: resource.userId,
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt,
          },
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (isResourceNotFoundError(error)) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: error.message,
            cause: error,
          });
        }

        if (isResourceAccessError(error)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: error.message,
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve resource',
          cause: error,
        });
      }
    }),

  /**
   * Update an existing resource
   */
  update: protectedProcedure
    .input(updateResourceSchema)
    .mutation(async ({ ctx, input }): Promise<Result<UpdateResourceResponse>> => {
      try {
        // Validate resource access
        const resource = await validateResourceAccess(ctx, input.id, 'write');

        // Check for duplicate names if name is being updated
        if (input.name && input.name !== resource.name) {
          const existingResource = await ctx.db.query.resources.findFirst({
            where: and(
              eq(resources.organizationId, resource.organizationId),
              eq(resources.name, input.name),
              // Exclude current resource from the check
              eq(resources.id, input.id)
            ),
          });

          if (existingResource) {
            throw createResourceValidationError('name', `Resource with name "${input.name}" already exists in this organization`);
          }
        }

        // Prepare update data (exclude undefined values)
        const updateData: Partial<typeof resources.$inferInsert> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.type !== undefined) updateData.type = input.type;
        if (input.hourlyRate !== undefined) updateData.hourlyRate = input.hourlyRate.toString();
        if (input.dailyWorkHours !== undefined) updateData.dailyWorkHours = input.dailyWorkHours.toString();
        if (input.currency !== undefined) updateData.currency = input.currency;
        if (input.userId !== undefined) updateData.userId = input.userId;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        // Add updated timestamp
        updateData.updatedAt = new Date();

        // Update the resource
        const [updatedResource] = await ctx.db
          .update(resources)
          .set(updateData)
          .where(eq(resources.id, input.id))
          .returning({
            id: resources.id,
            name: resources.name,
            type: resources.type,
            hourlyRate: resources.hourlyRate,
            dailyWorkHours: resources.dailyWorkHours,
            currency: resources.currency,
            isActive: resources.isActive,
            updatedAt: resources.updatedAt,
          });

        if (!updatedResource) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Resource not found or update failed',
          });
        }

        return {
          success: true,
          data: {
            id: updatedResource.id,
            name: updatedResource.name,
            type: updatedResource.type as any,
            hourlyRate: updatedResource.hourlyRate || '0.00',
            dailyWorkHours: updatedResource.dailyWorkHours || '8.0',
            currency: updatedResource.currency || 'USD',
            isActive: updatedResource.isActive,
            updatedAt: updatedResource.updatedAt!,
          },
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (isResourceNotFoundError(error)) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: error.message,
            cause: error,
          });
        }

        if (isResourceValidationError(error) || isResourceAccessError(error)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update resource',
          cause: error,
        });
      }
    }),

  /**
   * Delete a resource
   */
  delete: protectedProcedure
    .input(deleteResourceSchema)
    .mutation(async ({ ctx, input }): Promise<Result<DeleteResourceResponse>> => {
      try {
        // Validate resource access
        const resource = await validateResourceAccess(ctx, input.id, 'write');

        // Check if resource is assigned to any tasks (for future implementation)
        // For now, we'll allow deletion even if assigned

        // Delete the resource
        const [deletedResource] = await ctx.db
          .delete(resources)
          .where(eq(resources.id, input.id))
          .returning({ id: resources.id });

        if (!deletedResource) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Resource not found or delete failed',
          });
        }

        return {
          success: true,
          data: {
            id: deletedResource.id,
            deleted: true,
          },
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (isResourceNotFoundError(error)) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: error.message,
            cause: error,
          });
        }

        if (isResourceAccessError(error)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: error.message,
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete resource',
          cause: error,
        });
      }
    }),
});

