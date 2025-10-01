"use client"

import { useState, useEffect, use } from "react"
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
    PanelRightClose,
    Loader2,
    AlertCircle,
    WifiOff,
    RefreshCw
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import sampleChat from "@/public/sample-chat.json"
import { CurrentUser, Email } from "@/lib/types"
import EmailCard from "@/components/EmailCard"
import CurrentUserBadge from "@/components/CurrentUserBadge"



export default function MailsPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<boolean>(false)
    const [aiPanelOpen, setAiPanelOpen] = useState(true)
    const [maxEmails, setMaxEmails] = useState("25")
    const [user, setUser] = useState<CurrentUser>({ name: "", email: "" })
    const [emails, setEmails] = useState<Email[]>([])

    const displayedEmails = emails.slice(0, Number.parseInt(maxEmails))

    async function fetchEmailsAndUserData() {
        setLoading(true)
        try {
            const res = await fetch(`/api/mails?maxEmails=${maxEmails}`);
            const { user, mails } = await res.json();
            setUser(user);
            setEmails(mails);
            setLoading(false)
        } catch (err) {
            setError(true)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmailsAndUserData();
    }, [])

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-6 animate-fade-in">
                    <div className="relative">
                        <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                            <Mail className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-semibold text-gray-900">Fetching your emails</h2>
                        <p className="text-gray-600">Please wait while we load your inbox...</p>
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-6 animate-fade-in">
                    <div className="relative">
                        <div className="w-20 h-20 bg-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-shake">
                            <AlertCircle className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-semibold text-gray-900">Something went wrong</h2>
                        <p className="text-gray-600">
                            Please try again. If the issue persists, contact the developer.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                // Clear cookies
                                window.location.href = "/"
                            }}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }



    // Main Content
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
                                <Button variant="outline" size="sm" className="border-gray-200">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>

                                <Select value={maxEmails} onValueChange={setMaxEmails}>
                                    <SelectTrigger className="w-20 border-gray-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-gray-200 bg-white">
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

                            <CurrentUserBadge user={user} />
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
                                {sampleChat.map((msg, idx) => (
                                    <Card
                                        key={idx}
                                        className={
                                            msg.role === 'assistant'
                                                ? 'bg-white border-gray-200'
                                                : 'bg-gray-100 border-gray-200 ml-8'
                                        }
                                    >
                                        <CardContent className="p-3">
                                            <p className="text-sm text-gray-700">{msg.content}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                        {/* Fixed Chat Input */}
                        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                            <div className="flex gap-2 items-center">
                                <Input placeholder="Ask about your emails..." className="flex-1 border-gray-200" />
                                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
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
