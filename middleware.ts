import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "~/lib/auth/config";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/api/auth",
];

// Define auth routes that should redirect to dashboard if user is already authenticated
const authRoutes = [
  "/login",
  "/register",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(route)
  );

  // Check if the route is an auth route (login/register)
  const isAuthRoute = authRoutes.some((route) =>
    pathname === route || pathname.startsWith(route)
  );

  try {
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });

    // If user is authenticated and trying to access auth routes, redirect to dashboard
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If user is not authenticated and route is protected, redirect to login
    if (!session && !isPublicRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For API routes that are not auth routes, ensure user is authenticated
    if (pathname.startsWith("/api/") && !isPublicRoute && !session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // If there's an error checking the session and it's not a public route, redirect to login
    if (!isPublicRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};