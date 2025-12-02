"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { TimezoneSelector } from "~/components/organization/TimezoneSelector";
import { useToast } from "~/components/ui/toast/use-toast";
import { Loader2, Building, User, Clock } from "lucide-react";
import { cn } from "~/lib/utils";
import { useOrganization } from "~/lib/organization/context";

// Form validation schema
const registerWithOrgSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  name: z.string().min(1, "Name is required").max(100),
  organizationName: z.string().min(1, "Organization name is required").max(256),
  organizationDescription: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required").max(50),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterWithOrgFormValues = z.infer<typeof registerWithOrgSchema>;

export function RegisterWithOrganizationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { refetch: refetchOrganizations } = useOrganization();

  const registerMutation = api.auth.registerWithOrganization.useMutation({
    onSuccess: (result) => {
      toast({
        title: "Registration successful! 🎉",
        description: `Welcome to ${result.organization.name}! Redirecting to your dashboard...`,
      });

      // Refetch organizations list to include the newly created organization
      refetchOrganizations();

      // Add a slight delay for the user to see the success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message ?? "An unexpected error occurred",
      });
    },
  });

  const form = useForm<RegisterWithOrgFormValues>({
    resolver: zodResolver(registerWithOrgSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      organizationName: "",
      organizationDescription: "",
      timezone: "UTC",
    },
  });

  const onSubmit = async (values: RegisterWithOrgFormValues) => {
    setIsLoading(true);

    try {
      await registerMutation.mutateAsync(values);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-6 w-6" />
          Create Your Organization
        </CardTitle>
        <CardDescription>
          Set up your account and organization to get started with wale-plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>

                    {/* Password strength indicator */}
                    {field.value && (
                      <div className="space-y-2">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-1 flex-1 rounded-full",
                                i < passwordStrength(field.value || "")
                                  ? getPasswordStrengthColor(passwordStrength(field.value || ""))
                                  : "bg-gray-200"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Password strength: {passwordStrength(field.value) <= 2 ? "Weak" :
                                          passwordStrength(field.value) <= 3 ? "Fair" :
                                          passwordStrength(field.value) <= 4 ? "Good" : "Strong"}
                        </p>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Organization Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Organization Setup</h3>
              </div>

              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Company"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description of your organization"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <TimezoneSelector
                      value={field.value || "UTC"}
                      onChange={field.onChange}
                      label="Organization Timezone"
                      disabled={isLoading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account & Organization"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}