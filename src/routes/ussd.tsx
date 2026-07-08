import { createFileRoute, Link } from "@tanstack/react-router";
import { Smartphone, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/ussd")({
  head: () => ({
    meta: [
      { title: "USSD & SMS Demo — AgriSense AI" },
      { name: "description", content: "Concept mockup showing how AgriSense AI could reach farmers without smartphones via USSD shortcodes and SMS." },
      { property: "og:title", content: "USSD & SMS Access — AgriSense AI" },
      { property: "og:description", content: "Conceptual mockup of USSD shortcode and SMS delivery for farmers without smartphones or reliable data." },
      { property: "og:url", content: "https://betamarketnaija.lovable.app/ussd" },
      { name: "twitter:title", content: "USSD & SMS Access — AgriSense AI" },
      { name: "twitter:description", content: "Conceptual mockup of USSD shortcode and SMS delivery for farmers without smartphones or reliable data." },
    ],
    links: [{ rel: "canonical", href: "https://betamarketnaija.lovable.app/ussd" }],
  }),
  component: UssdPage,
});

function UssdPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">USSD & SMS Demo</h1>
        <p className="text-muted-foreground">Reach farmers who don't have smartphones or reliable data.</p>
      </div>

      <Card className="border-warning/50 bg-warning/5">
        <CardContent className="flex items-start gap-3 p-4 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p><strong>Concept mockup — not a live telecom integration.</strong> This screen illustrates how AgriSense AI would deliver market intelligence over USSD/SMS in a production deployment (partnering with a Nigerian telco).</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle>Dial *347*AGRI#</CardTitle>
            </div>
            <CardDescription>Feature-phone menu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto max-w-sm rounded-3xl border-4 border-foreground/20 bg-foreground p-4 text-primary-foreground shadow-xl">
              <div className="rounded-lg bg-black/60 p-4 font-mono text-sm text-green-300">
                <div className="mb-2 text-xs text-green-200/60">MTN · Nigeria · 09:42</div>
                <pre className="whitespace-pre-wrap leading-relaxed">
{`AgriSense AI
============
Welcome, Musa.

1. Today's price
2. Best market
3. Set alert
4. My cooperative
5. Change language
0. Exit

Reply: 1`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample SMS reply</CardTitle>
              <CardDescription>After selecting "1. Today's price"</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-primary/10 p-4 text-sm">
                <Badge className="mb-2">AgriSense</Badge>
                <p className="leading-relaxed">
                  Tomatoes today: Lagos ₦31,410 (highest), Kano ₦16,290 (lowest).
                  Price falling this week, rebound expected in 3 weeks. If you can store, HOLD.
                  Reply STOP to unsubscribe.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why USSD/SMS matters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Over <strong>60% of Nigerian smallholder farmers</strong> use feature phones. A web-only app locks them out of the very information they need most.</p>
              <p>USSD works on every GSM phone, requires no data, and costs cents per session — the right last mile for market intelligence.</p>
              <p className="text-muted-foreground text-xs">Same recommendations. Same live data (<Link to="/" className="underline">see dashboard</Link>). Delivered where the farmers actually are.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
