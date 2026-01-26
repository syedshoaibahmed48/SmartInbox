import { apiClient } from "@/lib/apiClient";
import { getSidFromToken } from "@/lib/authUtil";
import { ApiClientError } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const sid = getSidFromToken(request.cookies.get("token")?.value || "");
        if (!sid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { AIChatMessages } = await request.json();
        if (!AIChatMessages || !Array.isArray(AIChatMessages)) {
            return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
        }

        const res = await apiClient("/chat", {method: "POST", body: JSON.stringify({ AIChatMessages }), headers: { "X-Session-ID": sid }}, false);

        return NextResponse.json(res);
    } catch (error: unknown) {
        const err = error as ApiClientError;
        return NextResponse.json(
            {
                message: err.message,
                detail: "Unexpected error while chatting with llm"
            },
            { status: err.status || 500 }
        );
    }
}