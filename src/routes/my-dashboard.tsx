import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { GuestNudge } from "@/components/GuestNudge";
import {
  CITIES, CROPS, MARKET, farmerRecommendation, formatNaira, bestCity,
  type City, type Crop,
} from "@/lib/market-data";
import { Sparkles, Star, Trash2, Plus, PiggyBank, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/my-dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — AgriSense AI" },
      { name: "description", content: "Your personalized farmer dashboard: produce inventory, sales tracker, profit summary, and personalized recommendations." },
      { property: "og:title", content: "My Farmer Dashboard — AgriSense AI" },
      { property: "og:description", content: "Track produce inventory, record sales, and compare your realized price against AgriSense recommendations." },
      { property: "og:url", content: "https://betamarketnaija.lovable.app/my-dashboard" },
      { name: "twitter:title", content: "My Farmer Dashboard — AgriSense AI" },
      { name: "twitter:description", content: "Track produce inventory, record sales, and compare your realized price against AgriSense recommendations." },
    ],
    links: [{ rel: "canonical", href: "https://betamarketnaija.lovable.app/my-dashboard" }],
  }),
  component: MyDashboard,
});

interface Profile { user_id: string; name: string; city: City; primary_crop: Crop; phone?: string | null }
interface Produce { id: string; crop: Crop; quantity: number; unit: string }
interface Sale {
  id: string; crop: string; city_sold: string; price: number; quantity: number;
  date: string; unit?: string | null; revenue?: number | null;
  recommended_price_at_sale?: number | null; price_difference?: number | null;
}

