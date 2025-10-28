"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
    Mail,
    Search,
    MessageSquare,
    Send,
    ChevronRight,
    ChevronLeft,
    PanelRightClose,
    AlertCircle
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import sampleChat from "@/public/sample-chat.json"
import { CurrentUser, Email } from "@/lib/types"
import EmailCard from "@/components/EmailCard"
import CurrentUserBadge from "@/components/CurrentUserBadge"
import { apiClient } from "@/lib/apiClient"
import SomethingWentWrong from "@/components/SomethingWentWrong"
import LoadingMails from "@/components/LoadingMails"
import SessionExpired from "@/components/SessionExpiredError"


export default function MailsPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<boolean>(false)
    const [sessionExpired, setSessionExpired] = useState<boolean>(false)
    const [aiPanelOpen, setAiPanelOpen] = useState(true)
    const [count, setCount] = useState("25")
    const [filterString, setFilterString] = useState("")
    const [filter, setFilter] = useState("")
    const [user, setUser] = useState<CurrentUser>({ name: "", email: "" })
    const [emails, setEmails] = useState<Email[]>([])

    async function fetchEmailsAndUserData() {
        setLoading(true);
        try {
            const res = await apiClient(`/api/mails?count=${count}&filter=${filter}`, { method: "GET" }, true);
            const { user, mails } = res;
            setUser(user);
            setEmails(mails);
            setLoading(false)
        } catch (err: any) {
            if (err.status === 440) setSessionExpired(true);
            else setError(true)
            setLoading(false) 
        }
    }

    useEffect(() => {
        fetchEmailsAndUserData();
    }, [filter, count])

    // Loading State
    if (loading) return <LoadingMails />

    // Error State
    if (error) return <SomethingWentWrong />

    // Session Expired State
    if (sessionExpired) return <SessionExpired />

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
                                    type="text"
                                    placeholder="Search emails..."
                                    className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white"
                                    value={filterString}
                                    onChange={(e) => setFilterString(e.target.value)}
                                    onKeyDown={(e) => {
                                        if ((e as React.KeyboardEvent<HTMLInputElement>).key === 'Enter') setFilter(filterString);
                                    }}
                                />

                                {filter.length > 0 && (
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setFilter("");
                                                setFilterString("");
                                            }}
                                            className="text-sm text-red-600"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">

                                <Select value={count} onValueChange={(value) => { setCount(value) }}>
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

                            {user && <CurrentUserBadge user={user} />}
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
                            {emails && emails.map((email) => (
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
