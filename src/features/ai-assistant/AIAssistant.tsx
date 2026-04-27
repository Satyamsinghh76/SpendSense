import React, { useState, useRef, useEffect } from "react";
import { Loader, Send, Trash2 } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hello! I'm your AI Finance Assistant. Ask me anything about your spending, budgets, or financial advice. 💰",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Call backend API via Convex deployment URL
      const convexUrl = import.meta.env.VITE_CONVEX_URL;
      if (!convexUrl) {
        throw new Error("VITE_CONVEX_URL environment variable not set");
      }

      // Convex HTTP actions are served on convex.site, while client APIs use convex.cloud.
      const httpBaseUrl = convexUrl.replace(".convex.cloud", ".convex.site");

      const response = await fetch(`${httpBaseUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.map((msg) => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.response || "Unable to generate response. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Clear chat history?")) {
      setMessages([
        {
          id: "1",
          type: "ai",
          content: "Hello! I'm your AI Finance Assistant. Ask me anything about your spending, budgets, or financial advice. 💰",
          timestamp: new Date(),
        },
      ]);
      setError(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                🤖 AI Finance Assistant
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Get instant insights about your spending and finances
              </p>
            </div>
            <button
              onClick={handleClearChat}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                  message.type === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    message.type === "user"
                      ? "text-blue-100"
                      : "text-slate-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-lg rounded-bl-none shadow-sm px-4 py-3 flex items-center gap-2">
                <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                <p className="text-sm text-slate-600">AI is thinking...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex justify-start">
              <div className="bg-red-50 border border-red-200 rounded-lg rounded-bl-none px-4 py-3">
                <p className="text-sm text-red-700">
                  <span className="font-semibold">Error:</span> {error}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your budget, spending, or get financial advice..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-2">
            💡 Tip: Ask about your spending patterns, budget recommendations, or financial analysis
          </p>
        </div>
      </div>
    </div>
  );
}
