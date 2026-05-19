import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("caltracker_session")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isPrivatePage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/meals") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/profile");

  if (!token && isPrivatePage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/meals/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
