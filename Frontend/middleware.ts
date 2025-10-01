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

    // Allow public routes
    if (isPublicRoute(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    // For protected routes 
    // Check 1: Token exists
    if (!token) {
        if (isApiRoute(req.nextUrl.pathname)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Check 2: Token is valid
    try {
        console.log("Verifying token...");
        await jwtVerify(token, SECRET_KEY);
    } catch {
        if (isApiRoute(req.nextUrl.pathname)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/", req.url));
    }

    // If checks pass, allow the request
    if (isApiRoute(req.nextUrl.pathname)) {
        const sid = getSidFromToken(token);
        const res = NextResponse.next();
        res.headers.set("x-sid", sid || "");
        return res;
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/mails",
        "/api/mails",
        "/api/auth/:path*",  // covers auth routes, still filtered above
        "/auth/:path*",      // covers dynamic callback routes
    ],
};
