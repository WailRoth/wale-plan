import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  organizations,
  organizationMembers,
  user,
} from "~/server/db/schema";
import type { organizations as OrganizationTable, organizationMembers as OrganizationMemberTable } from "~/server/db/schema";

// Result type for consistent error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Helper function to validate IANA timezone
const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

export const organizationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Organization name is required").max(256),
      description: z.string().optional(),
      timezone: z.string().min(1, "Timezone is required").max(50)
        .refine(isValidTimezone, "Invalid timezone identifier"),
    }))
    .mutation(async ({ ctx, input }): Promise<Result<{ id: number; name: string; timezone: string }>> => {
      type OrganizationInsert = typeof OrganizationTable.$inferInsert;
      type OrganizationMemberInsert = typeof OrganizationMemberTable.$inferInsert;
      type OrganizationReturn = Pick<typeof OrganizationTable.$inferSelect, 'id' | 'name' | 'timezone'>;

      try {
        // Create organization
        const orgData: OrganizationInsert = {
          name: input.name,
          slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100),
          description: input.description,
          timezone: input.timezone,
        };

        const [organization] = await ctx.db.insert(organizations)
          .values(orgData)
          .returning({ id: organizations.id, name: organizations.name, timezone: organizations.timezone }) as OrganizationReturn[];

        if (!organization) {
          return {
            success: false,
            error: new Error("Failed to create organization")
          };
        }

        // Add user as owner
        const memberData: Omit<OrganizationMemberInsert, 'id' | 'joinedAt'> = {
          organizationId: organization.id,
          userId: ctx.session.user.id,
          role: "owner",
        };

        await ctx.db.insert(organizationMembers)
          .values(memberData);

        return {
          success: true,
          data: organization
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Unknown error occurred")
        };
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(256).optional(),
      description: z.string().optional(),
      timezone: z.string().min(1).max(50)
        .refine(isValidTimezone, "Invalid timezone identifier")
        .optional(),
    }))
    .mutation(async ({ ctx, input }): Promise<Result<{ id: number; name: string; timezone: string }>> => {
      try {
        // Check if user is member of the organization
        const membership = await ctx.db.query.organizationMembers.findFirst({
          where: and(
            eq(organizationMembers.organizationId, input.id),
            eq(organizationMembers.userId, ctx.session.user.id),
          ),
        });

        if (!membership) {
          return {
            success: false,
            error: new Error("Not a member of this organization")
          };
        }

        // Update organization
        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.timezone !== undefined) updateData.timezone = input.timezone;

        const [organization] = await ctx.db
          .update(organizations)
          .set(updateData)
          .where(eq(organizations.id, input.id))
          .returning({ id: organizations.id, name: organizations.name, timezone: organizations.timezone });

        if (!organization) {
          return {
            success: false,
            error: new Error("Organization not found")
          };
        }

        return {
          success: true,
          data: organization
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Unknown error occurred")
        };
      }
    }),

  getById: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ ctx, input }): Promise<Result<{ id: number; name: string; description: string | null; timezone: string; role: string }>> => {
      try {
        // Check membership and get organization details
        const membership = await ctx.db.query.organizationMembers.findFirst({
          where: and(
            eq(organizationMembers.organizationId, input.id),
            eq(organizationMembers.userId, ctx.session.user.id),
          ),
          with: {
            organization: true,
          },
        });

        if (!membership) {
          return {
            success: false,
            error: new Error("Not a member of this organization")
          };
        }

        return {
          success: true,
          data: {
            id: membership.organization.id,
            name: membership.organization.name,
            description: membership.organization.description,
            timezone: membership.organization.timezone,
            role: membership.role,
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Unknown error occurred")
        };
      }
    }),

  getUserOrganizations: protectedProcedure
    .query(async ({ ctx }): Promise<Result<Array<{ id: number; name: string; timezone: string; role: string }>>> => {
      try {
        const userOrganizations = await ctx.db.query.organizationMembers.findMany({
          where: eq(organizationMembers.userId, ctx.session.user.id),
          with: {
            organization: {
              columns: {
                id: true,
                name: true,
                timezone: true,
              },
            },
          },
        });

        return {
          success: true,
          data: userOrganizations.map(member => ({
            id: member.organization.id,
            name: member.organization.name,
            timezone: member.organization.timezone,
            role: member.role,
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Unknown error occurred")
        };
      }
    }),

  // Get available IANA timezones
  getAvailableTimezones: protectedProcedure
    .query((): Result<string[]> => {
      try {
        // Get a subset of common IANA timezones
        const commonTimezones = [
          "UTC",
          "America/New_York",
          "America/Chicago",
          "America/Denver",
          "America/Los_Angeles",
          "Europe/London",
          "Europe/Paris",
          "Europe/Berlin",
          "Asia/Tokyo",
          "Asia/Shanghai",
          "Asia/Dubai",
          "Australia/Sydney",
          "Pacific/Auckland",
        ];

        return {
          success: true,
          data: commonTimezones
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Failed to get timezones")
        };
      }
    }),
});