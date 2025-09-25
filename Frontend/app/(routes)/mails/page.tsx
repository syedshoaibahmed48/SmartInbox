"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
    Mail,
    Search,
    Filter,
    MessageSquare,
    Send,
    ChevronRight,
    ChevronLeft,
    PanelRightClose
} from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
// Removed ResizablePanel imports
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import demoEmails from "@/public/sample-mails.json"
import { Email } from "@/lib/types"
import EmailCard from "@/components/EmailCard"



export default function MailsPage() {
    const [aiPanelOpen, setAiPanelOpen] = useState(true)
    const [emailsPerPage, setEmailsPerPage] = useState("25")
    const [emails, setEmails] = useState<Email[]>([])

    useEffect(() => {
        setEmails(demoEmails as Email[])
    }, [])

    // Mock current user data
    const currentUser = {
        name: "Alex Johnson",
        email: "alex.johnson@company.com",
    }


    const displayedEmails = emails.slice(0, Number.parseInt(emailsPerPage))


    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200" role="banner">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo Section */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                <Mail className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">SmartInbox</h1>
                            </div>
                        </div>

                        {/* Search and Controls */}
                        <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl mx-8">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search emails..."
                                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="border-gray-200 bg-transparent">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>

                                <Select value={emailsPerPage} onValueChange={setEmailsPerPage}>
                                    <SelectTrigger className="w-20 border-gray-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant={aiPanelOpen ? "default" : "outline"}
                                size="sm"
                                onClick={() => setAiPanelOpen(!aiPanelOpen)}
                                className={aiPanelOpen ? "bg-gray-900 hover:bg-gray-800 text-white" : "border-gray-200"}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                AI Assistant
                                {aiPanelOpen ? <ChevronRight className="w-3 h-3 ml-2" /> : <ChevronLeft className="w-3 h-3 ml-2" />}
                            </Button>

                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200">
                                        <span className="text-sm font-medium text-gray-700">
                                            {currentUser.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()}
                                        </span>
                                    </Button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-64" align="end">
                                    <div className="space-y-2">
                                        <p className="font-medium text-gray-900">{currentUser.name}</p>
                                        <p className="text-sm text-gray-600">{currentUser.email}</p>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex">
                {/* Email List Panel */}
                <div className="h-full w-full flex flex-col bg-white">
                    <div className="flex-1 overflow-auto p-4">
                        <div className="space-y-2">
                            {displayedEmails.map((email) => (
                                <EmailCard key={email.id} email={email} />
                            ))}
                        </div>
                    </div>
                </div>
                {/* AI Sidebar */}
                {aiPanelOpen && (
                  <aside className="h-full bg-gray-50 flex flex-col border-l border-gray-200" style={{ width: aiPanelOpen ? '35%' : '0%' }}>
                      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
                          <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
                                  <MessageSquare className="w-3 h-3 text-white" />
                              </div>
                              <h2 className="font-medium text-gray-900">AI Assistant</h2>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setAiPanelOpen(false)} className="h-8 w-8 p-0 hover:bg-gray-100">
                              <PanelRightClose className="w-4 h-4" />
                          </Button>
                      </div>
                      {/* Scrollable Chat Messages */}
                      <div className="flex-1 overflow-auto p-4">
                          <div className="space-y-4">
                              <Card className="bg-white border-gray-200">
                                  <CardContent className="p-3">
                                      <p className="text-sm text-gray-700">
                                          Hi! I'm your AI assistant. I can help you summarize emails, answer questions about your
                                          mailbox, or help you draft replies.
                                      </p>
                                  </CardContent>
                              </Card>
                              <Card className="bg-gray-100 border-gray-200 ml-8">
                                  <CardContent className="p-3">
                                      <p className="text-sm text-gray-700">Can you summarize my unread emails?</p>
                                  </CardContent>
                              </Card>
                              <Card className="bg-white border-gray-200">
                                  <CardContent className="p-3">
                                      <p className="text-sm text-gray-700">
                                          You have several emails in the current view. The most recent include updates on Q4 planning,
                                          campaign performance reports, and collaboration opportunities. Would you like me to provide
                                          more details about any specific emails?
                                      </p>
                                  </CardContent>
                              </Card>
                              <Card className="bg-gray-100 border-gray-200 ml-8">
                                  <CardContent className="p-3">
                                      <p className="text-sm text-gray-700">What are the most important emails I should focus on?</p>
                                  </CardContent>
                              </Card>
                              <Card className="bg-white border-gray-200">
                                  <CardContent className="p-3">
                                      <p className="text-sm text-gray-700">
                                          Based on your emails, I'd recommend focusing on: 1) John Doe's Q4 planning initiative which
                                          requires a meeting, 2) The marketing campaign performance report with strong results, and 3)
                                          David Chen's contract review questions that need your response.
                                      </p>
                                  </CardContent>
                              </Card>
                              <Card className="bg-gray-100 border-gray-200 ml-8">
                                  <CardContent className="p-3">
                                      <p className="text-sm text-gray-700">Can you help me draft a reply to John Doe's email?</p>
                                  </CardContent>
                              </Card>
                              <Card className="bg-white border-gray-200">
                                  <CardContent className="p-3">
                                      <p className="text-sm text-gray-700">
                                          I'd be happy to help you draft a reply to John Doe's Q4 planning email. Here's a suggested
                                          response: "Hi John, Thanks for the update on the Q4 planning initiative. The progress sounds
                                          very promising. I'm available for a meeting next week to discuss the next steps. Please let me
                                          know what times work best for you."
                                      </p>
                                  </CardContent>
                              </Card>
                          </div>
                      </div>
                      {/* Fixed Chat Input */}
                      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                          <div className="flex gap-2">
                              <Input placeholder="Ask about your emails..." className="flex-1 border-gray-200" />
                              <Button size="sm" className="bg-gray-900 hover:bg-gray-800">
                                  <Send className="w-4 h-4" />
                              </Button>
                          </div>
                      </div>
                  </aside>
                )}
            </div>
        </div>
    )
}
