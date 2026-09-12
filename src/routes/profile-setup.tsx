import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sprout } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import { GuestNudge } from "@/components/GuestNudge";
import { CITIES, CROPS, type City, type Crop } from "@/lib/market-data";

export const Route = createFileRoute("/profile-setup")({
  head: () => ({
    meta: [
      { title: "Complete Your Profile — AgriSense AI" },
      { name: "description", content: "Set up your AgriSense AI farmer profile: name, city and primary crop." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfileSetup,
});

function ProfileSetup() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, tCrop } = useT();
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState(false);

  // If the profile is already complete, skip straight to the dashboard.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("name").eq("user_id", user.id).maybeSingle();
      if (data?.name) navigate({ to: "/my-dashboard" });
      else setChecked(true);
    })();
  }, [user, navigate]);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const fd = new FormData(e.currentTarget);
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
    else {
      toast.success(t("toast.profileSaved"));
      navigate({ to: "/my-dashboard" });
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground">{t("misc.loading")}</div>;
  if (!user) return <div className="p-6"><GuestNudge feature="Profile setup" /></div>;
  if (!checked) return <div className="p-8 text-muted-foreground">{t("misc.loading")}</div>;

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sprout className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">{t("card.completeProfile")}</CardTitle>
          <CardDescription>{t("misc.completeProfileDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={saveProfile}>
            <div className="space-y-2">
              <Label htmlFor="name">{t("label.name")}</Label>
              <Input id="name" name="name" required placeholder={t("ph.name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("label.phoneOpt")}</Label>
              <Input id="phone" name="phone" type="tel" placeholder="08012345678" />
            </div>
            <div className="space-y-2">
              <Label>{t("label.city")}</Label>
              <Select name="city" defaultValue="Abuja">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("label.primaryCrop")}</Label>
              <Select name="primary_crop" defaultValue="Tomatoes">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CROPS.map((c) => <SelectItem key={c} value={c}>{tCrop(c)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={busy} className="w-full">{t("btn.saveProfile")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
