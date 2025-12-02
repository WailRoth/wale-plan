"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import { authClient, emailSchema, passwordSchema } from "~/lib/auth/client";
import { cn } from "~/lib/utils";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "~/components/ui/toast/use-toast";

// Password strength levels
interface PasswordStrength {
  level: "weak" | "fair" | "good" | "strong";
  score: number;
  message: string;
  color: string;
}

// Form validation schema with RFC 5322 email validation
const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// Password strength calculation
const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { level: "weak", score: 0, message: "", color: "bg-gray-200" };
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  score = Object.values(checks).filter(Boolean).length;

  if (score < 2) {
    return { level: "weak", score, message: "Weak password", color: "bg-red-500" };
  }
  if (score < 4) {
    return { level: "fair", score, message: "Fair password", color: "bg-yellow-500" };
  }
  if (score < 5) {
    return { level: "good", score, message: "Good password", color: "bg-blue-500" };
  }
  return { level: "strong", score, message: "Strong password", color: "bg-green-500" };
};

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    level: "weak",
    score: 0,
    message: "",
    color: "bg-gray-200",
  });

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handlePasswordChange = (value: string) => {
    form.setValue("password", value);
    const strength = calculatePasswordStrength(value);
    setPasswordStrength(strength);
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.email.split("@")[0] || "User", // Basic name from email with fallback
      });

      if (result.error) {
        const errorMessage = result.error.message || "Registration failed";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: errorMessage,
        });
        return;
      }

      // Registration successful
      toast({
        title: "Account created successfully! 🎉",
        description: "Welcome to wale-plan! Redirecting to your dashboard...",
      });

      // Add a slight delay for the user to see the success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Sign up to get started with wale-plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      {...field}
                      disabled={isLoading}
                      className={cn(
                        form.formState.errors.email && "border-red-500 focus:ring-red-500"
                      )}
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
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className={cn(
                        form.formState.errors.password && "border-red-500 focus:ring-red-500"
                      )}
                    />
                  </FormControl>

                  {/* Password strength meter */}
                  {field.value && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Password strength:
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            passwordStrength.level === "weak" && "text-red-600",
                            passwordStrength.level === "fair" && "text-yellow-600",
                            passwordStrength.level === "good" && "text-blue-600",
                            passwordStrength.level === "strong" && "text-green-600"
                          )}
                        >
                          {passwordStrength.message}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 flex-1 rounded-full",
                              i < passwordStrength.score
                                ? passwordStrength.color
                                : "bg-gray-200"
                            )}
                          />
                        ))}
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li className={cn(/[A-Z]/.test(field.value) && "text-green-600")}>
                          ✓ At least one uppercase letter
                        </li>
                        <li className={cn(/[0-9]/.test(field.value) && "text-green-600")}>
                          ✓ At least one number
                        </li>
                        <li className={cn(/[^a-zA-Z0-9]/.test(field.value) && "text-green-600")}>
                          ✓ At least one special character
                        </li>
                        <li className={cn(field.value.length >= 8 && "text-green-600")}>
                          ✓ At least 8 characters
                        </li>
                      </ul>
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
                      className={cn(
                        form.formState.errors.confirmPassword && "border-red-500 focus:ring-red-500"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

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
                "Create Account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}