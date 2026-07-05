import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CropPicker } from "@/components/CropPicker";
import { MARKET, formatNaira, type Crop } from "@/lib/market-data";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Price Analytics — AgriSense AI" },
      { name: "description", content: "4-week price trends, seasonal insights and volatility index for major Nigerian crops." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const [crop, setCrop] = useState<Crop>("Tomatoes");
  const d = MARKET[crop];

  const chartData = d.weeklyTrend.map((price, i) => ({
    week: `Week ${i + 1}`,
    price,
  }));

  const dirIcon =
    d.thisWeekDirection === "rising" ? <TrendingUp className="h-5 w-5 text-success" /> :
    d.thisWeekDirection === "falling" ? <TrendingDown className="h-5 w-5 text-destructive" /> :
    <Minus className="h-5 w-5 text-muted-foreground" />;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Price Analytics</h1>
          <p className="text-muted-foreground">Deeper look at {crop.toLowerCase()} market behavior.</p>
        </div>
        <CropPicker value={crop} onChange={setCrop} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Market Signal — This Week</CardDescription>
            <CardTitle className="flex items-center gap-2 capitalize">{dirIcon}{d.thisWeekDirection}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{d.marketNote}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Volatility Index</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-earth" />
              {d.volatility}/100
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={d.volatility} />
            <p className="text-xs text-muted-foreground">
              {d.volatility < 30 ? "Low — stable pricing, predictable margins." :
               d.volatility < 60 ? "Moderate — some week-to-week swing." :
               "High — expect sharp price movements. Time your sale carefully."}
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
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickFormatter={(v) => formatNaira(v as number)}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    color: "var(--popover-foreground)",
                  }}
                  formatter={(v) => formatNaira(v as number)}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "var(--primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seasonal Insight</CardTitle>
          <CardDescription>What to expect over the next 3 weeks</CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed">{d.seasonalInsight}</CardContent>
      </Card>
    </div>
  );
}
