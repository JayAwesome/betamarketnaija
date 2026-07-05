import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, MapPin, Sparkles, Info, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CropPicker } from "@/components/CropPicker";
import {
  CITIES,
  MARKET,
  bestCity,
  worstCity,
  formatNaira,
  recommend,
  type Crop,
} from "@/lib/market-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Market Dashboard — AgriSense AI" },
      { name: "description", content: "Live-style crop price comparison across Abuja, Lagos, Kano, Jos and Port Harcourt with AI-powered selling recommendations." },
    ],
  }),
  component: Dashboard,
});

function TrendIcon({ dir }: { dir: "rising" | "falling" | "stable" }) {
  if (dir === "rising") return <TrendingUp className="h-4 w-4 text-success" />;
  if (dir === "falling") return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function trendLabel(dir: "rising" | "falling" | "stable") {
  return dir.charAt(0).toUpperCase() + dir.slice(1);
}

function Dashboard() {
  const [crop, setCrop] = useState<Crop>("Tomatoes");
  const data = MARKET[crop];
  const best = bestCity(crop);
  const worst = worstCity(crop);
  const rec = recommend(crop);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Dashboard</h1>
          <p className="text-muted-foreground">
            Compare {crop.toLowerCase()} prices across major Nigerian markets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Select crop:</span>
          <CropPicker value={crop} onChange={setCrop} />
        </div>
      </div>

      {/* AI Recommendation */}
      <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-accent/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Recommendation</CardTitle>
            <Badge className="ml-auto capitalize" variant="default">{rec.action}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{rec.city}</span>
            </div>
            <span className="text-2xl font-semibold text-primary">{formatNaira(rec.price)}</span>
            <span className="text-sm text-muted-foreground">per {data.unit}</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{rec.reason}</p>
        </CardContent>
      </Card>

      {/* Trend + Seasonal signals */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>This Week</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <TrendIcon dir={data.thisWeekDirection} />
              {trendLabel(data.thisWeekDirection)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{data.marketNote}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Next 3 Weeks (seasonal outlook)</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <TrendIcon dir={data.nextThreeWeeksDirection} />
              {trendLabel(data.nextThreeWeeksDirection)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{data.seasonalInsight}</CardContent>
        </Card>
      </div>

      {/* City price table */}
      <Card>
        <CardHeader>
          <CardTitle>City Price Comparison</CardTitle>
          <CardDescription>
            {crop} — price per {data.unit}. Highest and lowest markets highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">City</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium">Signal</th>
                </tr>
              </thead>
              <tbody>
                {CITIES.map((c) => {
                  const price = data.cityPrices[c];
                  const isBest = c === best;
                  const isWorst = c === worst;
                  return (
                    <tr key={c} className="border-b last:border-0">
                      <td className="py-3 font-medium">{c}</td>
                      <td className="py-3 font-semibold">{formatNaira(price)}</td>
                      <td className="py-3">
                        {isBest && <Badge className="bg-success text-success-foreground">Highest</Badge>}
                        {isWorst && <Badge variant="destructive">Lowest</Badge>}
                        {!isBest && !isWorst && <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Why this matters */}
      <Card className="border-earth/40 bg-earth/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-earth" />
            <CardTitle>Why This Matters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed">
          <p>
            Smallholder farmers in Nigeria lose an estimated <strong>30–50%</strong> of their
            harvest value each year due to poor market information — selling at the wrong time,
            in the wrong city, or accepting the first buyer's price.
          </p>
          <p>
            AgriSense AI closes that gap by turning raw market data into a clear answer to the
            only question that matters: <em>where and when should I sell to earn the most?</em>
          </p>
        </CardContent>
      </Card>

      {/* Data source disclosure */}
      <div className="flex items-start gap-2 rounded-lg border border-dashed border-warning/50 bg-warning/5 p-4 text-xs text-muted-foreground">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p>
          <strong>Demo dataset.</strong> Prices shown are simulated for the 3MTT Knowledge
          Showcase prototype. In production this feed would integrate with sources such as the
          <em> National Bureau of Statistics (NBS)</em>, <em>AFEX Commodities Exchange</em>, and
          state agricultural boards.
        </p>
      </div>
    </div>
  );
}
