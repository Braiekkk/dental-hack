import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ScanLine,
  Package,
  Truck,
  Settings,
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
];

const activePastelClasses = [
  "bg-[#e3f7ff] text-black font-medium",
  "bg-[#fef3c7] text-black font-medium",
  "bg-[#eceafe] text-black font-medium",
  "bg-[#fde2f3] text-black font-medium",
  "bg-[#dff6ff] text-black font-medium",
  "bg-[#fef3c7] text-black font-medium",
  "bg-[#eceafe] text-black font-medium",
  "bg-[#fde2f3] text-black font-medium",
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
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo.png" alt="Viewr logo" className="h-8 w-8 object-contain" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display text-lg font-bold text-black tracking-tight">
                Viewr
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Dental AI Suite</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
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
          <SidebarGroupLabel>Management</SidebarGroupLabel>
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
