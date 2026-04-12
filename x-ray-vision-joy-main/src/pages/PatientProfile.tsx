import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Phone, MapPin, Calendar, FileText, Upload, Clock,
  MoreHorizontal, Pencil, Trash2, Plus, User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DentalChartSVG, ToothData, ToothStatus } from "@/components/DentalChartSVG";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock patient data
const mockPatientData = {
  1: {
    id: 1, name: "Sarah Johnson", phone: "+216 55 123 456", city: "Sousse",
    dob: "1990-03-15", address: "12 Rue de la Liberté, Sousse",
    work: "Teacher", description: "Regular checkup patient. Allergic to penicillin.",
    createdAt: "2024-06-15", abnormalTeeth: 2,
  },
  2: {
    id: 2, name: "Ahmed Ben Ali", phone: "+216 22 789 012", city: "Tunis",
    dob: "1985-07-22", address: "45 Avenue Habib Bourguiba, Tunis",
    work: "Engineer", description: "Bruxism history. Night guard recommended.",
    createdAt: "2024-08-20", abnormalTeeth: 0,
  },
  3: {
    id: 3, name: "Marie Dupont", phone: "+216 98 345 678", city: "Sfax",
    dob: "1992-11-03", address: "8 Rue des Oliviers, Sfax",
    work: "Pharmacist", description: "Orthodontic treatment in progress.",
    createdAt: "2025-01-10", abnormalTeeth: 3,
  },
  4: {
    id: 4, name: "Youssef Trabelsi", phone: "+216 50 456 789", city: "Monastir",
    dob: "1978-01-19", address: "23 Rue Ibn Khaldoun, Monastir",
    work: "Accountant", description: "Periodontal disease treatment.",
    createdAt: "2023-11-05", abnormalTeeth: 1,
  },
  5: {
    id: 5, name: "Fatma Khelifi", phone: "+216 23 567 890", city: "Sousse",
    dob: "1995-09-11", address: "67 Avenue de la République, Sousse",
    work: "Student", description: "Wisdom teeth monitoring.",
    createdAt: "2025-03-01", abnormalTeeth: 0,
  },
  6: {
    id: 6, name: "Omar Mansouri", phone: "+216 55 678 901", city: "Kairouan",
    dob: "1988-12-25", address: "15 Rue Okba Ibn Nafaa, Kairouan",
    work: "Merchant", description: "Multiple restorations needed. Smoker.",
    createdAt: "2024-02-14", abnormalTeeth: 4,
  },
} as Record<number, any>;

const mockTeeth: Record<number, ToothData[]> = {
  1: [
    { number: 14, status: "cavity", notes: "Mesial cavity, composite filling needed" },
    { number: 24, status: "filling", notes: "Composite filling placed 2025-12" },
    { number: 36, status: "crown", notes: "PFM crown, placed 2025-08" },
    { number: 38, status: "missing", notes: "Extracted 2024-11" },
  ],
  2: [],
  3: [
    { number: 11, status: "fracture", notes: "Enamel fracture, veneer recommended" },
    { number: 21, status: "fracture", notes: "Crown fracture" },
    { number: 46, status: "cavity", notes: "Large distal cavity" },
  ],
  4: [
    { number: 36, status: "impacted" },
  ],
  5: [
    { number: 38, status: "impacted", notes: "Monitoring — no symptoms" },
    { number: 48, status: "impacted", notes: "Monitoring — mild discomfort" },
  ],
  6: [
    { number: 14, status: "cavity" },
    { number: 15, status: "cavity" },
    { number: 26, status: "missing" },
    { number: 46, status: "filling", notes: "Amalgam filling, needs replacement" },
  ],
};

const mockVisits = [
  { date: "2026-04-08", type: "Checkup", dentist: "Dr. Sridi", notes: "Routine exam. No new issues found.", actions: ["Examination", "Scaling"] },
  { date: "2026-03-15", type: "Treatment", dentist: "Dr. Sridi", notes: "Composite filling on tooth #14.", actions: ["Filling", "Local Anesthesia"] },
  { date: "2026-02-20", type: "X-Ray", dentist: "Dr. Sridi", notes: "Panoramic X-ray taken. AI analysis performed.", actions: ["Panoramic X-Ray", "AI Analysis"] },
  { date: "2025-12-10", type: "Emergency", dentist: "Dr. Sridi", notes: "Patient presented with acute pain on tooth #24.", actions: ["Emergency Exam", "Temporary Filling", "Prescription"] },
  { date: "2025-11-01", type: "Checkup", dentist: "Dr. Sridi", notes: "Crown placement follow-up.", actions: ["Examination"] },
];

const mockFiles = [
  { name: "panoramic_xray_2026.dcm", type: "X-Ray", date: "2026-02-20", size: "4.2 MB" },
  { name: "ai_report_feb2026.pdf", type: "Report", date: "2026-02-20", size: "1.1 MB" },
  { name: "periapical_14.jpg", type: "X-Ray", date: "2026-03-15", size: "820 KB" },
  { name: "treatment_plan.pdf", type: "Document", date: "2025-12-10", size: "340 KB" },
  { name: "consent_form_signed.pdf", type: "Document", date: "2024-06-15", size: "210 KB" },
];

