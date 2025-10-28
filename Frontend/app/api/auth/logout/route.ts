import { apiClient } from '@/lib/apiClient';
import { ApiClientError } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const res = await apiClient(`/auth/logout`, { method: "POST" }, false)

        const response = NextResponse.json({ message: 'Logged out' });

        response.cookies.set("token", '', {
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/"
        })

        return response;
    } catch (error: unknown) {
        const err = error as ApiClientError;
        return NextResponse.json(
            {
                message: err.message,
                detail: "Unexpected error while logging out"
            },
            { status: err.status || 500 }
        );
    }
}

export const dynamic = 'force-dynamic'
