import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Copy, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { GuestNudge } from "@/components/GuestNudge";
import { CROPS, MARKET, bestCity, formatNaira, type Crop } from "@/lib/market-data";
import { toast } from "sonner";

export const Route = createFileRoute("/my-cooperative")({
  head: () => ({
    meta: [
      { title: "My Cooperative — AgriSense AI" },
      { name: "description", content: "Pool produce with other farmers and unlock buyer premiums that individual smallholders can't reach." },
      { property: "og:title", content: "Cooperative Pooling — AgriSense AI" },
      { property: "og:description", content: "Join or create a farming cooperative to aggregate produce and unlock group-level buyer recommendations." },
      { property: "og:url", content: "https://betamarketnaija.lovable.app/my-cooperative" },
      { name: "twitter:title", content: "Cooperative Pooling — AgriSense AI" },
      { name: "twitter:description", content: "Join or create a farming cooperative to aggregate produce and unlock group-level buyer recommendations." },
    ],
    links: [{ rel: "canonical", href: "https://betamarketnaija.lovable.app/my-cooperative" }],
  }),
  component: CoopPage,
});

interface Coop { id: string; name: string; join_code: string; created_by: string }
interface Member { user_id: string }
interface ProduceRow { user_id: string; crop: string; quantity: number; unit: string }

function randCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function CoopPage() {
  const { user, loading } = useAuth();
  const [coop, setCoop] = useState<Coop | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [produce, setProduce] = useState<ProduceRow[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: mem } = await supabase
        .from("cooperative_members")
        .select("cooperative_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mem) { setCoop(null); return; }
      const { data: c } = await supabase
        .from("cooperatives")
        .select("*")
        .eq("id", mem.cooperative_id)
        .maybeSingle();
      if (!c) return;
      setCoop(c as Coop);
      const [{ data: ms }, { data: pr }] = await Promise.all([
        supabase.from("cooperative_members").select("user_id").eq("cooperative_id", c.id),
        supabase.from("produce").select("user_id, crop, quantity, unit"),
      ]);
      setMembers((ms ?? []) as Member[]);
      const memberIds = new Set(((ms ?? []) as Member[]).map((m) => m.user_id));
      setProduce(((pr ?? []) as ProduceRow[]).filter((p) => memberIds.has(p.user_id)));
    })();
  }, [user]);

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!user) return <div className="p-6"><GuestNudge feature="My Cooperative" /></div>;

  async function createCoop(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setBusy(true);
    const join_code = randCode();
    const { data: c, error } = await supabase
      .from("cooperatives")
      .insert({ name: name.trim(), join_code, created_by: user.id })
      .select()
      .single();
    if (error || !c) { setBusy(false); toast.error(error?.message ?? "Failed"); return; }
    const { error: mErr } = await supabase
      .from("cooperative_members")
      .insert({ cooperative_id: c.id, user_id: user.id });
    setBusy(false);
    if (mErr) { toast.error(mErr.message); return; }
    setCoop(c as Coop);
    setMembers([{ user_id: user.id }]);
    setProduce([]);
    toast.success(`Created "${c.name}" — share code ${c.join_code}`);
  }

  async function joinCoop(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !code.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("join_cooperative_by_code", {
      _code: code.trim().toUpperCase(),
    });
    setBusy(false);
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) { toast.error(error?.message ?? "Invalid join code"); return; }
    const c = row as Coop;
    setCoop(c);
    toast.success(`Joined ${c.name}`);
    const [{ data: ms }, { data: pr }] = await Promise.all([
      supabase.from("cooperative_members").select("user_id").eq("cooperative_id", c.id),
      supabase.from("produce").select("user_id, crop, quantity, unit"),
    ]);
    setMembers((ms ?? []) as Member[]);
    const memberIds = new Set(((ms ?? []) as Member[]).map((m) => m.user_id));
    setProduce(((pr ?? []) as ProduceRow[]).filter((p) => memberIds.has(p.user_id)));
  }

  if (!coop) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Cooperative</h1>
          <p className="text-muted-foreground">Pool produce with other farmers to reach bigger buyers and better prices.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Create a cooperative</CardTitle><CardDescription>You'll get a code to share with other farmers.</CardDescription></CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={createCoop}>
                <div className="space-y-1"><Label>Cooperative name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jos Tomato Growers" required /></div>
                <Button type="submit" disabled={busy} className="w-full">Create</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Join with a code</CardTitle><CardDescription>Enter the 6-character code from your cooperative lead.</CardDescription></CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={joinCoop}>
                <div className="space-y-1"><Label>Join code</Label><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} required /></div>
                <Button type="submit" disabled={busy} variant="outline" className="w-full">Join</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Aggregated view
  const aggregate = CROPS.map((crop) => {
    const rows = produce.filter((p) => p.crop === crop);
    const total = rows.reduce((s, r) => s + Number(r.quantity), 0);
    const unit = rows[0]?.unit ?? MARKET[crop as Crop].unit;
    return { crop: crop as Crop, total, unit, contributors: rows.length };
  }).filter((r) => r.total > 0);

  const topCrop = aggregate.slice().sort((a, b) => b.total - a.total)[0];
  const groupRec = topCrop ? (() => {
    const best = bestCity(topCrop.crop);
    const price = MARKET[topCrop.crop].cityPrices[best];
    const grossRevenue = price * topCrop.total;
    return { best, price, grossRevenue };
  })() : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{coop.name}</h1>
          <p className="text-muted-foreground">
            {members.length} {members.length === 1 ? "member" : "members"} · Join code{" "}
            <button
              type="button"
              onClick={() => { navigator.clipboard?.writeText(coop.join_code); toast.success("Copied"); }}
              className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-0.5 font-mono text-sm"
            >
              {coop.join_code} <Copy className="h-3 w-3" />
            </button>
          </p>
        </div>
      </div>

      {groupRec && topCrop && (
        <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-accent/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Group Recommendation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed">
            <p>
              Your cooperative has <strong>{topCrop.total} {topCrop.unit}</strong> of {topCrop.crop.toLowerCase()} pooled across members.
              Selling together in <strong>{groupRec.best}</strong> at {formatNaira(groupRec.price)} per {MARKET[topCrop.crop].unit} could bring in a combined <strong>{formatNaira(groupRec.grossRevenue)}</strong> — a scale most individual farmers can't reach alone.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-earth" />
            <CardTitle>Aggregated Produce</CardTitle>
          </div>
          <CardDescription>Total volume across all cooperative members</CardDescription>
        </CardHeader>
        <CardContent>
          {aggregate.length === 0 ? (
            <p className="text-sm text-muted-foreground">No produce logged by members yet. Ask members to add produce in their My Dashboard.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Crop</th>
                    <th className="pb-2 font-medium">Total volume</th>
                    <th className="pb-2 font-medium">Contributors</th>
                    <th className="pb-2 font-medium">Best market</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregate.map((r) => {
                    const best = bestCity(r.crop);
                    const price = MARKET[r.crop].cityPrices[best];
                    return (
                      <tr key={r.crop} className="border-b last:border-0">
                        <td className="py-2 font-medium">{r.crop}</td>
                        <td className="py-2">{r.total} {r.unit}</td>
                        <td className="py-2"><Badge variant="secondary">{r.contributors}</Badge></td>
                        <td className="py-2">{best} · {formatNaira(price)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
