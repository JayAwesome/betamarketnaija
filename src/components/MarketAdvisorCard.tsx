import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useServerFn } from "@tanstack/react-start";
import { marketAdvisory } from "@/lib/ai-advisor.functions";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { logAiInteraction } from "@/lib/ai-history";
import type { City, Crop } from "@/lib/market-data";

export function MarketAdvisorCard({ crop, city }: { crop: Crop; city: City }) {
  const { t, lang, tCrop } = useT();
  const { user } = useAuth();
  const run = useServerFn(marketAdvisory);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setText("");
    run({ data: { crop, city, lang } })
      .then((res) => {
        if (cancelled) return;
        setText(res.content);
        void logAiInteraction({
          userId: user?.id,
          feature: "market_advisor",
          crop,
          city,
          lang,
          question: `Market outlook for ${crop} in ${city}`,
          answer: res.content,
        });
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop, city, lang, nonce]);

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className={`h-5 w-5 text-primary ${loading ? "animate-pulse" : ""}`} />
          <CardTitle className="text-base">{t("ai.advisor.title")}</CardTitle>
          <Badge variant="secondary">{tCrop(crop)} · {city}</Badge>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            aria-label={t("ai.refresh")}
            disabled={loading}
            onClick={() => setNonce((n) => n + 1)}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <CardDescription>{t("ai.advisor.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed">
        {loading && <p className="animate-pulse text-muted-foreground">{t("ai.loading")}</p>}
        {!loading && failed && (
          <p className="flex items-start gap-2 text-muted-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            {t("ai.error")}
          </p>
        )}
        {!loading && !failed && <p className="whitespace-pre-wrap">{text}</p>}
      </CardContent>
    </Card>
  );
}
