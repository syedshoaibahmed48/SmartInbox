"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Toaster, toast } from 'sonner'

export default function SmartInboxSplitLanding() {
  // State for email input
  const [email, setEmail] = useState("");

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  // Handler for continue button or enter key
  const handleContinue = async () => {
    if (!isEmailValid) return;
    // Call the SSO API
    try {
      const res = await fetch("/api/auth/sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        toast.error(data.error);
      } else {
        toast.error("Failed to initiate sign-in. Please try again.");
      }
    } catch (err) {
      console.error("Error during SSO:", err);
      toast.error("Failed to initiate sign-in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Toaster position="top-right"/>
      {/* Left Side - Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-neutral-800 to-neutral-600 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-semibold text-neutral-900">SmartInbox</span>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h1 className="text-5xl font-semibold text-neutral-900 leading-tight">
              AI email assistant,
              <br />
              <span className="bg-gradient-to-r from-neutral-600 to-neutral-800 bg-clip-text text-transparent">
                without compromise
              </span>
            </h1>
            <p className="text-neutral-600 text-xl leading-relaxed">
              AI-powered assistant that helps you read, understand, and act on your emails — all in one inbox.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-neutral-700">🔍 Ask questions about any email using built-in AI chat</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neutral-700">🌍 Translate emails instantly into your preferred language</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neutral-700">🎧 Listen to your emails with text-to-speech</span>
            </div>
          </div>
          <div className="pt-8 text-sm text-neutral-500">
            <p>Built for privacy. LLM Runs locally. No emails stored.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 bg-white flex items-center justify-center p-12 border-l border-neutral-200">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-semibold text-neutral-900">Get Started</h2>
            <p className="text-neutral-600">Enter your email address to continue</p>
          </div>

          <div className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && isEmailValid) handleContinue();
              }}
              placeholder="your@company.com"
              className="h-16 border-2 border-neutral-200 text-neutral-900 placeholder:text-neutral-500 text-lg text-center rounded-2xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all duration-200"
            />
            <Button
              className={`w-full h-16 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-lg rounded-2xl transition-all duration-200 hover:scale-[1.02]${!isEmailValid ? ' opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleContinue}
              disabled={!isEmailValid}
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-neutral-500 mt-2">
              You’ll be redirected to sign in securely with your Google or Microsoft account.
            </p>
          </div>

          <div className="text-center pt-4">
            <a href="mailto:syedshoaibahmed48@gmail.com" className="text-sm text-neutral-600 hover:underline">
              Having trouble? Contact support →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
