import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Stethoscope, Send, User as UserIcon, AlertCircle, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useServerFn } from "@tanstack/react-start";
import { diagnoseCrop } from "@/lib/ai-advisor.functions";
import { CROPS, CITIES, type Crop, type City } from "@/lib/market-data";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { logAiInteraction, fetchAiHistory, type AiInteraction } from "@/lib/ai-history";

export const Route = createFileRoute("/crop-doctor")({
  head: () => ({
    meta: [
      { title: "AI Crop Doctor — AgriSense AI" },
      { name: "description", content: "Describe your crop's symptoms and get an AI diagnosis of the likely disease or pest, with treatment advice for Nigerian farms." },
      { property: "og:title", content: "AI Crop Doctor — AgriSense AI" },
      { property: "og:description", content: "Describe your crop's symptoms and get an AI diagnosis with locally available treatment advice." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://betamarketnaija.lovable.app/crop-doctor" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI Crop Doctor — AgriSense AI" },
      { name: "twitter:description", content: "Describe your crop's symptoms and get an AI diagnosis with locally available treatment advice." },
    ],
    links: [{ rel: "canonical", href: "https://betamarketnaija.lovable.app/crop-doctor" }],
  }),
  component: CropDoctorPage,
});

const SYMPTOM_KEYS = [
  "sym.wilting", "sym.spots", "sym.yellowing", "sym.stunted", "sym.pests",
  "sym.rot", "sym.holes", "sym.mould",
] as const;

interface Msg { role: "user" | "assistant"; content: string; failed?: boolean }

function CropDoctorPage() {
  const { t, lang, tCrop } = useT();
  const { user } = useAuth();
  const run = useServerFn(diagnoseCrop);

  const [crop, setCrop] = useState<Crop>("Tomatoes");
  const [city, setCity] = useState<City>("Abuja");
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [history, setHistory] = useState<AiInteraction[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchAiHistory(user.id, "crop_doctor", 5).then(setHistory);
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function toggle(key: string) {
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    const symptoms = selected.map((k) => t(k));
    const description = text.trim();
    if (!symptoms.length && !description) return;

    const question = [
      `${tCrop(crop)} · ${city}`,
      symptoms.join(", "),
      description,
    ].filter(Boolean).join(" — ");

    setMessages((m) => [...m, { role: "user", content: question }]);
    setText("");
    setLoading(true);
    try {
      const res = await run({ data: { crop, city, symptoms, description, lang } });
      setMessages((m) => [...m, { role: "assistant", content: res.content }]);
      void logAiInteraction({
        userId: user?.id, feature: "crop_doctor", crop, city, lang,
        question, answer: res.content,
      });
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t("ai.error"), failed: true }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("page.doctor.title")}</h1>
        <p className="text-muted-foreground">{t("page.doctor.subtitle")}</p>
      </div>

      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="border-b py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4 text-primary" /> {t("doctor.officer")}
          </CardTitle>
          <CardDescription>{t("doctor.grounded")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">{t("label.crop")}</Label>
              <Select value={crop} onValueChange={(v) => setCrop(v as Crop)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CROPS.map((c) => <SelectItem key={c} value={c}>{tCrop(c)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("label.city")}</Label>
              <Select value={city} onValueChange={(v) => setCity(v as City)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">{t("doctor.symptoms")}</Label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggle(k)}
                  className="focus-visible:outline-none"
                  aria-pressed={selected.includes(k)}
                >
                  <Badge variant={selected.includes(k) ? "default" : "outline"} className="cursor-pointer">
                    {t(k)}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {messages.length > 0 && (
            <div ref={scrollRef} className="max-h-80 space-y-4 overflow-y-auto rounded-lg border p-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {m.failed ? <AlertCircle className="h-4 w-4 text-warning" /> : <Stethoscope className="h-4 w-4" />}
                    </div>
                  )}
                  <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
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
                    <Stethoscope className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
                    {t("doctor.thinking")}
                  </div>
                </div>
              )}
            </div>
          )}

          <form className="flex gap-2" onSubmit={submit}>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("doctor.placeholder")}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || (!text.trim() && !selected.length)} aria-label={t("doctor.ask")}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {user && history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-muted-foreground" /> {t("ai.history")}
            </CardTitle>
            <CardDescription>{t("ai.history.desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {history.map((h) => (
              <div key={h.id} className="rounded-md border p-3">
                <p className="font-medium">{h.question}</p>
                <p className="mt-1 text-muted-foreground">{h.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-start gap-2 rounded-lg border border-dashed border-warning/50 bg-warning/5 p-4 text-xs text-muted-foreground">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p>{t("doctor.disclaimer")}</p>
      </div>
    </div>
  );
}
