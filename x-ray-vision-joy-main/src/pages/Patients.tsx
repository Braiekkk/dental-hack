import { useState } from "react";
import { Search, Plus, Phone, MapPin, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Patient {
  id: number;
  name: string;
  phone: string;
  city: string;
  dob: string;
  abnormalTeeth: number;
  lastVisit: string;
}

const mockPatients: Patient[] = [
  { id: 1, name: "rayen braiek", phone: "+216 55 123 456", city: "Sousse", dob: "1990-03-15", abnormalTeeth: 0, lastVisit: "2026-04-08" },
  { id: 2, name: "Ahmed Ben Ali", phone: "+216 22 789 012", city: "Tunis", dob: "1985-07-22", abnormalTeeth: 0, lastVisit: "2026-04-10" },
  { id: 3, name: "Mouna Triki", phone: "+216 98 345 678", city: "Sfax", dob: "1992-11-03", abnormalTeeth: 3, lastVisit: "2026-04-05" },
  { id: 4, name: "Youssef Trabelsi", phone: "+216 50 456 789", city: "Monastir", dob: "1978-01-19", abnormalTeeth: 1, lastVisit: "2026-03-28" },
  { id: 5, name: "Fatma Khelifi", phone: "+216 23 567 890", city: "Sousse", dob: "1995-09-11", abnormalTeeth: 0, lastVisit: "2026-04-11" },
  { id: 6, name: "Karim Mansouri", phone: "+216 55 678 901", city: "Kairouan", dob: "1988-12-25", abnormalTeeth: 4, lastVisit: "2026-04-01" },
];

export default function Patients() {
  const [search, setSearch] = useState("");
  const filtered = mockPatients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="soft-panel p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -top-14 -right-12 h-40 w-40 rounded-full bg-[#e8f4ff] blur-3xl" />
        <div className="absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-[#ffe8f4] blur-2xl" />
        <div className="relative flex items-end justify-between gap-4">
          <div>
            <h1 className="page-title">Patient Registry</h1>
            <p className="page-subtitle">{mockPatients.length} active records, with chart-linked medical history.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="shrink-0"><Plus className="mr-2 h-4 w-4" /> Add Patient</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">New Patient</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Full Name</Label><Input placeholder="Enter name" className="mt-1.5" /></div>
                  <div><Label>Phone</Label><Input placeholder="+216..." className="mt-1.5" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>City</Label><Input placeholder="City" className="mt-1.5" /></div>
                  <div><Label>Date of Birth</Label><Input type="date" className="mt-1.5" /></div>
                </div>
                <div><Label>Description</Label><Input placeholder="Notes..." className="mt-1.5" /></div>
                <Button className="w-full mt-2">Create Patient</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white/80"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((patient) => (
          <Link key={patient.id} to={`/patients/${patient.id}`} className="block">
            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/40 hover:-translate-y-0.5">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ffeef7] to-[#e9f6ff] border border-border/70 flex items-center justify-center font-display font-bold text-primary">
                      {patient.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {patient.phone}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {patient.city}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {patient.abnormalTeeth > 0 ? (
                    <Badge
                      variant="outline"
                      className="bg-warning/25 text-amber-900 border-amber-500/60 font-semibold shadow-sm"
                    >
                      {patient.abnormalTeeth} anomalies
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-emerald-100 text-emerald-900 border-emerald-500/60 font-semibold shadow-sm"
                    >
                      Healthy
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
