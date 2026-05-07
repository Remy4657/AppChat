import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/signin", "/signup"];
const protectedRoutes = ["/"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Kiểm tra có phải public route không
  const isPublic = publicRoutes.includes(pathname);

  if (isPublic && refreshToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Route cần bảo vệ
  const isProtected = protectedRoutes.includes(pathname);
  if (isProtected && !refreshToken) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
