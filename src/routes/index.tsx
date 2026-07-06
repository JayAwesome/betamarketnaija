import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, MapPin, Sparkles, Info, AlertCircle, Bell, Users, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CropPicker } from "@/components/CropPicker";
import {
  CITIES, MARKET, bestCity, worstCity, formatNaira, recommend, dataConfidence,
  type Crop, type City,
} from "@/lib/market-data";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Market Dashboard — AgriSense AI" },
      { name: "description", content: "Compare crop prices across 19 Nigerian cities and get AI-powered selling recommendations grounded in weekly trend data." },
    ],
  }),
  component: Dashboard,
});

function TrendIcon({ dir }: { dir: "rising" | "falling" | "stable" }) {
  if (dir === "rising") return <TrendingUp className="h-4 w-4 text-success" />;
  if (dir === "falling") return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function Dashboard() {
  const { t } = useT();
  const { user } = useAuth();
  const [crop, setCrop] = useState<Crop>("Tomatoes");
  const [alertCity, setAlertCity] = useState<City | "any">("any");
  const [alertPrice, setAlertPrice] = useState("");
  const [alertDir, setAlertDir] = useState<"above" | "below">("above");

  const data = MARKET[crop];
  const best = bestCity(crop);
  const worst = worstCity(crop);
  const rec = recommend(crop);
  const confidence = dataConfidence(crop);
  const confColor = confidence === "High" ? "bg-success text-success-foreground"
    : confidence === "Medium" ? "bg-warning text-warning-foreground"
    : "bg-destructive text-destructive-foreground";

  async function saveAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to save alerts."); return; }
    const price = Number(alertPrice);
    if (!price || price <= 0) { toast.error("Enter a valid target price"); return; }
    const { error } = await supabase.from("alerts").insert({
      user_id: user.id,
      crop,
      city: alertCity === "any" ? null : alertCity,
      target_price: price,
      direction: alertDir,
    });
    if (error) toast.error(error.message);
    else { toast.success("Alert saved"); setAlertPrice(""); }
  }

  useEffect(() => { setAlertCity("any"); }, [crop]);

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("page.dashboard.title")}</h1>
            <p className="text-muted-foreground">
              Compare {crop.toLowerCase()} prices across {CITIES.length} Nigerian markets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{t("label.crop")}:</span>
            <CropPicker value={crop} onChange={setCrop} />
          </div>
        </div>

        {/* AI Recommendation */}
        <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-accent/20">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>{t("card.aiRec")}</CardTitle>
              <Badge className="capitalize" variant="default">{rec.action}</Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={`ml-auto gap-1 ${confColor}`}>
                    <ShieldCheck className="h-3 w-3" /> {t("card.confidence")}: {confidence}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  Confidence is derived from crop-level price volatility. "High" = stable weekly trend; "Limited" = high volatility, treat as directional guidance only. This prototype uses simulated data.
                </TooltipContent>
              </Tooltip>
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
              <CardDescription>{t("card.thisWeek")}</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <TrendIcon dir={data.thisWeekDirection} />
                {t(`status.${data.thisWeekDirection}`)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{data.marketNote}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t("card.next3")}</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <TrendIcon dir={data.nextThreeWeeksDirection} />
                {t(`status.${data.nextThreeWeeksDirection}`)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{data.seasonalInsight}</CardContent>
          </Card>
        </div>

        {/* City price table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("card.priceTable")}</CardTitle>
            <CardDescription>
              {crop} — {t("label.price").toLowerCase()} per {data.unit}. {t("status.highest")} and {t("status.lowest")} markets highlighted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">{t("label.city")}</th>
                    <th className="pb-2 font-medium">{t("label.price")}</th>
                    <th className="pb-2 font-medium">{t("label.signal")}</th>
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
                          {isBest && <Badge className="bg-success text-success-foreground">{t("status.highest")}</Badge>}
                          {isWorst && <Badge variant="destructive">{t("status.lowest")}</Badge>}
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

        {/* Alerts + Coop teaser side by side */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>{t("card.alerts")}</CardTitle>
              </div>
              <CardDescription>Get notified when {crop.toLowerCase()} hits your target price.</CardDescription>
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 p-4 text-sm">
                  <p className="mb-2">{t("guest.nudge")}</p>
                  <Button asChild size="sm"><Link to="/auth">{t("nav.signin")}</Link></Button>
                </div>
              ) : (
                <form className="grid gap-3 sm:grid-cols-2" onSubmit={saveAlert}>
                  <div className="space-y-1">
                    <Label className="text-xs">Direction</Label>
                    <Select value={alertDir} onValueChange={(v) => setAlertDir(v as "above" | "below")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Rises above</SelectItem>
                        <SelectItem value="below">Falls below</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Target ({data.unit})</Label>
                    <Input type="number" min="0" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} placeholder="e.g. 30000" required />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">City (optional)</Label>
                    <Select value={alertCity} onValueChange={(v) => setAlertCity(v as City | "any")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any city</SelectItem>
                        {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="sm:col-span-2">{t("btn.setAlert")}</Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="border-earth/40 bg-earth/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-earth" />
                <CardTitle>{t("card.coopTeaser")}</CardTitle>
              </div>
              <CardDescription>Farmers earn more when they sell together.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Join or create a cooperative to pool produce with other farmers and unlock buyer premiums that individual smallholders can't reach.
              </p>
              <Button asChild variant="outline"><Link to="/my-cooperative">Open My Cooperative →</Link></Button>
            </CardContent>
          </Card>
        </div>

        {/* Why this matters */}
        <Card className="border-earth/40 bg-earth/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-earth" />
              <CardTitle>{t("card.why")}</CardTitle>
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
    </TooltipProvider>
  );
}
