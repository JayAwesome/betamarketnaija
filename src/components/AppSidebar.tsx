import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LineChart, MessageCircle, User, Sprout, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "AI Assistant", url: "/chat", icon: MessageCircle },
  { title: "My Dashboard", url: "/my-dashboard", icon: User },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sprout className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-sidebar-foreground">AgriSense AI</span>
            <span className="text-xs text-sidebar-foreground/70">Market Intelligence</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {user ? (
          <div className="flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
            <span className="truncate text-xs text-sidebar-foreground/80">{user.email}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => supabase.auth.signOut()}
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        ) : (
          <Button asChild size="sm" className="w-full group-data-[collapsible=icon]:hidden">
            <Link to="/auth">Sign in</Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
