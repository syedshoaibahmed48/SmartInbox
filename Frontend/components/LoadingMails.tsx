import { Mail } from "lucide-react";

export default function LoadingMails() {
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