function MyDashboard() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [produce, setProduce] = useState<Produce[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [favorites, setFavorites] = useState<{ id: string; city: City }[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [p, pr, s, f] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("produce").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("sales_history").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(50),
        supabase.from("favorite_markets").select("*").eq("user_id", user.id),
      ]);
      setProfile(p.data as Profile | null);
      setProduce((pr.data ?? []) as Produce[]);
      setSales((s.data ?? []) as Sale[]);
      setFavorites((f.data ?? []) as { id: string; city: City }[]);
    })();
  }, [user]);

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!user) return <div className="p-6"><GuestNudge feature="My Dashboard" /></div>;

  async function saveProfile(fd: FormData) {
    if (!user) return;
    setBusy(true);
    const payload = {
      user_id: user.id,
      name: String(fd.get("name") || ""),
      city: String(fd.get("city") || "Abuja") as City,
      primary_crop: String(fd.get("primary_crop") || "Tomatoes") as Crop,
      phone: String(fd.get("phone") || "") || null,
    };
    const { error } = await supabase.from("profiles").upsert(payload);
    setBusy(false);
    if (error) toast.error(error.message);
    else { setProfile(payload); toast.success("Profile saved"); }
  }

  async function addProduce(fd: FormData) {
    if (!user) return;
    setBusy(true);
    const row = {
      user_id: user.id,
      crop: String(fd.get("crop")) as Crop,
      quantity: Number(fd.get("quantity")),
      unit: String(fd.get("unit") || "baskets"),
    };
    const { data, error } = await supabase.from("produce").insert(row).select().single();
    setBusy(false);
    if (error) toast.error(error.message);
    else if (data) { setProduce((prev) => [data as Produce, ...prev]); toast.success("Produce added"); }
  }

  async function deleteProduce(id: string) {
    const { error } = await supabase.from("produce").delete().eq("id", id);
    if (error) toast.error(error.message);
    else setProduce((prev) => prev.filter((p) => p.id !== id));
  }

  async function toggleFavorite(city: City) {
    if (!user) return;
    const existing = favorites.find((f) => f.city === city);
    if (existing) {
      await supabase.from("favorite_markets").delete().eq("id", existing.id);
      setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
    } else {
      const { data, error } = await supabase.from("favorite_markets").insert({ user_id: user.id, city }).select().single();
      if (error) toast.error(error.message);
      else if (data) setFavorites((prev) => [...prev, data as { id: string; city: City }]);
    }
  }

  async function recordSale(fd: FormData) {
    if (!user) return;
    setBusy(true);
    const crop = String(fd.get("crop")) as Crop;
    const city_sold = String(fd.get("city_sold")) as City;
    const quantity = Number(fd.get("quantity"));
    const price = Number(fd.get("price"));
    const unit = String(fd.get("unit") || MARKET[crop].unit);
    const date = String(fd.get("date") || new Date().toISOString().slice(0, 10));

    const best = bestCity(crop);
    const recommendedPrice = MARKET[crop].cityPrices[best];
    const revenue = price * quantity;
    const diff = (recommendedPrice - price) * quantity;

    const { data, error } = await supabase.from("sales_history").insert({
      user_id: user.id, crop, city_sold, quantity, price,
      unit, revenue, recommended_price_at_sale: recommendedPrice, price_difference: diff, date,
    }).select().single();

    if (error) { setBusy(false); toast.error(error.message); return; }

    // Deduct inventory: pick oldest matching produce row and reduce quantity
    const matching = produce.filter((p) => p.crop === crop).sort((a, b) => Number(b.quantity) - Number(a.quantity));
    let remaining = quantity;
    const updates: PromiseLike<unknown>[] = [];
    const newProduce = [...produce];
    for (const row of matching) {
      if (remaining <= 0) break;
      const take = Math.min(Number(row.quantity), remaining);
      const newQty = Number(row.quantity) - take;
      remaining -= take;
      if (newQty <= 0) {
        updates.push(supabase.from("produce").delete().eq("id", row.id).then(() => undefined));
        const idx = newProduce.findIndex((p) => p.id === row.id);
        if (idx >= 0) newProduce.splice(idx, 1);
      } else {
        updates.push(supabase.from("produce").update({ quantity: newQty }).eq("id", row.id).then(() => undefined));
        const idx = newProduce.findIndex((p) => p.id === row.id);
        if (idx >= 0) newProduce[idx] = { ...newProduce[idx], quantity: newQty };
      }
    }
    await Promise.all(updates);
    setProduce(newProduce);
    setSales((prev) => [data as Sale, ...prev]);
    setBusy(false);

    if (city_sold !== best && recommendedPrice > price) {
      toast.success(`Recorded. AgriSense recommended ${best} at ${formatNaira(recommendedPrice)} — ${formatNaira(recommendedPrice - price)} more per ${MARKET[crop].unit}.`);
    } else {
      toast.success("Sale recorded.");
    }
  }

  // Profile setup screen
  if (!profile || !profile.name) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <Card>
          <CardHeader>
            <CardTitle>Complete your profile</CardTitle>
            <CardDescription>Tell us where you farm so we can personalize recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveProfile(new FormData(e.currentTarget)); }}>
              <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" name="name" required /></div>
              <div className="space-y-2"><Label htmlFor="phone">Phone (optional)</Label><Input id="phone" name="phone" type="tel" /></div>
              <div className="space-y-2">
                <Label>City</Label>
                <Select name="city" defaultValue="Abuja">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Primary crop</Label>
                <Select name="primary_crop" defaultValue="Tomatoes">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={busy} className="w-full">Save profile</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalOfPrimary = produce
    .filter((p) => p.crop === profile.primary_crop)
    .reduce((s, p) => s + Number(p.quantity), 0);
  const displayUnit = produce.find((p) => p.crop === profile.primary_crop)?.unit || "units";
  const rec = farmerRecommendation(
    profile.primary_crop, profile.city, totalOfPrimary || 1, totalOfPrimary ? displayUnit : "unit",
  );

  // Profit summary
  const totalRevenue = sales.reduce((s, x) => s + Number(x.revenue ?? x.price * x.quantity), 0);
  const totalVolume = sales.reduce((s, x) => s + Number(x.quantity), 0);
  const totalVariance = sales.reduce((s, x) => s + Number(x.price_difference ?? 0), 0);
  const cropSummary = new Map<string, { qty: number; revenue: number }>();
  sales.forEach((x) => {
    const cur = cropSummary.get(x.crop) ?? { qty: 0, revenue: 0 };
    cur.qty += Number(x.quantity);
    cur.revenue += Number(x.revenue ?? x.price * x.quantity);
    cropSummary.set(x.crop, cur);
  });

  const revenueChart = sales
    .slice()
    .reverse()
    .map((x, i) => ({ n: `#${i + 1}`, revenue: Number(x.revenue ?? x.price * x.quantity) }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile.name}</h1>
        <p className="text-muted-foreground">Farming in {profile.city} · Primary crop: {profile.primary_crop}</p>
      </div>

      <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-accent/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Personalized Recommendation</CardTitle>
          </div>
          <CardDescription>Based on your city, primary crop, and current market prices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm leading-relaxed">{rec.message}</p>
          {totalOfPrimary === 0 && (
            <p className="text-xs text-muted-foreground">Add produce below for a total-earnings estimate.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Produce */}
        <Card>
          <CardHeader>
            <CardTitle>My Produce</CardTitle>
            <CardDescription>Inventory deducts automatically when you record a sale.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="grid grid-cols-4 gap-2" onSubmit={(e) => { e.preventDefault(); addProduce(new FormData(e.currentTarget)); (e.currentTarget as HTMLFormElement).reset(); }}>
              <Select name="crop" defaultValue={profile.primary_crop}>
                <SelectTrigger className="col-span-2"><SelectValue /></SelectTrigger>
                <SelectContent>{CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Input name="quantity" type="number" min="0.1" step="0.1" placeholder="Qty" required />
              <Input name="unit" placeholder="baskets" defaultValue="baskets" />
              <Button type="submit" className="col-span-4" disabled={busy}>
                <Plus className="mr-1 h-4 w-4" /> Add produce
              </Button>
            </form>
            <ul className="divide-y">
              {produce.length === 0 && <li className="py-4 text-sm text-muted-foreground">No produce yet.</li>}
              {produce.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <span><strong>{p.quantity}</strong> {p.unit} of {p.crop}</span>
                  <Button size="icon" variant="ghost" aria-label={`Delete ${p.crop}`} onClick={() => deleteProduce(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Record sale */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Receipt className="h-5 w-5 text-earth" /><CardTitle>Record a Sale</CardTitle></div>
            <CardDescription>Compare your sale against AgriSense's recommendation.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-2 gap-2" onSubmit={(e) => { e.preventDefault(); recordSale(new FormData(e.currentTarget)); (e.currentTarget as HTMLFormElement).reset(); }}>
              <Select name="crop" defaultValue={profile.primary_crop}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select name="city_sold" defaultValue={profile.city}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Input name="quantity" type="number" min="0.1" step="0.1" placeholder="Quantity" required />
              <Input name="unit" placeholder="baskets" defaultValue="baskets" />
              <Input name="price" type="number" min="1" placeholder="Price per unit (₦)" required className="col-span-2" />
              <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="col-span-2" />
              <Button type="submit" className="col-span-2" disabled={busy}>Record Sale</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Profit summary + chart */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total revenue</CardDescription><CardTitle className="text-2xl">{formatNaira(totalRevenue)}</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground">Across {sales.length} recorded sales</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total volume sold</CardDescription><CardTitle className="text-2xl">{totalVolume.toLocaleString()}</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground">Combined units across all crops</CardContent>
        </Card>
        <Card className={totalVariance > 0 ? "border-warning/40 bg-warning/5" : "border-success/40 bg-success/5"}>
          <CardHeader className="pb-2">
            <CardDescription>Variance vs recommendation</CardDescription>
            <CardTitle className="text-2xl">{formatNaira(totalVariance)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {totalVariance > 0 ? "Money left on the table by not selling in the recommended city." : "You matched or beat the recommendation. Nice."}
          </CardContent>
        </Card>
      </div>

      {sales.length >= 2 && (
        <Card>
          <CardHeader><CardTitle>Revenue per sale</CardTitle><CardDescription>Your financial trend over time</CardDescription></CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <LineChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="n" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => formatNaira(v as number)} width={90} />
                  <Tooltip formatter={(v) => formatNaira(v as number)} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: "0.5rem" }} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {totalRevenue > 0 && (
        <Card className="border-earth/40 bg-earth/5">
          <CardHeader>
            <div className="flex items-center gap-2"><PiggyBank className="h-5 w-5 text-earth" /><CardTitle>Savings suggestion</CardTitle></div>
          </CardHeader>
          <CardContent className="text-sm">
            Consider setting aside <strong>{formatNaira(totalRevenue * 0.10)}</strong> (10% of your recorded revenue) for next season's inputs — seeds, fertilizer, transport.
          </CardContent>
        </Card>
      )}

      {/* Favorites */}
      <Card>
        <CardHeader>
          <CardTitle>Favorite Markets</CardTitle>
          <CardDescription>Star markets to compare against this week's best.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => {
              const isFav = favorites.some((f) => f.city === c);
              return (
                <Button key={c} size="sm" variant={isFav ? "default" : "outline"} onClick={() => toggleFavorite(c)}>
                  <Star className={`mr-1 h-3 w-3 ${isFav ? "fill-current" : ""}`} /> {c}
                </Button>
              );
            })}
          </div>
          {favorites.length > 0 && (
            <div className="rounded-lg border p-3 text-sm">
              <p className="mb-2 font-medium">
                Best market for {profile.primary_crop} this week:{" "}
                <span className="text-primary">{bestCity(profile.primary_crop)}</span> ·{" "}
                {formatNaira(MARKET[profile.primary_crop].cityPrices[bestCity(profile.primary_crop)])}
              </p>
              <ul className="space-y-1 text-muted-foreground">
                {favorites.map((f) => {
                  const price = MARKET[profile.primary_crop].cityPrices[f.city];
                  const diff = price - MARKET[profile.primary_crop].cityPrices[bestCity(profile.primary_crop)];
                  return (
                    <li key={f.id}>
                      {f.city}: {formatNaira(price)}{" "}
                      <Badge variant={diff === 0 ? "default" : "secondary"} className="ml-1">
                        {diff === 0 ? "best" : `${formatNaira(diff)} vs best`}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales history */}
      <Card>
        <CardHeader><CardTitle>Sales History</CardTitle><CardDescription>Your recorded sales.</CardDescription></CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Crop</th>
                    <th className="pb-2 font-medium">City</th>
                    <th className="pb-2 font-medium">Qty</th>
                    <th className="pb-2 font-medium">Price</th>
                    <th className="pb-2 font-medium">vs Rec.</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => {
                    const diff = Number(s.price_difference ?? 0);
                    return (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="py-2">{s.date}</td>
                        <td className="py-2">{s.crop}</td>
                        <td className="py-2">{s.city_sold}</td>
                        <td className="py-2">{s.quantity}</td>
                        <td className="py-2">{formatNaira(Number(s.price))}</td>
                        <td className="py-2">
                          {diff > 0 ? (
                            <Badge variant="secondary">-{formatNaira(diff)}</Badge>
                          ) : diff < 0 ? (
                            <Badge className="bg-success text-success-foreground">+{formatNaira(-diff)}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {cropSummary.size > 0 && (
            <div className="mt-4 rounded-md border p-3 text-xs text-muted-foreground">
              <strong>By crop:</strong>{" "}
              {Array.from(cropSummary.entries()).map(([c, v]) => (
                <span key={c} className="mr-3">{c}: avg {formatNaira(v.revenue / v.qty)}/unit · {v.qty} units</span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4"><CardDescription>Update profile</CardDescription></CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); saveProfile(new FormData(e.currentTarget)); }}>
            <Input name="name" defaultValue={profile.name} placeholder="Name" />
            <Input name="phone" defaultValue={profile.phone ?? ""} placeholder="Phone" />
            <Select name="city" defaultValue={profile.city}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select name="primary_crop" defaultValue={profile.primary_crop}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="submit" disabled={busy} className="md:col-span-4">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
