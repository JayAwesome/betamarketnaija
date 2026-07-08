import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Activity, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CropPicker } from "@/components/CropPicker";
import { MARKET, formatNaira, type Crop } from "@/lib/market-data";
import { useT } from "@/lib/i18n";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Price Analytics — AgriSense AI" },
      { name: "description", content: "4-week price trends, seasonal insights and volatility index for major Nigerian crops." },
      { property: "og:title", content: "Price Analytics — AgriSense AI" },
      { property: "og:description", content: "See 4-week price trends, volatility bands, and directional market signals for Nigerian crops." },
      { property: "og:url", content: "https://betamarketnaija.lovable.app/analytics" },
      { name: "twitter:title", content: "Price Analytics — AgriSense AI" },
      { name: "twitter:description", content: "See 4-week price trends, volatility bands, and directional market signals for Nigerian crops." },
    ],
    links: [{ rel: "canonical", href: "https://betamarketnaija.lovable.app/analytics" }],
  }),
  component: Analytics,
});

function Analytics() {
  const { t } = useT();
  const [crop, setCrop] = useState<Crop>("Tomatoes");
  const d = MARKET[crop];

  const chartData = d.weeklyTrend.map((price, i) => ({ week: `Week ${i + 1}`, price }));

  const dirIcon =
    d.thisWeekDirection === "rising" ? <TrendingUp className="h-5 w-5 text-success" /> :
    d.thisWeekDirection === "falling" ? <TrendingDown className="h-5 w-5 text-destructive" /> :
    <Minus className="h-5 w-5 text-muted-foreground" />;

  const signalBg =
    d.thisWeekDirection === "rising" ? "bg-success/10 border-success/40" :
    d.thisWeekDirection === "falling" ? "bg-destructive/10 border-destructive/40" :
    "bg-muted border-muted";

  const volBand =
    d.volatility < 30 ? { label: "Low", color: "bg-success" } :
    d.volatility < 60 ? { label: "Medium", color: "bg-warning" } :
    { label: "High", color: "bg-destructive" };

  const lineColor =
    d.thisWeekDirection === "rising" ? "var(--color-success)" :
    d.thisWeekDirection === "falling" ? "var(--color-destructive)" :
    "var(--color-primary)";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("page.analytics.title")}</h1>
          <p className="text-muted-foreground">Deeper look at {crop.toLowerCase()} market behavior.</p>
        </div>
        <CropPicker value={crop} onChange={setCrop} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={`border ${signalBg}`}>
          <CardHeader>
            <CardDescription>Market Signal — {t("card.thisWeek")}</CardDescription>
            <CardTitle className="flex items-center gap-2">{dirIcon}{t(`status.${d.thisWeekDirection}`)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/80">{d.marketNote}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Price Volatility Index</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-earth" />
              {d.volatility}/100 · <span className="text-sm font-normal text-muted-foreground">{volBand.label}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className={`h-full ${volBand.color}`} style={{ width: `${d.volatility}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              {d.volatility < 30 ? "Stable pricing, predictable margins." :
               d.volatility < 60 ? "Some week-to-week swing — plan sales carefully." :
               "Sharp price movements — time your sale carefully."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>4-Week Price Trend</CardTitle>
          <CardDescription>National average, {crop} — per {d.unit}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={(v) => formatNaira(v as number)}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                    color: "var(--color-popover-foreground)",
                  }}
                  formatter={(v) => formatNaira(v as number)}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={lineColor}
                  strokeWidth={3}
                  fill="url(#trendGradient)"
                  dot={{ r: 5, fill: lineColor }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-earth/40 bg-earth/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-earth" />
            <CardTitle>Seasonal Insight</CardTitle>
          </div>
          <CardDescription>What to expect over the next 3 weeks</CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed">{d.seasonalInsight}</CardContent>
      </Card>
    </div>
  );
}
