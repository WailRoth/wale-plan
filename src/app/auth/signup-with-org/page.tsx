"use client";

import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { RegisterWithOrganizationForm } from "~/components/auth/RegisterWithOrganizationForm";
import { Building, ArrowLeft } from "lucide-react";
import { TRPCReactProvider } from "~/trpc/react";

function SignupWithOrgPage() {

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/auth">
              <Button variant="ghost" className="font-medium">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Building className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Create Account & Organization</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Welcome Message */}
          <Alert className="mb-8 border-blue-200 bg-blue-50/50">
            <Building className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              Create your personal account and set up your organization in one simple process.
              You'll be the owner of the organization and can invite team members later.
            </AlertDescription>
          </Alert>

          {/* Registration Form */}
          <RegisterWithOrganizationForm />

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth" className="font-medium text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Organization Setup</h3>
              <p className="text-sm text-muted-foreground">
                Create your organization workspace with timezone settings
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold">👥</span>
              </div>
              <h3 className="font-medium mb-2">Team Ready</h3>
              <p className="text-sm text-muted-foreground">
                Invite team members and start collaborating immediately
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold">🚀</span>
              </div>
              <h3 className="font-medium mb-2">Start Projects</h3>
              <p className="text-sm text-muted-foreground">
                Begin managing resources and tasks right away
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupWithOrg() {
  return (
    <TRPCReactProvider>
      <SignupWithOrgPage />
    </TRPCReactProvider>
  );
}