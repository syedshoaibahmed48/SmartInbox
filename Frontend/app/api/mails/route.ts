import { NextRequest, NextResponse } from "next/server";
import samplemails from "@/public/sample-mails.json"

export async function GET(request: NextRequest) {

    //extract mail filter, number of mails from query params
    console.log(request)

    // return sample user data for now
    const user = {
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
    }

    const mails = samplemails.slice(0, 5);

    return NextResponse.json({ user, mails });
}