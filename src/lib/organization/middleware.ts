import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { organizationMembers } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

/**
 * Middleware to ensure organization membership and context
 */
export const withOrganization = (procedure: typeof protectedProcedure) =>
  procedure.use(async ({ ctx, next }) => {
    // Try to get organization ID from session context first
    let organizationId = ctx.session?.user?.organizationId;

    // Fallback to request headers if not in session
    if (!organizationId) {
      organizationId = ctx.headers?.get('x-organization-id');
    }

    if (!organizationId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Organization ID is required (not found in session or headers)',
      });
    }

    const orgId = typeof organizationId === 'string' ? parseInt(organizationId, 10) : organizationId;

    // Check if user is a member of the organization
    const membership = await ctx.db.query.organizationMembers.findFirst({
      where: eq(organizationMembers.organizationId, orgId),
      columns: {
        organizationId: true,
        userId: true,
        role: true,
      },
    });

    if (!membership) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this organization',
      });
    }

    // Add organization context to the procedure context
    return next({
      ctx: {
        ...ctx,
        organizationId: orgId,
        userRole: membership.role,
      },
    });
  });

/**
 * Middleware for admin/owner-only procedures
 */
export const withOrganizationAdmin = (procedure: typeof protectedProcedure) =>
  withOrganization(procedure).use(async ({ ctx, next }) => {
    if (!ctx.userRole || (ctx.userRole !== 'owner' && ctx.userRole !== 'admin')) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only organization admins can perform this action',
      });
    }

    return next({
      ctx: {
        ...ctx,
        organizationId: ctx.organizationId,
        userRole: ctx.userRole,
      },
    });
  });

/**
 * Helper to filter queries by organization
 */
export const filterByOrganization = <T extends Record<string, any>>(
  query: T,
  organizationId: number
) => {
  return query.where?.eq?.('organizationId', organizationId) ||
         { organizationId };
};

/**
 * Utility for automatic organization-based database queries
 */
export class OrganizationAwareDB {
  constructor(private db: any, private organizationId: number) {}

  // Auto-filter queries by organization
  query(table: any) {
    return this.db.query(table).where(eq(table.organizationId, this.organizationId));
  }

  // Auto-filter selects by organization
  select(table: any) {
    return this.db.select(table).where(eq(table.organizationId, this.organizationId));
  }

  // Auto-filter inserts with organization
  insert(table: any) {
    return this.db.insert(table).values({ organizationId: this.organizationId });
  }

  // Auto-filter updates by organization
  update(table: any) {
    return this.db.update(table).where(eq(table.organizationId, this.organizationId));
  }

  // Auto-filter deletes by organization
  delete(table: any) {
    return this.db.delete(table).where(eq(table.organizationId, this.organizationId));
  }
}

/**
 * Get organization-aware database instance
 */
export const getOrganizationDB = (db: any, organizationId: number) => {
  return new OrganizationAwareDB(db, organizationId);
};