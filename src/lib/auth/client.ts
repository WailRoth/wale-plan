import { createAuthClient } from "better-auth/client";
import { z } from "zod";

// Create auth client for client-side usage
export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    : 'http://localhost:3000'
});

// RFC 5322 compliant email validation regex
const rfc5322EmailRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

// Validation schemas (shared between client and server)
export const emailSchema = z.string()
  .min(1, "Email is required")
  .regex(rfc5322EmailRegex, "Invalid email address format");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// Export auth client for client-side components
export default authClient;