import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const urlAuth = ["/sign-in", "/sign-up"];
  const isSkipAuthPage = urlAuth.includes(request.nextUrl.pathname);

  if (!accessToken && !isSkipAuthPage) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (accessToken && isSkipAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
