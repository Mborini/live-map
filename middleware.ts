import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET, // ✅ مهم
  });
console.log("TOKEN:", token);
console.log("PATH:", req.nextUrl.pathname);
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isAuth = !!token;

  // ❌ غير مسجل
  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ❌ مسجل وحاول يدخل login
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