import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";
import { getSidFromToken } from "@/lib/authUtil";
import { ApiClientError } from "@/lib/types";

export async function GET(request: NextRequest) {
    try {
        const sid = getSidFromToken(request.cookies.get("token")?.value || "");
        if (!sid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        //extract mail filter, number of mails from query params
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get("filter") || "";
        const count = parseInt(searchParams.get("count") || "10", 10);

        // send count and filter as query params to backend
        const query = new URLSearchParams({ filter, count: count.toString() }).toString();

        const res = await apiClient(`/mails?${query}`, { method: "GET", headers: { "X-Session-ID": sid } }, false);

        const { user_details, user_mails } = res;

        return NextResponse.json({ user: user_details, mails: user_mails });
    } catch (error: unknown) {
        const err = error as ApiClientError;
        return NextResponse.json(
            {
                message: err.message,
                detail: "Unexpected error while fetching mails and user data.",
            },
            { status: err.status || 500 }
        );
    }
}