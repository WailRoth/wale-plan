"use client";

import Link from "next/link";
import { useAuth } from "~/components/auth/AuthProvider";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { User, LogOut, Settings, BarChart3, Building, Folder, Users } from "lucide-react";
import { CompactProjectNavigation } from "~/components/projects/ProjectNavigation";
import { useOrganization } from "~/lib/organization/context";

export function Navigation() {
  const { session, signOut, isLoading } = useAuth();

  // Only use organization context if available (on dashboard pages with OrganizationProvider)
  let currentOrganization = null;
  try {
    const organizationContext = useOrganization();
    currentOrganization = organizationContext?.currentOrganization || null;
  } catch {
    // OrganizationProvider not available, this is expected on public pages (like landing page)
    currentOrganization = null;
  }

  if (isLoading) {
    return (
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">wale-plan</div>
          <div className="w-24 h-9 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          wale-plan
        </Link>

        {!session ? (
          // Non-authenticated navigation
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        ) : (
          // Authenticated navigation
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>

            <Link href="/dashboard/organizations">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Organizations</span>
              </Button>
            </Link>

            <Link href="/dashboard/projects">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Folder className="h-4 w-4" />
                <span>Projects</span>
              </Button>
            </Link>

            <Link href="/dashboard/resources">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Resources</span>
              </Button>
            </Link>

            {/* Project Navigation */}
            {currentOrganization && (
              <div className="border-l pl-4 ml-4">
                <CompactProjectNavigation
                  organizationId={currentOrganization.id}
                  onProjectChange={(projectId) => {
                    // Navigate to project-specific dashboard
                    window.location.href = `/dashboard/projects/${projectId}`;
                  }}
                />
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {session.user.name?.charAt(0).toUpperCase() ||
                       session.user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center space-x-2 w-full">
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/organizations" className="flex items-center space-x-2 w-full">
                    <Building className="h-4 w-4" />
                    <span>Organizations</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/projects" className="flex items-center space-x-2 w-full">
                    <Folder className="h-4 w-4" />
                    <span>Projects</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/resources" className="flex items-center space-x-2 w-full">
                    <Users className="h-4 w-4" />
                    <span>Resources</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center space-x-2 w-full">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center space-x-2 w-full">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}