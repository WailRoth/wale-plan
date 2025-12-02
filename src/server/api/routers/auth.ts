import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { organizations, organizationMembers, user } from "~/server/db/schema";
import { authClient } from "~/lib/auth/client";
import { isValidTimezone } from "~/lib/organization/utils";
import { eq } from "drizzle-orm";
import type { organizations as OrganizationTable } from "~/server/db/schema";

export const authRouter = createTRPCRouter({
  registerWithOrganization: publicProcedure
    .input(z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      name: z.string().min(1, "Name is required").max(100),
      organizationName: z.string().min(1, "Organization name is required").max(256),
      organizationDescription: z.string().optional(),
      timezone: z.string().min(1, "Timezone is required").max(50)
        .refine(isValidTimezone, "Invalid timezone identifier"),
    }))
    .mutation(async ({ ctx, input }) => {
      type OrganizationInsert = typeof organizations.$inferInsert;
      type OrganizationMemberInsert = typeof organizationMembers.$inferSelect;

      try {
        // Step 1: Create the user account
        const userResult = await authClient.signUp.email({
          email: input.email,
          password: input.password,
          name: input.name,
        });

        if (userResult.error) {
          throw new Error(userResult.error.message ?? "Failed to create user account");
        }

        if (!userResult.data?.user) {
          throw new Error("User account created but no user data returned");
        }

        // Step 2: Create the default organization
        const orgData: OrganizationInsert = {
          name: input.organizationName,
          slug: input.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100),
          description: input.organizationDescription,
          timezone: input.timezone,
        };

        const [organization] = await ctx.db.insert(organizations)
          .values(orgData)
          .returning({ id: organizations.id, name: organizations.name, description: organizations.description, timezone: organizations.timezone });

        if (!organization) {
          throw new Error("Failed to create organization");
        }

        // Step 3: Add user as owner of the organization
        const memberData: Omit<OrganizationMemberInsert, 'id' | 'joinedAt'> = {
          organizationId: organization.id,
          userId: userResult.data.user.id,
          role: "owner",
        };

        await ctx.db.insert(organizationMembers)
          .values(memberData);

        // Step 4: Update user with organization reference
        await ctx.db.update(user)
          .set({ organizationId: organization.id })
          .where(eq(user.id, userResult.data.user.id));

        return {
          success: true,
          user: {
            id: userResult.data.user.id,
            email: userResult.data.user.email,
            name: userResult.data.user.name,
          },
          organization: {
            id: organization.id,
            name: organization.name,
            description: organization.description,
            timezone: organization.timezone,
            role: "owner",
          },
        };
      } catch (error) {
        console.error("Registration with organization failed:", error);

        const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
        throw new Error(errorMessage);
      }
    }),
});