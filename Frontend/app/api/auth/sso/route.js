import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { email } = await request.json()
    // Call backend API with email as query param and API key in Authorization header
    const backendRes = await fetch(`${process.env.API_URL}/auth/sso?email=${encodeURIComponent(email)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.API_KEY}`
      }
    })
    if (!backendRes.ok) {
      const err = await backendRes.json()
      console.log("SSO Error:", err)
      // if unauthorized, return 401
      if (backendRes.status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: backendRes.status })
    }
    const data = await backendRes.json()
    return NextResponse.json({ url: data.sso_url })
  } catch (e) {
    //console.error("SSO Exception:", e)
    return NextResponse.json({ error: "Internal Server Error, please try again later." }, { status: 500 })
  }
}