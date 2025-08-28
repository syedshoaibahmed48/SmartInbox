import { apiClient } from "@/lib/apiClient";
import { ApiClientError } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email") || "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const res = await apiClient(`/auth/sso?email=${encodeURIComponent(email)}`, { method: "GET" }, false)

    return NextResponse.json({ ssoUrl: res.sso_url }, { status: 200 })

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