const visitTypeColors: Record<string, string> = {
  Checkup: "bg-success/10 text-success border-success/20",
  Treatment: "bg-primary/10 text-primary border-primary/20",
  "X-Ray": "bg-info/10 text-info border-info/20",
  Emergency: "bg-destructive/10 text-destructive border-destructive/20",
};

const fileTypeColors: Record<string, string> = {
  "X-Ray": "bg-info/10 text-info border-info/20",
  Report: "bg-warning/10 text-warning border-warning/20",
  Document: "bg-muted text-muted-foreground",
};

export default function PatientProfile() {
  const { id } = useParams();
  const patientId = parseInt(id || "1");
  const patient = mockPatientData[patientId] || mockPatientData[1];
  const patientTeethRaw = mockTeeth[patientId] || [];
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  // Build full 32 teeth array with statuses
  const allTeethNumbers = [
    18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
    38,37,36,35,34,33,32,31,41,42,43,44,45,46,47,48,
  ];
  const teethData: ToothData[] = allTeethNumbers.map((num) => {
    const found = patientTeethRaw.find((t) => t.number === num);
    return found || { number: num, status: "healthy" as ToothStatus };
  });

  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
  const anomalies = teethData.filter((t) => t.status !== "healthy");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/patients"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary text-lg">
              {patient.name.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{patient.name}</h1>
              <p className="text-sm text-muted-foreground">{age} years old · Patient since {new Date(patient.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
              <DropdownMenuItem>Upload X-Ray</DropdownMenuItem>
              <DropdownMenuItem>Export Records</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Patient</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
              <Phone className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{patient.phone}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
              <MapPin className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm font-medium">{patient.city}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
              <User className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Occupation</p>
              <p className="text-sm font-medium">{patient.work}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
              <Calendar className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="text-sm font-medium">{new Date(patient.dob).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {patient.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Notes:</span> {patient.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="teeth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teeth">Dental Chart</TabsTrigger>
          <TabsTrigger value="visits">Visit History</TabsTrigger>
          <TabsTrigger value="files">Medical Files</TabsTrigger>
        </TabsList>

        <TabsContent value="teeth">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-base">Interactive Dental Chart</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {teethData.filter(t => t.status === "healthy").length} Healthy
                    </Badge>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      {anomalies.length} Issues
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <DentalChartSVG
                  teeth={teethData}
                  selectedTooth={selectedTooth}
                  onToothClick={(tooth) => setSelectedTooth(tooth.number === selectedTooth ? null : tooth.number)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">
                  {selectedTooth ? `Tooth #${selectedTooth}` : "Tooth Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTooth ? (() => {
                  const tooth = teethData.find(t => t.number === selectedTooth)!;
                  const config = {
                    healthy: { label: "Healthy", badgeClass: "bg-success/10 text-success border-success/20" },
                    cavity: { label: "Cavity", badgeClass: "bg-destructive/10 text-destructive border-destructive/20" },
                    fracture: { label: "Fracture", badgeClass: "bg-warning/10 text-warning border-warning/20" },
                    missing: { label: "Missing", badgeClass: "bg-muted text-muted-foreground" },
                    implant: { label: "Implant", badgeClass: "bg-info/10 text-info border-info/20" },
                    crown: { label: "Crown", badgeClass: "bg-primary/10 text-primary border-primary/20" },
                    filling: { label: "Filling", badgeClass: "bg-accent text-accent-foreground" },
                    impacted: { label: "Impacted", badgeClass: "bg-warning/10 text-warning border-warning/20" },
                  }[tooth.status];
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={config.badgeClass}>{config.label}</Badge>
                      </div>
                      {tooth.notes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm">{tooth.notes}</p>
                        </div>
                      )}
                      <div className="pt-2 border-t space-y-2">
                        <Button size="sm" variant="outline" className="w-full justify-start">
                          <Pencil className="mr-2 h-3.5 w-3.5" /> Update Status
                        </Button>
                        <Button size="sm" variant="outline" className="w-full justify-start">
                          <FileText className="mr-2 h-3.5 w-3.5" /> Add Note
                        </Button>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Click on a tooth in the diagram to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visits">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="font-display text-base">Visit History</CardTitle>
              <Button size="sm"><Plus className="mr-2 h-3.5 w-3.5" /> Add Visit</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockVisits.map((visit, i) => (
                <div key={i} className="p-4 rounded-lg border hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground w-24 shrink-0">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(visit.date).toLocaleDateString()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={visitTypeColors[visit.type] || "bg-muted text-muted-foreground"}>
                            {visit.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{visit.dentist}</span>
                        </div>
                        <p className="text-sm mt-1">{visit.notes}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {visit.actions.map((action, j) => (
                            <Badge key={j} variant="secondary" className="text-[10px]">{action}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="font-display text-base">Medical Files</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm"><Upload className="mr-2 h-3.5 w-3.5" /> Upload File</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">Upload Medical File</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div><Label>File Name</Label><Input placeholder="File description..." className="mt-1.5" /></div>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Drag & drop or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DICOM, JPG, PNG — Max 50MB</p>
                    </div>
                    <Button className="w-full">Upload</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(file.date).toLocaleDateString()} · {file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={fileTypeColors[file.type] || "bg-muted text-muted-foreground"}>
                        {file.type}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
