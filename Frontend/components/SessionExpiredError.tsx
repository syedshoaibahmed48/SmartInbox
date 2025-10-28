import Link from "next/link"
import { Clock } from "lucide-react"

export default function SessionExpired() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center space-y-6 animate-fade-in">
                <div className="relative">
                    <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Clock className="w-10 h-10 text-white" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-2xl font-semibold text-gray-900">Session Expired</h2>
                    <p className="text-gray-600">Your session expired due to inactivity.</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => {
                            window.location.href = "/"
                        }}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                        Go to Homepage & Login
                    </button>
                </div>
            </div>
        </div>
    )
}
