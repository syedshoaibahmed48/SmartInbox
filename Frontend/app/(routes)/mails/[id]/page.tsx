"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Mail,
  ArrowLeft,
  Paperclip,
  MessageSquare,
  Send,
  PanelRightClose,
} from "lucide-react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import SomethingWentWrong from "@/components/SomethingWentWrong"
import SessionExpired from "@/components/SessionExpiredError"
import LoadingMails from "@/components/LoadingMail"
import { apiClient } from "@/lib/apiClient"
import { Email } from "@/lib/types"
import AIMailAssistant from "@/components/AIMailAssistantPanel"

export default function MailThreadPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id
  const [aiPanelOpen, setAiPanelOpen] = useState(true)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [sessionExpired, setSessionExpired] = useState<boolean>(false)
  const [emailThread, setEmailThread] = useState<Email[]>([])

  async function fetchEmailThread() {
    try {
      const res = await apiClient(`/api/mails/${id}`, { method: "GET" }, true);
      setEmailThread(res.emailThread);
      setLoading(false)
    } catch (err: any) {
      if (err.status === 440) setSessionExpired(true);
      else setError(true)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmailThread();
  }, [id])

  // Loading State
  if (loading) return <LoadingMails />

  // Error State
  if (error) return <SomethingWentWrong />

  // Session Expired State
  if (sessionExpired) return <SessionExpired />

  // Main Content
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/mails")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">SmartInbox</span>
              </div>
            </div>

            <Button
              variant={aiPanelOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className={aiPanelOpen ? "bg-gray-900 text-white" : "border-gray-200"}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Email Thread Panel */}
          <ResizablePanel defaultSize={aiPanelOpen ? 50 : 100} minSize={40}>
            <div className="h-full overflow-auto p-6">
              <div className="max-w-3xl mx-auto">
                {/* Subject Header */}
                <div className="mb-4">
                  <h1 className="text-xl font-semibold text-gray-900">{emailThread[0]?.subject}</h1>
                </div>

                {/* Thread Messages */}
                <Card className="border-gray-200">
                  <div className="divide-y divide-gray-100">
                    {emailThread.map((message) => (
                      <div key={message.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{message.sender.name}</span>
                            <span className="text-sm text-gray-500">&lt;{message.sender.email}&gt;</span>
                          </div>
                          <span className="text-sm text-gray-400">{message.time}, {message.date}</span>
                        </div>

                        <div className="text-sm text-gray-500 mb-3">to {message.to}</div>

                        <div className="font-medium text-gray-900 mb-3">{message.subject}</div>

                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{message.body}</p>

                        {/*Todo: Display message attachment*/}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </ResizablePanel>

          {/* Resizable Handle */}
          {aiPanelOpen && <ResizableHandle withHandle />}

          {/* AI Assistant Panel */}
          {aiPanelOpen && (
            <ResizablePanel defaultSize={50} minSize={30} maxSize={60}>
              <AIMailAssistant aiPanelOpen={aiPanelOpen} setAiPanelOpen={setAiPanelOpen} />
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  )
}