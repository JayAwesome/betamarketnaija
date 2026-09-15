import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Send, MessageSquareText, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { plantingAdvice } from "@/lib/ai-advisor.functions";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { logAiInteraction } from "@/lib/ai-history";
import type { City, Crop } from "@/lib/market-data";

interface Msg { role: "user" | "assistant"; content: string }

export function ExtensionOfficerChat({ crop, city }: { crop: Crop; city: City }) {
  const { t, lang } = useT();
  const { user } = useAuth();
  const ask = useServerFn(plantingAdvice);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await ask({
        data: { question: text, crop, city, lang, history: next.slice(-7, -1) },
      });
      setMessages((m) => [...m, { role: "assistant", content: res.content }]);
      void logAiInteraction({
        userId: user?.id,
        feature: "planting_assistant",
        crop,
        city,
        lang,
        question: text,
        answer: res.content,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("ai.error");
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">{t("ai.officer.title")}</CardTitle>
          <Button asChild size="sm" variant="outline" className="ml-auto">
            <Link to="/crop-doctor">
              <Stethoscope className="mr-1 h-4 w-4" /> {t("nav.doctor")}
            </Link>
          </Button>
        </div>
        <CardDescription>{t("ai.officer.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div ref={scrollRef} className="max-h-72 space-y-3 overflow-y-auto pr-1 text-sm">
          {messages.length === 0 && !loading && (
            <p className="whitespace-pre-wrap text-muted-foreground">{t("ai.officer.empty")}</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 leading-relaxed ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && <p className="animate-pulse text-muted-foreground">{t("chat.thinking")}</p>}
        </div>
        <form className="flex gap-2" onSubmit={send}>
          <Input
            ref={inputRef}
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
  );
}
