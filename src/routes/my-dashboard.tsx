import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { CITIES, CROPS, MARKET, farmerRecommendation, formatNaira, bestCity, type City, type Crop } from "@/lib/market-data";
import { Sparkles, Star, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/my-dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — AgriSense AI" },
      { name: "description", content: "Your personalized farmer dashboard: produce, sales history, favorite markets, and personalized selling recommendations." },
    ],
  }),
  component: MyDashboard,
});

interface Profile { user_id: string; name: string; city: City; primary_crop: Crop }
interface Produce { id: string; crop: Crop; quantity: number; unit: string }
interface Sale { id: string; crop: string; city_sold: string; price: number; quantity: number; date: string }
interface Favorite { id: string; city: City }

function MyDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [produce, setProduce] = useState<Produce[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [p, pr, s, f] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("produce").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("sales_history").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(20),
        supabase.from("favorite_markets").select("*").eq("user_id", user.id),
      ]);
      setProfile(p.data as Profile | null);
      setProduce((pr.data ?? []) as Produce[]);
      setSales((s.data ?? []) as Sale[]);
      setFavorites((f.data ?? []) as Favorite[]);
    })();
  }, [user]);

  if (loading || !user) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }

  async function saveProfile(fd: FormData) {
    if (!user) return;
    setBusy(true);
    const payload = {
      user_id: user.id,
      name: String(fd.get("name") || ""),
      city: String(fd.get("city") || "Abuja") as City,
      primary_crop: String(fd.get("primary_crop") || "Tomatoes") as Crop,
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
      const { data, error } = await supabase
        .from("favorite_markets")
        .insert({ user_id: user.id, city })
        .select()
        .single();
      if (error) toast.error(error.message);
      else if (data) setFavorites((prev) => [...prev, data as Favorite]);
    }
  }

  async function seedSampleSales() {
    if (!user || !profile) return;
    const samples = [
      { user_id: user.id, crop: profile.primary_crop, city_sold: profile.city, price: MARKET[profile.primary_crop].cityPrices[profile.city] - 2000, quantity: 5, date: new Date(Date.now() - 30*86400000).toISOString().slice(0,10) },
      { user_id: user.id, crop: profile.primary_crop, city_sold: profile.city, price: MARKET[profile.primary_crop].cityPrices[profile.city] - 500, quantity: 8, date: new Date(Date.now() - 14*86400000).toISOString().slice(0,10) },
    ];
    const { data, error } = await supabase.from("sales_history").insert(samples).select();
    if (error) toast.error(error.message);
    else if (data) { setSales((prev) => [...(data as Sale[]), ...prev]); toast.success("Sample sales added"); }
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
            <form
              className="space-y-4"
              onSubmit={(e) => { e.preventDefault(); saveProfile(new FormData(e.currentTarget)); }}
            >
              <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" name="name" required /></div>
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

  // Personalized recommendation — uses the farmer's own city/crop and total produce
  const totalOfPrimary = produce
    .filter((p) => p.crop === profile.primary_crop)
    .reduce((s, p) => s + Number(p.quantity), 0);
  const displayUnit = produce.find((p) => p.crop === profile.primary_crop)?.unit || "units";
  const rec = farmerRecommendation(
    profile.primary_crop,
    profile.city,
    totalOfPrimary || 1,
    totalOfPrimary ? displayUnit : "unit",
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile.name}</h1>
        <p className="text-muted-foreground">
          Farming in {profile.city} · Primary crop: {profile.primary_crop}
        </p>
      </div>

      <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-accent/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Personalized Recommendation</CardTitle>
          </div>
          <CardDescription>
            Based on your city, primary crop, and current market prices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm leading-relaxed">{rec.message}</p>
          {totalOfPrimary === 0 && (
            <p className="text-xs text-muted-foreground">
              Add produce below for a total-earnings estimate.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Produce */}
        <Card>
          <CardHeader>
            <CardTitle>My Produce</CardTitle>
            <CardDescription>Track what you have on hand.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="grid grid-cols-4 gap-2"
              onSubmit={(e) => { e.preventDefault(); addProduce(new FormData(e.currentTarget)); (e.currentTarget as HTMLFormElement).reset(); }}
            >
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
                  <Button size="icon" variant="ghost" onClick={() => deleteProduce(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card>
          <CardHeader>
            <CardTitle>Favorite Markets</CardTitle>
            <CardDescription>
              Star markets to compare against this week's best.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c) => {
                const isFav = favorites.some((f) => f.city === c);
                return (
                  <Button
                    key={c}
                    size="sm"
                    variant={isFav ? "default" : "outline"}
                    onClick={() => toggleFavorite(c)}
                  >
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
      </div>

      {/* Sales history */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>Your recorded sales.</CardDescription>
          </div>
          {sales.length === 0 && (
            <Button size="sm" variant="outline" onClick={seedSampleSales}>Add sample sales</Button>
          )}
        </CardHeader>
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
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2">{s.date}</td>
                      <td className="py-2">{s.crop}</td>
                      <td className="py-2">{s.city_sold}</td>
                      <td className="py-2">{s.quantity}</td>
                      <td className="py-2">{formatNaira(Number(s.price))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardDescription>Update profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-3"
            onSubmit={(e) => { e.preventDefault(); saveProfile(new FormData(e.currentTarget)); }}
          >
            <Input name="name" defaultValue={profile.name} placeholder="Name" />
            <Select name="city" defaultValue={profile.city}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select name="primary_crop" defaultValue={profile.primary_crop}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="submit" disabled={busy} className="md:col-span-3">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
