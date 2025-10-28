import { Email } from "@/lib/types";
import { Card, CardContent } from "./ui/card";
import { Calendar, Paperclip } from "lucide-react";

export default function EmailCard({ email }: { email: Email }) {
    return (
      <Card
        key={email.id}
        className="group cursor-pointer transition-all duration-200 hover:shadow-2xl hover:scale-y-105 border border-gray-200 hover:border-gray-300"
      >
        <CardContent className="px-4">
          <div className="space-y-1">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate">{email.sender.name}</h3>
                <span className="text-sm text-gray-500 truncate">{email.sender.email}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-400">{email.date}</span>
              </div>
            </div>
            {/* Subject */}
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium text-gray-900 truncate flex-1">{email.subject}</h4>
            </div>
            {/* Body Preview */}
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{email.bodyPreview}</p>
          </div>
        </CardContent>
      </Card>
    )
  }