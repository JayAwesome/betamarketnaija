import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Phone, MessageCircle, Info } from "lucide-react";
import { findBuyerContacts, waLink, telLink, type BuyerContact } from "@/lib/buyer-contacts";
import type { City, Crop } from "@/lib/market-data";

function ContactCard({ b, priority }: { b: BuyerContact; priority: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-semibold">{b.business_name}</span>
          <Badge variant="secondary" className="text-xs">{b.contact_type}</Badge>
          {priority && (
            <Badge className="bg-success text-success-foreground text-xs">Buys this crop</Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{b.name}</div>
        <div className="text-xs text-muted-foreground">{b.phone_number}</div>
      </div>
      <div className="flex gap-2 sm:shrink-0">
        <Button asChild size="sm" variant="outline" className="gap-1">
          <a href={telLink(b.phone_number)} aria-label={`Call ${b.business_name}`}>
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
        </Button>
        <Button asChild size="sm" className="gap-1 bg-success text-success-foreground hover:bg-success/90">
          <a
            href={waLink(b.phone_number)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${b.business_name}`}
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}

export function BuyerContacts({ city, crop }: { city: City; crop: Crop }) {
  const { matches, others } = findBuyerContacts(city, crop);
  const hasAny = matches.length + others.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Buyer Contacts in {city}</CardTitle>
        </div>
        <CardDescription>
          Reach out directly once you decide where to sell. Contacts specializing in {crop.toLowerCase()} appear first.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasAny && (
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            No buyer contacts listed for {crop.toLowerCase()} in {city} yet.
          </p>
        )}

        {matches.length > 0 && (
          <div className="space-y-2">
            {matches.map((b) => <ContactCard key={b.id} b={b} priority />)}
          </div>
        )}

        {matches.length === 0 && others.length > 0 && (
          <p className="text-xs text-muted-foreground">
            No buyers in {city} list {crop.toLowerCase()} as a specialty — showing other active buyers here who may still be worth contacting.
          </p>
        )}

        {others.length > 0 && (
          <div className="space-y-2">
            {others.map((b) => <ContactCard key={b.id} b={b} priority={false} />)}
          </div>
        )}

        <div className="flex items-start gap-2 rounded-md border border-dashed border-warning/50 bg-warning/5 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <p>
            Sample contacts for demo purposes. In production this would connect to verified buyers,
            cooperatives, and commodity exchanges (NBS, AFEX, and state agricultural boards).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
