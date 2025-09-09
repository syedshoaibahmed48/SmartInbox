import { apiClient } from "@/lib/apiClient";
import { ApiClientError } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { code, provider } = await request.json();
    if (!code || !provider) {
      return NextResponse.json({ error: "Code and provider are required" }, { status: 400 })
    }

    const res = await apiClient("/auth/exhange", { 
      method: "POST", 
      body: JSON.stringify({ code, provider }),
      headers: { "Content-Type": "application/json" }
    }, false)

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData.message || "Failed to exchange code for token" }, { status: res.status });
    }

    const sid = (await res.json()).sid;
    if (!sid) {
      return NextResponse.json({ error: "No session ID returned from auth service" }, { status: 500 });
    }

    // Create a JWT with the session ID
    const token = jwt.sign(
      { sub: provider, sid }, //sub is provider name only
      process.env.JWT_SECRET!
    );

    // Set the JWT as a cookie
    const response = NextResponse.json({ token }, { status: 200 });
    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
    });
    return response;

  } catch (error: unknown) {
    const err = error as ApiClientError;
    return NextResponse.json(
      {
        message: err.message,
        detail: "Unexpected error while resolving SSO URL"
      },
      { status: err.status || 500 }
    );
  }
}