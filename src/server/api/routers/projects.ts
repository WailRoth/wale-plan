import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  projects,
  organizations,
  organizationMembers,
} from "~/server/db/schema";
import type { projects as ProjectTable } from "~/server/db/schema";

// Result type for consistent error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Validation schemas for project data
const workingDaysSchema = z.array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]))
  .min(0, "At least one working day is required")
  .max(7, "Cannot have more than 7 working days");

const workingHoursSchema = z.record(z.string(), z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
}));

const projectStatusSchema = z.enum(["planning", "active", "completed", "archived"]);

export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      organizationId: z.number().min(1, "Organization ID is required"),
      name: z.string().min(1, "Project name is required").max(256).trim().transform(val => val.replace(/<[^>]*>/g, '')), // Sanitize HTML
      description: z.string().optional().transform(val => val ? val.trim().replace(/<[^>]*>/g, '') : ''), // Sanitize HTML
      status: projectStatusSchema.optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      workingDays: workingDaysSchema.optional(),
      workingHours: workingHoursSchema.optional(),
    }))
    .mutation(async ({ ctx, input }): Promise<Result<{ id: number; name: string; organizationId: number; status: string }>> => {
      type ProjectInsert = typeof ProjectTable.$inferInsert;
      type ProjectReturn = Pick<typeof ProjectTable.$inferSelect, 'id' | 'name' | 'organizationId' | 'status'>;

      try {
        // Check if user is member of the organization
        const membership = await ctx.db.query.organizationMembers.findFirst({
          where: and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, ctx.session.user.id),
          ),
        });

        if (!membership) {
          return {
            success: false,
            error: new Error("Not a member of this organization")
          };
        }

        // Create project
        const projectData: ProjectInsert = {
          organizationId: input.organizationId,
          name: input.name,
          description: input.description,
          status: input.status || "planning",
          startDate: input.startDate,
          endDate: input.endDate,
          workingDays: input.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri"],
          workingHours: input.workingHours || {
            monday: { start: "09:00", end: "17:00" },
            tuesday: { start: "09:00", end: "17:00" },
            wednesday: { start: "09:00", end: "17:00" },
            thursday: { start: "09:00", end: "17:00" },
            friday: { start: "09:00", end: "17:00" },
          },
        };

        const [project] = await ctx.db.insert(projects)
          .values(projectData)
          .returning({
            id: projects.id,
            name: projects.name,
            organizationId: projects.organizationId,
            status: projects.status
          }) as ProjectReturn[];

        if (!project) {
          return {
            success: false,
            error: new Error("Failed to create project")
          };
        }

        return {
          success: true,
          data: project
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
      organizationId: z.number().optional(),
      name: z.string().min(1).max(256).trim().transform(val => val.replace(/<[^>]*>/g, '')).optional(), // Sanitize HTML
      description: z.string().transform(val => val ? val.trim().replace(/<[^>]*>/g, '') : '').optional(), // Sanitize HTML
      status: projectStatusSchema.optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      workingDays: workingDaysSchema.optional(),
      workingHours: workingHoursSchema.optional(),
    }))
    .mutation(async ({ ctx, input }): Promise<Result<{ id: number; name: string; status: string }>> => {
      try {
        // Check if user is member of the organization that owns the project
        const projectWithMembership = await ctx.db.query.projects.findFirst({
          where: eq(projects.id, input.id),
          with: {
            organization: {
              with: {
                members: {
                  where: eq(organizationMembers.userId, ctx.session.user.id),
                },
              },
            },
          },
        });

        if (!projectWithMembership || projectWithMembership.organization.members.length === 0) {
          return {
            success: false,
            error: new Error("Not authorized to update this project")
          };
        }

        // Update project with proper typing following Drizzle patterns
        const updateData: {
          name?: string;
          description?: string | null;
          status?: string;
          startDate?: Date | null;
          endDate?: Date | null;
          workingDays?: string[];
          workingHours?: Record<string, { start: string; end: string }>;
        } = {};

        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.startDate !== undefined) updateData.startDate = input.startDate;
        if (input.endDate !== undefined) updateData.endDate = input.endDate;
        if (input.workingDays !== undefined) updateData.workingDays = input.workingDays;
        if (input.workingHours !== undefined) updateData.workingHours = input.workingHours;

        const [project] = await ctx.db
          .update(projects)
          .set(updateData)
          .where(eq(projects.id, input.id))
          .returning({ id: projects.id, name: projects.name, status: projects.status });

        if (!project) {
          return {
            success: false,
            error: new Error("Project not found")
          };
        }

        return {
          success: true,
          data: project
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
    .query(async ({ ctx, input }): Promise<Result<{
      id: number;
      name: string;
      description: string | null;
      status: string;
      organizationId: number;
      startDate: Date | null;
      endDate: Date | null;
      workingDays: string[];
      workingHours: Record<string, { start: string; end: string }>;
    }>> => {
      try {
        // Check if user is member of the organization that owns the project
        const projectWithMembership = await ctx.db.query.projects.findFirst({
          where: eq(projects.id, input.id),
          with: {
            organization: {
              with: {
                members: {
                  where: eq(organizationMembers.userId, ctx.session.user.id),
                },
              },
            },
          },
        });

        if (!projectWithMembership || projectWithMembership.organization.members.length === 0) {
          return {
            success: false,
            error: new Error("Not authorized to view this project")
          };
        }

        return {
          success: true,
          data: {
            id: projectWithMembership.id,
            name: projectWithMembership.name,
            description: projectWithMembership.description,
            status: projectWithMembership.status,
            organizationId: projectWithMembership.organizationId,
            startDate: projectWithMembership.startDate,
            endDate: projectWithMembership.endDate,
            workingDays: projectWithMembership.workingDays,
            workingHours: projectWithMembership.workingHours as Record<string, { start: string; end: string }>,
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Unknown error occurred")
        };
      }
    }),

  getOrganizationProjects: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
    }))
    .query(async ({ ctx, input }): Promise<Result<Array<{
      id: number;
      name: string;
      description: string | null;
      status: string;
      startDate: Date | null;
      endDate: Date | null;
    }>>> => {
      try {
        // Check if user is member of the organization
        const membership = await ctx.db.query.organizationMembers.findFirst({
          where: and(
            eq(organizationMembers.organizationId, input.organizationId),
            eq(organizationMembers.userId, ctx.session.user.id),
          ),
        });

        if (!membership) {
          return {
            success: false,
            error: new Error("Not a member of this organization")
          };
        }

        const organizationProjects = await ctx.db.query.projects.findMany({
          where: eq(projects.organizationId, input.organizationId),
          columns: {
            id: true,
            name: true,
            description: true,
            status: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return {
          success: true,
          data: organizationProjects.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
          })) as Array<{
            id: number;
            name: string;
            description: string | null;
            status: string;
            startDate: Date | null;
            endDate: Date | null;
          }>,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Unknown error occurred")
        };
      }
    }),

  getUserProjects: protectedProcedure
    .query(async ({ ctx }): Promise<Result<Array<{
      id: number;
      name: string;
      description: string | null;
      status: string;
      organizationId: number;
      organizationName: string;
    }>>> => {
      try {
        const userProjects = await ctx.db.query.projects.findMany({
          with: {
            organization: {
              columns: {
                id: true,
                name: true,
              },
              with: {
                members: {
                  where: eq(organizationMembers.userId, ctx.session.user.id),
                  columns: {
                    userId: true,
                  },
                },
              },
            },
          },
          where: (projects, { exists, and, eq }) =>
            exists(
              ctx.db.select().from(organizationMembers).where(
                and(
                  eq(organizationMembers.organizationId, projects.organizationId),
                  eq(organizationMembers.userId, ctx.session.user.id),
                )
              )
            ),
          columns: {
            id: true,
            name: true,
            description: true,
            status: true,
            organizationId: true,
          },
        });

        return {
          success: true,
          data: userProjects.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            organizationId: project.organizationId,
            organizationName: project.organization.name,
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Unknown error occurred")
        };
      }
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }): Promise<Result<{ id: number }>> => {
      try {
        // Check if user is member of the organization that owns the project
        const projectWithMembership = await ctx.db.query.projects.findFirst({
          where: eq(projects.id, input.id),
          with: {
            organization: {
              with: {
                members: {
                  where: eq(organizationMembers.userId, ctx.session.user.id),
                },
              },
            },
          },
        });

        if (!projectWithMembership || projectWithMembership.organization.members.length === 0) {
          return {
            success: false,
            error: new Error("Not authorized to delete this project")
          };
        }

        // Delete project (cascade will handle related records)
        const [deletedProject] = await ctx.db
          .delete(projects)
          .where(eq(projects.id, input.id))
          .returning({ id: projects.id });

        if (!deletedProject) {
          return {
            success: false,
            error: new Error("Project not found")
          };
        }

        return {
          success: true,
          data: deletedProject
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Unknown error occurred")
        };
      }
    }),

  // Get available working days
  getAvailableWorkingDays: protectedProcedure
    .query((): Result<string[]> => {
      try {
        const workingDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return {
          success: true,
          data: workingDays
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Failed to get working days")
        };
      }
    }),

  // Get available project statuses
  getAvailableStatuses: protectedProcedure
    .query((): Result<string[]> => {
      try {
        const statuses = ["planning", "active", "completed", "archived"];
        return {
          success: true,
          data: statuses
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Failed to get project statuses")
        };
      }
    }),
});