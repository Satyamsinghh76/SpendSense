import React, { useState, useRef, useEffect } from "react";
import { Loader, Send, Trash2 } from "lucide-react";
import { useBudgetsList, useCategoriesList, useTransactionsList } from "@/lib/data-hooks";
import { buildFinancialContextText } from "@/lib/ai-financial-context";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const currentPeriod = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}`;

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
  const transactions = useTransactionsList({ limit: 100 });
  const budgets = useBudgetsList({ period: currentPeriod });
  const categories = useCategoriesList();

  const quickQuestions = [
    "Where am I overspending?",
    "Show my biggest expenses",
    "Give savings advice",
  ];

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderFormattedContent = (content: string) => {
    const highlightNumbers = (line: string) =>
      line.split(/(\$?\d+(?:,\d{3})*(?:\.\d+)?%?)/g).map((part, idx) => {
        if (!part) return null;
        if (/^\$?\d+(?:,\d{3})*(?:\.\d+)?%?$/.test(part)) {
          return (
            <span key={idx} className="font-semibold text-emerald-600">
              {part}
            </span>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      });

    return content.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      const isHeading = /^#{1,3}\s/.test(trimmed) || /^\*\*.*\*\*:?$/.test(trimmed);
      const isBullet = /^[-*]\s/.test(trimmed);
      const cleanLine = trimmed
        .replace(/^#{1,3}\s/, "")
        .replace(/^[-*]\s/, "")
        .replace(/^\*\*(.*)\*\*:?$/, "$1");

      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p
          key={idx}
          className={`text-sm whitespace-pre-wrap break-words ${
            isHeading ? "font-semibold text-slate-900" : "text-slate-800"
          }`}
        >
          {isBullet ? "• " : ""}
          {highlightNumbers(cleanLine)}
        </p>
      );
    });
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageText,
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

      const financialContext = buildFinancialContextText(
        (transactions || []) as any,
        (budgets || []) as any,
        (categories || []) as any
      );

      const response = await fetch(`${httpBaseUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.map((msg) => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content,
          })),
          financialContext,
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handleQuickQuestion = async (question: string) => {
    setInput(question);
    await sendMessage(question);
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
      <div className="flex-1 overflow-y-auto min-h-0">
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
                <div className="space-y-1">
                  {message.type === "ai" ? renderFormattedContent(message.content) : (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  )}
                </div>
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
          <div className="flex flex-wrap gap-2 mb-3">
            {quickQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => handleQuickQuestion(question)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {question}
              </button>
            ))}
          </div>

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
