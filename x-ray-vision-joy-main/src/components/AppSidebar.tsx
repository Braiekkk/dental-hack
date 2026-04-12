import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ScanLine,
  Package,
  Truck,
  Tags,
  Settings,
  Sparkles,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Patients", url: "/patients", icon: Users },
  { title: "Appointments", url: "/appointments", icon: CalendarDays },
  { title: "X-Ray Analysis", url: "/xray", icon: ScanLine },
];

const managementNav = [
  { title: "Stock", url: "/stock", icon: Package },
  { title: "Suppliers", url: "/suppliers", icon: Truck },
  { title: "Appointment Types", url: "/appointment-types", icon: Tags },
];

const activePastelClasses = [
  "bg-sidebar-primary/65 text-sidebar-primary-foreground font-semibold shadow-[0_10px_22px_-18px_rgba(219,39,119,0.7)]",
  "bg-sidebar-primary/65 text-sidebar-primary-foreground font-semibold shadow-[0_10px_22px_-18px_rgba(219,39,119,0.7)]",
  "bg-sidebar-primary/65 text-sidebar-primary-foreground font-semibold shadow-[0_10px_22px_-18px_rgba(219,39,119,0.7)]",
  "bg-sidebar-primary/65 text-sidebar-primary-foreground font-semibold shadow-[0_10px_22px_-18px_rgba(219,39,119,0.7)]",
  "bg-sidebar-primary/65 text-sidebar-primary-foreground font-semibold shadow-[0_10px_22px_-18px_rgba(219,39,119,0.7)]",
  "bg-sidebar-primary/65 text-sidebar-primary-foreground font-semibold shadow-[0_10px_22px_-18px_rgba(219,39,119,0.7)]",
  "bg-sidebar-primary/65 text-sidebar-primary-foreground font-semibold shadow-[0_10px_22px_-18px_rgba(219,39,119,0.7)]",
  "bg-sidebar-primary/65 text-sidebar-primary-foreground font-semibold shadow-[0_10px_22px_-18px_rgba(219,39,119,0.7)]",
];

const getActiveClassByIndex = (index: number) =>
  activePastelClasses[index % activePastelClasses.length];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/70 bg-sidebar/90">
      <SidebarHeader className="p-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ffe8f3] to-[#dff4ff] border border-sidebar-border/70 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo.png" alt="DentalFlow logo" className="h-8 w-8 object-contain" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display text-lg font-semibold text-sidebar-foreground tracking-tight">
                DentalFlow
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Dental Intelligence</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mt-4 rounded-xl border border-sidebar-border/70 bg-gradient-to-r from-[#fff5fb] to-[#eef8ff] p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-sidebar-foreground/65">Today</p>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-sidebar-foreground">
              <Sparkles className="h-3.5 w-3.5 text-sidebar-primary-foreground" />
              4 reports pending review
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-[0.12em] text-[11px]">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      activeClassName={getActiveClassByIndex(index)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-[0.12em] text-[11px]">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNav.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      activeClassName={getActiveClassByIndex(mainNav.length + index)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                activeClassName={getActiveClassByIndex(mainNav.length + managementNav.length)}
              >
                <Settings className="h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
