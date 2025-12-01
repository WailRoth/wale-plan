import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

import { env } from "~/env";
import { db } from "~/server/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    organization({
      // Allow users to create organizations by default
      allowUserToCreateOrganization: async () => {
        return true; // You can implement custom logic here
      },
      // Configure organization deletion
      disableOrganizationDeletion: false, // Set to true to disable deletion
      // Configure team support
      teams: {
        enabled: true,
        maximumTeams: 10, // Fixed maximum teams per organization
        maximumMembersPerTeam: 50, // Maximum members per team
      },
      // Configure dynamic access control for roles and permissions
      dynamicAccessControl: {
        enabled: true,
        maximumRolesPerOrganization: 20, // Maximum roles per organization
      },
      // Configure membership limits
      membershipLimit: 100, // Maximum members per organization (null = unlimited)
      // Configure invitation email
      sendInvitationEmail: async (data) => {
        // TODO: Implement email sending logic
        // This is a placeholder - you should integrate with your email service
        console.log("Invitation email sent to:", data.email);
        console.log("Invitation link:", `${env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}`);

        // Example with nodemailer or other email service:
        // await sendEmail({
        //   to: data.email,
        //   subject: `Invitation to join ${data.organization.name}`,
        //   html: `
        //     <p>You've been invited to join ${data.organization.name} by ${data.inviter.user.name}.</p>
        //     <p>Click <a href="${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}">here</a> to accept the invitation.</p>
        //   `
        // });
      },
    }),
  ],
  // Add session management with active organization support
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});

export type Session = typeof auth.$Infer.Session;
