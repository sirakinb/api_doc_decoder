"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "./CodeBlock";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  docsContent: string;
  apiName: string;
  openaiKey?: string;
}

export function ChatInterface({ docsContent, apiName, openaiKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          docsContent,
          apiName,
          conversationHistory: messages,
          openaiKey: openaiKey || localStorage.getItem("openai_api_key") || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border border-border rounded-2xl overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card-hover">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bot size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">API Assistant</h3>
          <p className="text-xs text-muted">
            Ask anything about the {apiName} API
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Bot size={32} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ready to help
            </h3>
            <p className="text-muted text-sm max-w-xs">
              Ask me anything about the API - endpoints, authentication, code
              examples, or best practices.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {[
                "How do I authenticate?",
                "Show me how to create a post",
                "What are the rate limits?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border hover:border-border-bright hover:bg-card-hover transition-colors text-muted hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                message.role === "user"
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary/10 text-secondary"
              }`}
            >
              {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-primary text-white"
                  : "bg-card-hover border border-border"
              }`}
            >
              {message.role === "user" ? (
                <p className="text-sm">{message.content}</p>
              ) : (
                <div className="text-sm prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const isInline = !match;
                        return isInline ? (
                          <code
                            className="px-1.5 py-0.5 rounded bg-code-bg text-primary font-mono text-xs"
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <CodeBlock
                            code={String(children).replace(/\n$/, "")}
                            language={match[1]}
                          />
                        );
                      },
                      p({ children }) {
                        return <p className="mb-2 last:mb-0">{children}</p>;
                      },
                      ul({ children }) {
                        return <ul className="list-disc pl-4 mb-2">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal pl-4 mb-2">{children}</ol>;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <Bot size={16} />
            </div>
            <div className="bg-card-hover border border-border rounded-2xl px-4 py-3">
              <Loader2 size={16} className="animate-spin text-muted" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-border bg-card"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the API..."
            className="flex-1 px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-foreground placeholder:text-muted transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
