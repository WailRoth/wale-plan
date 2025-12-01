import { redirect } from "next/navigation";

import { getSession } from "~/server/better-auth/server";

export default async function Home() {
  const session = await getSession();

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  // If user is not logged in, redirect to auth page
  redirect("/auth");
}
