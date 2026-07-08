import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sprout } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — AgriSense AI" },
      { name: "description", content: "Sign in to your AgriSense AI farmer dashboard." },
      { property: "og:title", content: "Sign in — AgriSense AI" },
      { property: "og:description", content: "Sign in or create a free AgriSense AI account to track produce, sales and cooperative pooling." },
      { property: "og:url", content: "https://betamarketnaija.lovable.app/auth" },
      { name: "twitter:title", content: "Sign in — AgriSense AI" },
      { name: "twitter:description", content: "Sign in or create a free AgriSense AI account to track produce, sales and cooperative pooling." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://betamarketnaija.lovable.app/auth" }],
  }),
  component: AuthPage,
});

function phoneToEmail(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return `${digits}@phone.agrisense.local`;
}

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/my-dashboard" });
  }, [user, loading, navigate]);

  function resolvedEmail() {
    return mode === "email" ? identifier.trim() : phoneToEmail(identifier);
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: resolvedEmail(), password });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back!"); navigate({ to: "/my-dashboard" }); }
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const email = resolvedEmail();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: mode === "phone" ? { phone: identifier } : {},
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Account created — you're signed in."); navigate({ to: "/my-dashboard" }); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent/20 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sprout className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">AgriSense AI</CardTitle>
          <CardDescription>Sign in with email or phone number</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as "email" | "phone")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            <TabsContent value={mode} className="pt-4">
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <form className="space-y-4 pt-4" onSubmit={signIn}>
                    <div className="space-y-2">
                      <Label htmlFor="identifier">{mode === "email" ? "Email" : "Phone number"}</Label>
                      <Input
                        id="identifier"
                        type={mode === "email" ? "email" : "tel"}
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={mode === "email" ? "you@example.com" : "08012345678"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>Sign in</Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form className="space-y-4 pt-4" onSubmit={signUp}>
                    <div className="space-y-2">
                      <Label htmlFor="identifier2">{mode === "email" ? "Email" : "Phone number"}</Label>
                      <Input
                        id="identifier2"
                        type={mode === "email" ? "email" : "tel"}
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={mode === "email" ? "you@example.com" : "08012345678"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password2">Password (min 6 chars)</Label>
                      <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>Create account</Button>
                    {mode === "phone" && (
                      <p className="text-xs text-muted-foreground">
                        Prototype: phone accounts are stored securely without SMS verification. A production build would send an OTP via a Nigerian telco.
                      </p>
                    )}
                  </form>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
          <div className="pt-4 text-center text-sm text-muted-foreground">
            <Link to="/" className="underline">← Back to market dashboard</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
