/*import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token && req.nextUrl.pathname !== "/login" && req.nextUrl.pathname !== "/register") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/account/:path*"],
};
*/

/*import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  // Redirect unauthenticated users trying to access protected routes
  if (!token && req.nextUrl.pathname !== "/sign-in" && req.nextUrl.pathname !== "/sign-up") {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Allow access to other routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/account/:path*", "/"], // Protect these routes
};
*/

/*import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  const { pathname } = req.nextUrl;

  // Define public routes
  const publicRoutes = ["/sign-in", "/sign-up"];

  // Redirect unauthenticated users accessing protected routes
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Prevent authenticated users from accessing public routes
  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", // Protect dashboard and its subroutes
    "/transactions/:path*", // Protect transactions route
    "/account/:path*", // Protect account route
    "/", // Redirect root to /sign-in
  ],
};
*/

/*import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/api/auth"];

// Middleware to handle authentication and route protection
export function middleware(req: NextRequest) {
  console.log(`Middleware triggered for: ${req.nextUrl.pathname}`);
  const token = req.cookies.get("authToken")?.value;
  const { pathname } = req.nextUrl;

  // If no token is present and trying to access a protected route, redirect to sign-in
  if (!token && !PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // If a token is present and trying to access a public route, redirect to dashboard
  if (token && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Otherwise, allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/account/:path*",
    "/sign-in",
    "/sign-up",
    "/",
  ],
};
*/

/*import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes (accessible without authentication)
const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];

// Middleware function
export function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value; // Fetch the token from cookies
  const { pathname } = req.nextUrl;

  // If no token, restrict access to protected routes
  if (!token && !PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // If a token exists, restrict access to public routes
  if (token && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Config: Specify the routes this middleware applies to
export const config = {
  matcher: [
    "/dashboard/:path*", // Protect dashboard and sub-routes
    "/transactions/:path*", // Protect transactions and sub-routes
    "/account/:path*", // Protect account and sub-routes
    "/", // Protect the root route
    "/sign-in", // Public route
    "/sign-up", // Public route
  ],
};
*/

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];

// Middleware function
export function middleware(req: NextRequest) {
  const isPublicRoute = PUBLIC_ROUTES.includes(req.nextUrl.pathname);

  // Use a custom header to indicate whether the user is authenticated
  const authHeader = req.headers.get("Authorization");
  const isAuthenticated = authHeader && authHeader.startsWith("Bearer ");

  // Redirect unauthenticated users trying to access protected routes
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Redirect authenticated users away from public routes
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Config: Specify the routes this middleware applies to
export const config = {
  matcher: [
    "/dashboard/:path*", // Protect dashboard and sub-routes
    "/transactions/:path*", // Protect transactions and sub-routes
    "/account/:path*", // Protect account and sub-routes
    "/", // Protect the root route
    "/sign-in", // Public route
    "/sign-up", // Public route
  ],
};
