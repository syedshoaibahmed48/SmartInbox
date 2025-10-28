import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getSidFromToken } from "./lib/authUtil";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {

    const token = req.cookies.get("token")?.value;

    function isPublicRoute(path: string) {
        if (["/", "/api/auth/sso", "/api/auth/token"].includes(path)) return true; // Static public routes
        else if (req.nextUrl.pathname.endsWith("/callback")) return true; // Dynamic callback routes
        return false;
    }

    function isApiRoute(path: string) {
        return path.startsWith("/api/");
    }

    function handleUnauthorizedAccess(path: string) {
        if (isApiRoute(path)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Allow public routes
    if (isPublicRoute(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    // For protected routes 
    // Check 1: Token exists
    if (!token) {
        return handleUnauthorizedAccess(req.nextUrl.pathname);
    }

    // Check 2: Token is valid
    try {
        await jwtVerify(token, SECRET_KEY);
    } catch {
        return handleUnauthorizedAccess(req.nextUrl.pathname);
    }

    // If checks pass, allow the request
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/mails",
        "/api/mails",
        "/api/auth/:path*",  // covers auth routes, still filtered above
        "/auth/:path*",      // covers dynamic callback routes
    ],
};
