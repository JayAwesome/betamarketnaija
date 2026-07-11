import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { askAssistant } from "@/lib/ai-chat.functions";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Assistant — AgriSense AI" },
      { name: "description", content: "Ask the AgriSense AI assistant where to sell your crops for the best price." },
      { property: "og:title", content: "AI Assistant — AgriSense AI" },
      { property: "og:description", content: "Chat with an AI grounded in Nigerian market data to decide where and when to sell your crops." },
      { property: "og:url", content: "https://betamarketnaija.lovable.app/chat" },
      { name: "twitter:title", content: "AI Assistant — AgriSense AI" },
      { name: "twitter:description", content: "Chat with an AI grounded in Nigerian market data to decide where and when to sell your crops." },
    ],
    links: [{ rel: "canonical", href: "https://betamarketnaija.lovable.app/chat" }],
  }),
  component: ChatPage,
});

interface Msg { role: "user" | "assistant"; content: string }

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm AgriSense AI. Ask me things like:\n• Where should I sell maize this week?\n• Which city has the highest price for tomatoes?\n• Should I hold my yam or sell now?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askAssistant);
  const scrollRef = useRef<HTMLDivElement>(null);
  useRouter();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await ask({ data: { messages: next } });
      setMessages((m) => [...m, { role: "assistant", content: res.content }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-4xl flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Answers use the same live dataset as the Dashboard and Analytics pages.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> AgriSense Assistant
          </CardTitle>
          <CardDescription>Grounded in this week's market data</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden p-0">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-earth/10 text-earth">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
                  Thinking…
                </div>
              </div>
            )}
          </div>
          <form
            className="flex gap-2 border-t p-3"
            onSubmit={(e) => { e.preventDefault(); send(); }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Where should I sell maize this week?"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
