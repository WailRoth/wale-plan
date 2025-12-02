import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import bcrypt from "bcrypt";

// Database configuration
import { db } from "~/server/db";

// Better Auth configuration for wale-plan - SERVER ONLY
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Will be enabled later based on story requirements
    minPasswordLength: 8,
    password: {
      hash: async (password: string) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [
    nextCookies() // Essential for Next.js 15 integration
  ],
  // Security and validation
  account: {
    accountLinking: {
      enabled: false,
    },
  },
});

// Type definitions
export type Session = typeof auth.$Infer.Session;

// Auth configuration exports for server-side usage
export { auth as default };