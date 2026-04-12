import { CalendarDays, Users, Package, AlertTriangle, Clock, ArrowRight } from "lucide-react";
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
  { time: "09:00", patient: "Sarah Johnson", type: "Checkup", status: "completed" },
  { time: "10:30", patient: "Ahmed Ben Ali", type: "Root Canal", status: "in-progress" },
  { time: "11:30", patient: "Marie Dupont", type: "X-Ray Analysis", status: "upcoming" },
  { time: "14:00", patient: "Youssef Trabelsi", type: "Cleaning", status: "upcoming" },
  { time: "15:30", patient: "Fatma Khelifi", type: "Filling", status: "upcoming" },
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
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, Dr. Sridi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-display font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
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
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
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

        <Card>
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
              <div key={i} className="p-3 rounded-lg border bg-destructive/5 border-destructive/20">
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
