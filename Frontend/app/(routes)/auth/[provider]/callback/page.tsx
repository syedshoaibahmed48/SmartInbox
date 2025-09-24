"use client"

import { use, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react"

type AuthState = "loading" | "success" | "error"

export default function AuthCallbackPage({ params }: { params: Promise<{ provider: string }> }) {
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const searchParams = useSearchParams()
  const { provider } = use(params)

  const exchangeCodeForToken = async (code: string, provider: string) => {
    try {
      const response = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, provider })
      })
      if (response.ok) {
        setAuthState("success")
        // TODO: Redirect to /mails after a short delay
      } else {
        throw new Error("Token exchange failed")
      }
    } catch (error) {
      setAuthState("error")
      setErrorMessage("Something went wrong during login. Please try again.")
    }
  }

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")
  
    // If there's an error parameter, show error immediately
    if (error) {
      setAuthState("error")
      setErrorMessage("Something went wrong during login. Please try again.")
      return
    }

    // If there's no code, show error
    if (!code) {
      setAuthState("error")
      setErrorMessage("No authorization code received. Please try again.")
      return
    }

    exchangeCodeForToken(code, provider)

  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-neutral-800 to-neutral-600 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-semibold text-neutral-900">SmartInbox</span>
        </div>

        {/* Loading State */}
        {authState === "loading" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-neutral-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-neutral-900">Completing sign in...</h1>
              <p className="text-neutral-600">Please wait while we verify your account.</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {authState === "success" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-neutral-900">Authentication successful!</h1>
              <p className="text-neutral-600">Redirecting you to your inbox...</p>
            </div>
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {authState === "error" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-neutral-900">Authentication failed</h1>
                <p className="text-neutral-600">{errorMessage}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">
                  If this problem persists, please{" "}
                  <a href="mailto:abc@xyz.com" className="underline hover:no-underline font-medium">
                    contact support
                  </a>
                  .
                </p>
              </div>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
