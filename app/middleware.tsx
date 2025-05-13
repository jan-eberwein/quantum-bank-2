import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/settings/:path*"],
};

export async function middleware(req: NextRequest) {
  const publicPaths = ["/sign-in", "/sign-up"];
  if (publicPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const session = req.cookies.get("a_session_" + process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}
