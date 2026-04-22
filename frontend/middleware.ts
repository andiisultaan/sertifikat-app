import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPER_ADMIN_ONLY = ["/users"];
const ADMIN_AND_ABOVE = ["/siswa", "/ukk", "/sertifikat"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  // Halaman login — redirect ke dashboard jika sudah login
  if (pathname === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Belum punya token → ke login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Super admin only routes
  if (role && role !== "super_admin") {
    const blocked = SUPER_ADMIN_ONLY.some(p => pathname === p || pathname.startsWith(p + "/"));
    if (blocked) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Admin & above routes (penguji cannot access)
  if (role && role !== "super_admin" && role !== "admin") {
    const blocked = ADMIN_AND_ABOVE.some(p => pathname === p || pathname.startsWith(p + "/"));
    if (blocked) {
      return NextResponse.redirect(new URL("/nilai", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api|verify).*)"],
};
