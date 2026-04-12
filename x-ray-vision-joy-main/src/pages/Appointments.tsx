import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Appointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  patient: string;
  type: string;
  notes: string;
}

const mockAppointments: Appointment[] = [
  { id: 1, date: "2026-04-14", startTime: "09:00", endTime: "09:30", patient: "Sarah Johnson", type: "Checkup", notes: "" },
  { id: 2, date: "2026-04-14", startTime: "10:30", endTime: "11:30", patient: "Ahmed Ben Ali", type: "Root Canal", notes: "Second session" },
  { id: 3, date: "2026-04-15", startTime: "09:00", endTime: "10:00", patient: "Marie Dupont", type: "X-Ray", notes: "" },
  { id: 4, date: "2026-04-16", startTime: "14:00", endTime: "14:30", patient: "Youssef Trabelsi", type: "Cleaning", notes: "" },
  { id: 5, date: "2026-04-16", startTime: "15:30", endTime: "16:30", patient: "Fatma Khelifi", type: "Filling", notes: "Tooth #24" },
  { id: 6, date: "2026-04-17", startTime: "11:00", endTime: "11:30", patient: "Omar Mansouri", type: "Consultation", notes: "" },
  { id: 7, date: "2026-04-18", startTime: "09:00", endTime: "10:00", patient: "Sarah Johnson", type: "Follow-up", notes: "" },
];

const eventPastelColors = [
  "#e3f7ff",
  "#fef3c7",
  "#eceafe",
  "#fde2f3",
  "#dff6ff",
  "#fef3c7",
  "#eceafe",
  "#fde2f3",
];

function getWeekDates(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function Appointments() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 14));
  const weekDates = getWeekDates(currentDate);

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };
  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground text-sm mt-1">Weekly schedule view</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Appointment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Schedule Appointment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div><Label>Patient</Label>
                <Select><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sarah Johnson</SelectItem>
                    <SelectItem value="2">Ahmed Ben Ali</SelectItem>
                    <SelectItem value="3">Marie Dupont</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Date</Label><Input type="date" className="mt-1.5" /></div>
                <div><Label>Type</Label>
                  <Select><SelectTrigger className="mt-1.5"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkup">Checkup</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="xray">X-Ray</SelectItem>
                      <SelectItem value="filling">Filling</SelectItem>
                      <SelectItem value="root-canal">Root Canal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Time</Label><Input type="time" className="mt-1.5" /></div>
                <div><Label>End Time</Label><Input type="time" className="mt-1.5" /></div>
              </div>
              <div><Label>Notes</Label><Input placeholder="Optional notes..." className="mt-1.5" /></div>
              <Button className="w-full mt-2">Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="font-display text-lg">
            {weekDates[0].toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(2026, 3, 14))}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {weekDates.map((date, i) => {
              const dateStr = formatDate(date);
              const dayApts = mockAppointments.filter((a) => a.date === dateStr);
              const isToday = dateStr === "2026-04-14";

              return (
                <div key={i} className="min-h-[200px]">
                  <div
                    className={`text-center pb-3 mb-3 border-b ${
                      isToday ? "text-primary font-bold" : ""
                    }`}
                  >
                    <p className="text-xs text-muted-foreground">{daysOfWeek[i]}</p>
                    <p
                      className={`text-lg font-display ${
                        isToday
                          ? "bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto"
                          : ""
                      }`}
                    >
                      {date.getDate()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {dayApts.map((apt, eventIndex) => (
                      <div
                        key={apt.id}
                        className="p-2 rounded-md border text-xs space-y-1 hover:shadow-sm transition-shadow cursor-pointer"
                        style={{ backgroundColor: eventPastelColors[eventIndex % eventPastelColors.length] }}
                      >
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {apt.startTime}
                        </div>
                        <p className="font-medium truncate">{apt.patient}</p>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-card/70 text-foreground"
                        >
                          {apt.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
