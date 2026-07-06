import { Link } from "@tanstack/react-router";
import { Moon, Sun, Globe, LogIn, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme";
import { useT, LANGS, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export function TopBar() {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useT();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur">
      <SidebarTrigger />
      <span className="text-sm font-semibold text-foreground">AgriSense AI</span>
      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{LANGS.find(l => l.code === lang)?.label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {LANGS.map((l) => (
              <DropdownMenuItem key={l.code} onClick={() => setLang(l.code as Lang)}>
                {l.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {user ? (
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} className="gap-1">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.signout")}</span>
          </Button>
        ) : (
          <Button asChild size="sm" className="gap-1">
            <Link to="/auth">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">{t("nav.signin")}</span>
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
