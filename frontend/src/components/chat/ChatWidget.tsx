import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import apiClient from "@/api/client";
import authService from "@/api/auth";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

export function ChatWidget() {
  const role = authService.getRole();
  const isManager = role?.toLowerCase() === "manager";
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hi! I'm your AI Team Assistant. Ask me anything about your team's recent reports, blockers, or project progress."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // If not a manager, don't show the widget at all
  if (!isManager) {
    return null;
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Build history: all prior messages except the welcome greeting
      const history = updatedMessages
        .filter((m) => m.id !== "welcome")
        .slice(0, -1) // exclude the message we just added (sent as `message`)
        .map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));

      const response = await apiClient.post("/api/v1/chat/message", {
        message: userMessage.content,
        history,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response.data.response
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: err.response?.data?.detail || "Sorry, I encountered an error. Please make sure the AI API key is configured."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl transition-transform hover:scale-105"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] sm:w-[400px] flex-col overflow-hidden shadow-2xl transition-all animate-in slide-in-from-bottom-5 fade-in-20 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-blue-600 dark:bg-blue-800 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-base font-semibold">AI Team Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        msg.role === "user"
                          ? "bg-blue-600 dark:bg-blue-800 text-white"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <UserIcon className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 dark:bg-blue-800 text-white"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                      }`}
                    >
                      {msg.content.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i !== msg.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl bg-slate-100 dark:bg-zinc-800 px-4 py-3">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-zinc-400 [animation-delay:-0.3s]"></div>
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-zinc-400 [animation-delay:-0.15s]"></div>
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-zinc-400"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t p-3"
            >
              <Input
                placeholder="Ask about team reports..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
