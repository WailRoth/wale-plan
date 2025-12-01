import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { env } from "~/env";

export const authClient = createAuthClient({
  baseURL: `${env.NEXT_PUBLIC_APP_URL}/api/auth`,
  plugins: [
    organizationClient(),
  ],
});

export type Session = typeof authClient.$Infer.Session;
