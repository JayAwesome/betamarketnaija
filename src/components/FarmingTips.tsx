import { useEffect, useState } from "react";
import { Lightbulb, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useServerFn } from "@tanstack/react-start";
import { farmingTips } from "@/lib/ai-advisor.functions";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { logAiInteraction, fetchAiHistory } from "@/lib/ai-history";
import type { City, Crop } from "@/lib/market-data";

export function FarmingTips({ crops, city }: { crops: Crop[]; city: City }) {
  const { t, lang } = useT();
  const { user } = useAuth();
  const run = useServerFn(farmingTips);
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const cropKey = crops.join(",");

  useEffect(() => {
    let cancelled = false;
    if (!crops.length) return;
    setLoading(true);
    setFailed(false);
    (async () => {
      try {
        const past = user ? await fetchAiHistory(user.id, undefined, 5) : [];
        const res = await run({
          data: { crops, city, lang, pastQuestions: past.map((p) => p.question).slice(0, 5) },
        });
        if (cancelled) return;
        setTips(res.tips);
        void logAiInteraction({
          userId: user?.id,
          feature: "farming_tips",
          crop: crops[0],
          city,
          lang,
          question: `Weekly tips for ${crops.join(", ")} in ${city}`,
          answer: res.tips.join("\n"),
        });
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropKey, city, lang, user?.id]);

  return (
    <Card className="border-earth/40 bg-earth/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className={`h-5 w-5 text-earth ${loading ? "animate-pulse" : ""}`} />
          <CardTitle className="text-base">{t("ai.tips.title")}</CardTitle>
        </div>
        <CardDescription>{t("ai.tips.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm leading-relaxed">
        {loading && <p className="animate-pulse text-muted-foreground">{t("ai.loading")}</p>}
        {!loading && failed && (
          <p className="flex items-start gap-2 text-muted-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            {t("ai.error")}
          </p>
        )}
        {!loading && !failed && (
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-earth">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
