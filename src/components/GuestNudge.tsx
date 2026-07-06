import { Link } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export function GuestNudge({ feature }: { feature: string }) {
  const { t } = useT();
  return (
    <Card className="mx-auto max-w-lg border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserPlus className="h-6 w-6" />
        </div>
        <p className="text-lg font-semibold">{feature}</p>
        <p className="text-sm text-muted-foreground">{t("guest.nudge")}</p>
        <Button asChild><Link to="/auth">{t("nav.signin")}</Link></Button>
      </CardContent>
    </Card>
  );
}
