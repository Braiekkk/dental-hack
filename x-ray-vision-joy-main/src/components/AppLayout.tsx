import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-transparent">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="topbar-glass border-b border-border/70 px-4 sm:px-6 py-3 shrink-0 sticky top-0 z-20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9 rounded-xl border border-border/80 bg-background/90" />
                <div className="hidden sm:block">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Clinic Pulse</p>
                  <p className="text-sm font-semibold text-foreground">{today}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="grain-overlay space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
