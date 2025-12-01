import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

import { authClient } from "~/server/better-auth/client";
import { getSession } from "~/server/better-auth/server";

export default async function AuthPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to Wale Plan
          </CardTitle>
          <CardDescription className="text-center">
            Choose your preferred sign in method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GitHub Sign In */}
          <form>
            <Button
              variant="outline"
              className="w-full"
              formAction={async () => {
                "use server";
                await authClient.signIn.social({
                  provider: "github",
                  callbackURL: "/dashboard",
                });
              }}
            >
              Sign in with GitHub
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email/Password Sign In */}
          <form
            className="space-y-4"
            action={async (formData: FormData) => {
              "use server";
              const email = formData.get("email") as string;
              const password = formData.get("password") as string;

              await authClient.signIn.email({
                email,
                password,
                callbackURL: "/dashboard",
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign in with email
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <Link
              href="/auth/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}