import { CalendarDays, Users, Package, AlertTriangle, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const stats = [
  { label: "Today's Appointments", value: "8", icon: CalendarDays, change: "+2 from yesterday" },
  { label: "Total Patients", value: "1,247", icon: Users, change: "+12 this week" },
  { label: "Stock Items", value: "156", icon: Package, change: "3 low stock" },
  { label: "Pending Reports", value: "4", icon: AlertTriangle, change: "2 urgent" },
];

const todayAppointments = [
  { time: "09:00", patient: "rayen braiek", type: "Routine check-up", status: "completed" },
  { time: "10:30", patient: "Ahmed Ben Ali", type: "Emergency visit", status: "in-progress" },
  { time: "11:30", patient: "Marie Dupont", type: "Dental cleaning", status: "upcoming" },
  { time: "14:00", patient: "Youssef Trabelsi", type: "Filling", status: "upcoming" },
  { time: "15:30", patient: "Fatma Khelifi", type: "Tooth extraction", status: "upcoming" },
];

const lowStockItems = [
  { name: "Dental Composite A2", remaining: 3, threshold: 10 },
  { name: "Latex Gloves (M)", remaining: 12, threshold: 50 },
  { name: "Anesthetic Cartridges", remaining: 8, threshold: 20 },
];

const statusColors: Record<string, string> = {
  completed: "bg-muted text-muted-foreground",
  "in-progress": "bg-muted text-muted-foreground",
  upcoming: "bg-muted text-muted-foreground",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="soft-panel p-6 sm:p-7 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-[#ffe6f3]/80 blur-2xl" />
        <div className="absolute -bottom-12 right-20 h-28 w-28 rounded-full bg-[#dff4ff]/80 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="ribbon-chip mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Morning overview
            </p>
            <h1 className="page-title">Good to see you, Dr. Sridi</h1>
            <p className="page-subtitle">Your clinic is active with 8 appointments and 3 stock alerts today.</p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            Open Daily Brief <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-2xl font-display font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#fff2f8] to-[#e8f4ff] border border-border/70 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 soft-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="font-display text-lg">Today's Appointments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/appointments">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayAppointments.map((apt, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl border border-border/70 bg-card/85 hover:bg-accent/35 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground w-16 shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                  {apt.time}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{apt.patient}</p>
                  <p className="text-xs text-muted-foreground">{apt.type}</p>
                </div>
                <Badge variant="outline" className={statusColors[apt.status]}>
                  {apt.status === "in-progress" ? "In Progress" : apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="soft-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="font-display text-lg">Low Stock Alerts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/stock">
                Manage <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockItems.map((item, i) => (
              <div key={i} className="p-3 rounded-xl border bg-destructive/5 border-destructive/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="font-medium text-sm">{item.name}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {item.remaining} remaining (min: {item.threshold})
                  </p>
                  <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-destructive rounded-full"
                      style={{ width: `${(item.remaining / item.threshold) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
