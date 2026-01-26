import { apiClient } from "@/lib/apiClient";
import { getSidFromToken } from "@/lib/authUtil";
import { ApiClientError } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    let id = 'unknown';
    try {
            const awaitedParams = await params;
            id = awaitedParams.id;
            const sid = getSidFromToken(request.cookies.get("token")?.value || "");
            if (!sid) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            // Fetch the specific mail thread by ID
            const res = await apiClient(`/mails/${id}`, { method: "GET", headers: { "X-Session-ID": sid } }, false);
            return NextResponse.json({ emailThread: res.email_thread });
        } catch (error: unknown) {
            const err = error as ApiClientError;
            return NextResponse.json(
                {
                    message: err.message,
                    detail: `Unexpected error while fetching mail with id: ${id}`,
                },
                { status: err.status || 500 }
            );
        }
}
