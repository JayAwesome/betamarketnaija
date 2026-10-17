import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { plantingAdvice } from "@/lib/ai-advisor.functions";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { logAiInteraction } from "@/lib/ai-history";
import type { City, Crop } from "@/lib/market-data";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Assistant — AgriSense AI" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const { t, lang } = useT();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: t("chat.greeting") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState<City>("Abuja");
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const ask = useServerFn(plantingAdvice);
  const scrollRef = useRef<HTMLDivElement>(null);
  useRouter();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("city, primary_crop")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.city) setCity(data.city as City);
        if (data?.primary_crop) setCrop(data.primary_crop as Crop);
      });
  }, [user]);

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
      const res = await ask({
        data: {
          question: text,
          crop,
          city,
          lang,
          history: next.slice(-7, -1),
        },
      });
      setMessages((m) => [...m, { role: "assistant", content: res.content }]);
      void logAiInteraction({
        userId: user?.id,
        feature: "planting_assistant",
        crop: crop ?? null,
        city,
        lang,
        question: text,
        answer: res.content,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("chat.errorFallback");
      toast.error(msg);
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-4xl flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("page.chat.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("page.chat.subtitle")}
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> {t("chat.assistant")}
          </CardTitle>
          <CardDescription>{t("chat.grounded")}</CardDescription>
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
                  {t("chat.thinking")}
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
              placeholder={t("chat.placeholder")}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()} aria-label={t("chat.send")}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

