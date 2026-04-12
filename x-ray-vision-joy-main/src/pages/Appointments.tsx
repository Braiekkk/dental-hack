import { useMemo, useState } from "react";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  type EventProps,
  type NavigateAction,
  type View,
  Views,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Plus, Clock, CalendarDays, UserRound } from "lucide-react";
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { APPOINTMENT_TYPES, type AppointmentTypeName } from "@/lib/appointment-types";

const localizer = momentLocalizer(moment);

interface Appointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  patient: string;
  type: AppointmentTypeName;
  notes: string;
}

interface AppointmentEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  patient: string;
  type: AppointmentTypeName;
  notes: string;
}

const mockAppointments: Appointment[] = [
  { id: 1, date: "2026-04-14", startTime: "09:00", endTime: "10:00", patient: "Sarah Johnson", type: "Routine check-up", notes: "" },
  { id: 2, date: "2026-04-14", startTime: "10:30", endTime: "11:30", patient: "Ahmed Ben Ali", type: "Emergency visit", notes: "Second session" },
  { id: 3, date: "2026-04-15", startTime: "09:00", endTime: "10:00", patient: "Marie Dupont", type: "Dental cleaning", notes: "" },
  { id: 4, date: "2026-04-16", startTime: "14:00", endTime: "15:00", patient: "Youssef Trabelsi", type: "Filling", notes: "" },
  { id: 5, date: "2026-04-16", startTime: "15:30", endTime: "16:30", patient: "Fatma Khelifi", type: "Filling", notes: "Tooth #24" },
  { id: 6, date: "2026-04-17", startTime: "11:00", endTime: "12:00", patient: "Omar Mansouri", type: "Tooth extraction", notes: "" },
  { id: 7, date: "2026-04-18", startTime: "09:00", endTime: "10:00", patient: "Sarah Johnson", type: "Routine check-up", notes: "" },
];

const eventPastelColors = ["#e3f7ff", "#fef3c7", "#eceafe", "#fde2f3", "#dff6ff"];

const appointmentTypeClass: Record<string, string> = {
  "Routine check-up": "bg-info/20 text-info-foreground border-info/30",
  "Dental cleaning": "bg-success/20 text-success-foreground border-success/30",
  Filling: "bg-primary/25 text-primary-foreground border-primary/35",
  "Emergency visit": "bg-warning/25 text-warning-foreground border-warning/35",
  "Tooth extraction": "bg-muted text-muted-foreground border-border/70",
};

