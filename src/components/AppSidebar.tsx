import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LineChart, MessageCircle, User, Users, Smartphone, Sprout, Stethoscope } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useT } from "@/lib/i18n";

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const { t } = useT();

  const items = [
    { key: "nav.dashboard", url: "/", icon: LayoutDashboard },
    { key: "nav.analytics", url: "/analytics", icon: LineChart },
    { key: "nav.chat", url: "/chat", icon: MessageCircle },
    { key: "nav.doctor", url: "/crop-doctor", icon: Stethoscope },
    { key: "nav.my", url: "/my-dashboard", icon: User },
    { key: "nav.coop", url: "/my-cooperative", icon: Users },
    { key: "nav.ussd", url: "/ussd", icon: Smartphone },
  ] as const;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sprout className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-sidebar-foreground">AgriSense AI</span>
            <span className="text-xs text-sidebar-foreground/70">{t("nav.tagline")}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.key)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
