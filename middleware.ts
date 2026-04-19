import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  const isLoginPage = req.nextUrl.pathname === "/login";
  const isAuth = !!token;

  // ❌ إذا مش مسجل دخول
  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ❌ إذا مسجل دخول ودخل login
  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};