function toEventDate(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function AppointmentEventCard({ event }: EventProps<AppointmentEvent>) {
  return (
    <div className="h-full w-full rounded-md px-2 py-1.5 overflow-hidden">
      <p className="truncate text-[11px] font-semibold">{event.patient}</p>
      <p className="truncate text-[10px] opacity-75">{event.type}</p>
    </div>
  );
}

export default function Appointments() {
  const isMobile = useIsMobile();
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 3, 14));
  const [calendarView, setCalendarView] = useState<View>(Views.WEEK);
  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(null);

  const calendarEvents = useMemo<AppointmentEvent[]>(
    () =>
      mockAppointments.map((appointment) => ({
        id: appointment.id,
        title: `${appointment.patient} - ${appointment.type}`,
        start: toEventDate(appointment.date, appointment.startTime),
        end: toEventDate(appointment.date, appointment.endTime),
        patient: appointment.patient,
        type: appointment.type,
        notes: appointment.notes,
      })),
    [],
  );

  const upcomingEvents = useMemo(
    () => [...calendarEvents].sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, 8),
    [calendarEvents],
  );

  const itemsPerView = isMobile ? 2 : 4;

  const eventPropGetter = (event: AppointmentEvent) => {
    const colorIndex = event.id % eventPastelColors.length;
    return {
      style: {
        backgroundColor: eventPastelColors[colorIndex],
        color: "#1f2937",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: "10px",
      },
    };
  };

  const handleNavigate = (newDate: Date, _view: View, _action: NavigateAction) => {
    setCalendarDate(newDate);
  };

  return (
    <div className="space-y-6">
      <div className="soft-panel p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -top-12 right-4 h-28 w-28 rounded-full bg-[#e4f8ef] blur-2xl" />
        <div className="absolute -bottom-12 right-20 h-36 w-36 rounded-full bg-[#e7f3ff] blur-3xl" />
        <div className="relative flex items-end justify-between gap-4">
          <div>
            <h1 className="page-title">Appointment Planner</h1>
            <p className="page-subtitle">Calendar-based scheduling with quick previews and patient-focused time blocks.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="shrink-0"><Plus className="mr-2 h-4 w-4" /> New Appointment</Button>
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
                        {APPOINTMENT_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
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
      </div>

      <Card className="soft-panel">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {upcomingEvents.length === 0 ? (
            <div className="flex h-28 items-center justify-center rounded-xl border border-dashed">
              <p className="text-sm text-muted-foreground">No appointments scheduled yet.</p>
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                slidesToScroll: itemsPerView,
              }}
              className="px-10"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {upcomingEvents.map((event) => (
                  <CarouselItem key={event.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4">
                    <div className="rounded-xl border border-border/70 bg-white/80 p-3 h-full space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={appointmentTypeClass[event.type] ?? "bg-muted text-muted-foreground border-border/70"}
                        >
                          {event.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{moment(event.start).format("ddd")}</span>
                      </div>
                      <p className="font-semibold text-sm line-clamp-1 flex items-center gap-1.5">
                        <UserRound className="h-3.5 w-3.5 text-muted-foreground" /> {event.patient}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {moment(event.start).format("MMM D, HH:mm")} - {moment(event.end).format("HH:mm")}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-1" />
              <CarouselNext className="right-1" />
            </Carousel>
          )}
        </CardContent>
      </Card>

      <Card className="soft-panel">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-display text-lg">Clinical Calendar</CardTitle>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button variant={calendarView === Views.DAY ? "default" : "outline"} size="sm" onClick={() => setCalendarView(Views.DAY)}>
              Day
            </Button>
            <Button variant={calendarView === Views.WEEK ? "default" : "outline"} size="sm" onClick={() => setCalendarView(Views.WEEK)}>
              Week
            </Button>
            <Button variant={calendarView === Views.MONTH ? "default" : "outline"} size="sm" onClick={() => setCalendarView(Views.MONTH)}>
              Month
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCalendarDate(new Date())}>
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-xl border border-border/70 bg-white/75 p-2 sm:p-3">
            <BigCalendar<AppointmentEvent>
              localizer={localizer}
              events={calendarEvents}
              date={calendarDate}
              view={calendarView}
              onView={setCalendarView}
              onNavigate={handleNavigate}
              startAccessor="start"
              endAccessor="end"
              step={30}
              timeslots={2}
              min={new Date(2026, 0, 1, 8, 0)}
              max={new Date(2026, 0, 1, 19, 0)}
              views={[Views.DAY, Views.WEEK, Views.MONTH]}
              toolbar={false}
              allDayAccessor={() => false}
              popup
              selectable
              className="rounded-lg"
              style={{ height: isMobile ? 640 : 760 }}
              components={{ event: AppointmentEventCard }}
              eventPropGetter={eventPropGetter}
              onSelectEvent={(event) => setSelectedEvent(event)}
              formats={{
                dayHeaderFormat: (date) => moment(date).format("ddd, MMM D"),
                dayRangeHeaderFormat: ({ start, end }) => `${moment(start).format("MMM D")} - ${moment(end).format("MMM D, YYYY")}`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{selectedEvent.patient}</p>
                <Badge variant="outline" className={appointmentTypeClass[selectedEvent.type] ?? "bg-muted text-muted-foreground border-border/70"}>
                  {selectedEvent.type}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {moment(selectedEvent.start).format("dddd, MMMM D, YYYY")}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {moment(selectedEvent.start).format("HH:mm")} - {moment(selectedEvent.end).format("HH:mm")}
              </p>
              <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
                {selectedEvent.notes ? selectedEvent.notes : "No notes for this appointment."}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
