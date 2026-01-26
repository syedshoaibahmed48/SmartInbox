import { MessageSquare, PanelRightClose, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { AIChatMessage } from "@/lib/types";
import { apiClient } from "@/lib/apiClient";

export default function AIMailAssistant({ aiPanelOpen, setAiPanelOpen }: { aiPanelOpen: boolean; setAiPanelOpen: (open: boolean) => void }) {
  const [AIChatMessages, setAIChatMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setAIChatMessages(prev => [...prev, { role, content }]);
  };

  const handleSendMessage = async (newMessage: string) => {
    if (newMessage.trim()) {
      try{
        addMessage('user', newMessage.trim());
        setInput('');
        setLoading(true);
        const res = await apiClient(`/api/chat`, { method: "POST", body: JSON.stringify({ AIChatMessages: AIChatMessages.concat([{ role: 'user', content: newMessage.trim() }]) }) }, true);
        addMessage('assistant', res.llm_response);
        setLoading(false);
      }
      catch(err){
        console.error(err);
      }
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col border-l border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-white" />
          </div>
          <h2 className="font-medium text-gray-900">AI Assistant</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAiPanelOpen(false)}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <PanelRightClose className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {AIChatMessages.length === 0 ? (
            <>
              <Card className="bg-white border-gray-200">
                <CardContent className="p-3">
                  <p className="text-sm text-gray-700">
                    Hi! I can help you understand this email thread, summarize the conversation, or answer questions. What would you like to know?
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-200 text-gray-700 bg-transparent"
                  onClick={() => handleSendMessage('Summarize')}
                >
                  Summarize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-200 text-gray-700 bg-transparent"
                  onClick={() => handleSendMessage('Draft reply')}
                >
                  Draft reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-200 text-gray-700 bg-transparent"
                  onClick={() => handleSendMessage('Extract key points')}
                >
                  Extract key points
                </Button>
              </div>
            </>
          ) : (
            <>
              {AIChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <Card className={`max-w-xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white border-gray-200'}`}>
                    <CardContent className="px-3 py-1">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <Card className="bg-white border-gray-200">
                    <CardContent className="px-3 py-1">
                      <p className="text-sm text-gray-500">AI is thinking...</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about this email..."
            className="flex-1 border-gray-200"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
          />
          <Button size="sm" className="bg-gray-900 hover:bg-gray-700 text-white" onClick={() => handleSendMessage(input)}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}