import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Phone, MapPin, Calendar, FileText, Upload, Clock,
  MoreHorizontal, Pencil, Trash2, Plus, User, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DentalChartSVG, ToothData } from "@/components/DentalChartSVG";
import { TOOTH_STATUS_CLASSES, TOOTH_STATUS_META, type ToothStatus } from "@/lib/tooth-status";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APPOINTMENT_TYPES } from "@/lib/appointment-types";
import { analyzeDentalImage } from "@/lib/patient-status-api";

// Mock patient data
const mockPatientData = {
  1: {
    id: 1, name: "rayen braiek", phone: "+216 55 123 456", city: "Sousse",
    dob: "1990-03-15", address: "12 Rue de la Liberté, Sousse",
    work: "Teacher", description: "Regular checkup patient. Allergic to penicillin.",
    createdAt: "2024-06-15", abnormalTeeth: 0,
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
  1: [],
  2: [],
  3: [
    { number: 11, status: "root_piece", notes: "Root piece visible, evaluate restoration" },
    { number: 21, status: "post_abutment", notes: "Post-abutment present" },
    { number: 46, status: "caries", notes: "Large distal caries" },
  ],
  4: [
    { number: 36, status: "impacted_tooth" },
  ],
  5: [
    { number: 38, status: "impacted_tooth", notes: "Monitoring — no symptoms" },
    { number: 48, status: "impacted_tooth", notes: "Monitoring — mild discomfort" },
  ],
  6: [
    { number: 14, status: "caries" },
    { number: 15, status: "caries" },
    { number: 26, status: "missing_teeth" },
    { number: 46, status: "filling", notes: "Amalgam filling, needs replacement" },
  ],
};

interface VisitHistoryItem {
  date: string;
  time: string;
  type: string;
  description?: string;
  attachments?: string[];
  tags?: string[];
}

const mockVisits: VisitHistoryItem[] = [
  { date: "2026-04-08", time: "09:30", type: "Routine check-up", description: "Routine exam. No new issues found." },
  { date: "2026-03-15", time: "11:00", type: "Filling", description: "Composite filling on tooth #14." },
  { date: "2026-02-20", time: "10:15", type: "Dental cleaning", description: "Comprehensive cleaning session completed." },
  { date: "2025-12-10", time: "16:40", type: "Emergency visit", description: "Patient presented with acute pain on tooth #24." },
  { date: "2025-11-01", time: "08:45", type: "Tooth extraction", description: "Extraction follow-up with normal healing." },
];

const mockFiles = [
  { name: "panoramic_xray_2026.dcm", type: "X-Ray", date: "2026-02-20", size: "4.2 MB" },
  { name: "ai_report_feb2026.pdf", type: "Report", date: "2026-02-20", size: "1.1 MB" },
  { name: "periapical_14.jpg", type: "X-Ray", date: "2026-03-15", size: "820 KB" },
  { name: "treatment_plan.pdf", type: "Document", date: "2025-12-10", size: "340 KB" },
  { name: "consent_form_signed.pdf", type: "Document", date: "2024-06-15", size: "210 KB" },
];

const visitTypeColors: Record<string, string> = {
  "Routine check-up": "bg-sky-100 text-sky-900 border-sky-400/70 font-semibold",
  "Dental cleaning": "bg-emerald-100 text-emerald-900 border-emerald-400/70 font-semibold",
  Filling: "bg-amber-100 text-amber-900 border-amber-400/70 font-semibold",
  "Emergency visit": "bg-destructive/10 text-destructive border-destructive/20",
  "Tooth extraction": "bg-muted text-muted-foreground border-border/70",
};

const fileTypeColors: Record<string, string> = {
  "X-Ray": "bg-info/10 text-info border-info/20",
  Report: "bg-warning/10 text-warning border-warning/20",
  Document: "bg-muted text-muted-foreground",
};

const apiClassToToothStatus: Record<string, ToothStatus> = {
  healthy: "healthy",
  "bone loss": "bone_loss",
  caries: "caries",
  cavity: "caries",
  crown: "crown",
  filling: "filling",
  "impacted tooth": "impacted_tooth",
  implant: "implant",
  "missing tooth": "missing_teeth",
  "missing teeth": "missing_teeth",
  missing: "missing_teeth",
  extracted: "missing_teeth",
  "periapical lesion": "periapical_lesion",
  "post abutment": "post_abutment",
  "root piece": "root_piece",
  "root canal treatment": "root_canal_treatment",
  rct: "root_canal_treatment",
  endodontic: "root_canal_treatment",
};

const normalizeStatusFromApi = (value: string): ToothStatus | null => {
  const normalized = value.trim().toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");
  return apiClassToToothStatus[normalized] ?? null;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

export default function PatientProfile() {
  const { id } = useParams();
  const patientId = parseInt(id || "1");
  const patient = mockPatientData[patientId] || mockPatientData[1];
  const patientTeethRaw = mockTeeth[patientId] || [];
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [medicalFiles, setMedicalFiles] = useState(mockFiles);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  const [fileDescription, setFileDescription] = useState("");
  const [selectedMedicalFile, setSelectedMedicalFile] = useState<File | null>(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string | null>(null);
  const [visits, setVisits] = useState<VisitHistoryItem[]>(mockVisits);
  const [isAddToothNoteOpen, setIsAddToothNoteOpen] = useState(false);
  const [newToothNote, setNewToothNote] = useState("");
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [isEditVisitOpen, setIsEditVisitOpen] = useState(false);
  const [editingVisitIndex, setEditingVisitIndex] = useState<number | null>(null);
  const [newVisit, setNewVisit] = useState<{
    date: string;
    time: string;
    type: string;
  }>({
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    type: APPOINTMENT_TYPES[0].name,
  });
  const [editVisit, setEditVisit] = useState<{
    date: string;
    time: string;
    type: string;
    description: string;
    tagsText: string;
    attachments: string[];
  }>({
    date: "",
    time: "09:00",
    type: APPOINTMENT_TYPES[0].name,
    description: "",
    tagsText: "",
    attachments: [],
  });

  // Build full 32 teeth array with statuses
  const allTeethNumbers = [
    18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
    38,37,36,35,34,33,32,31,41,42,43,44,45,46,47,48,
  ];
  const [teethData, setTeethData] = useState<ToothData[]>(() =>
    allTeethNumbers.map((num) => {
      const found = patientTeethRaw.find((t) => t.number === num);
      return found || { number: num, status: "healthy" as ToothStatus };
    })
  );

  const handleToothStatusChange = (toothNumber: number, nextStatus: ToothStatus) => {
    setTeethData((current) =>
      current.map((tooth) =>
        tooth.number === toothNumber ? { ...tooth, status: nextStatus } : tooth
      )
    );
  };

  const handleOpenAddToothNote = () => {
    if (selectedTooth === null) {
      return;
    }

    const currentNote = teethData.find((tooth) => tooth.number === selectedTooth)?.notes ?? "";
    setNewToothNote(currentNote);
    setIsAddToothNoteOpen(true);
  };

  const handleSaveToothNote = () => {
    if (selectedTooth === null) {
      return;
    }

    const note = newToothNote.trim();
    setTeethData((current) =>
      current.map((tooth) =>
        tooth.number === selectedTooth
          ? { ...tooth, notes: note.length > 0 ? note : undefined }
          : tooth
      )
    );
    setIsAddToothNoteOpen(false);
  };

  const handleAddVisit = () => {
    if (!newVisit.date || !newVisit.time || !newVisit.type) {
      return;
    }

    const visitToAdd: VisitHistoryItem = {
      date: newVisit.date,
      time: newVisit.time,
      type: newVisit.type,
    };

    setVisits((current) =>
      [...current, visitToAdd].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );

    setIsAddVisitOpen(false);
    setNewVisit({
      date: new Date().toISOString().slice(0, 10),
      time: "09:00",
      type: APPOINTMENT_TYPES[0].name,
    });
  };

  const getAddVisitDateTimeValue = () => {
    if (!newVisit.date) return "";
    return `${newVisit.date}T${newVisit.time || "09:00"}`;
  };

  const handleAddVisitDateTimeChange = (value: string) => {
    if (!value) {
      setNewVisit((current) => ({ ...current, date: "", time: "" }));
      return;
    }

    const [date, time] = value.split("T");
    setNewVisit((current) => ({
      ...current,
      date,
      time: time?.slice(0, 5) || "09:00",
    }));
  };

  const handleOpenEditVisit = (visit: VisitHistoryItem, index: number) => {
    setEditingVisitIndex(index);
    setEditVisit({
      date: visit.date,
      time: visit.time,
      type: visit.type,
      description: visit.description ?? "",
      tagsText: (visit.tags ?? []).join(" "),
      attachments: visit.attachments ?? [],
    });
    setIsEditVisitOpen(true);
  };

  const handleEditVisitFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []).map((file) => file.name);
    if (selectedFiles.length === 0) return;

    setEditVisit((current) => ({
      ...current,
      attachments: Array.from(new Set([...current.attachments, ...selectedFiles])),
    }));
  };

  const handleRemoveEditAttachment = (fileName: string) => {
    setEditVisit((current) => ({
      ...current,
      attachments: current.attachments.filter((attachment) => attachment !== fileName),
    }));
  };

  const handleSaveEditedVisit = () => {
    if (editingVisitIndex === null || !editVisit.date || !editVisit.time || !editVisit.type) {
      return;
    }

    const parsedTags = editVisit.tagsText
      .split(/\s+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    const updatedVisit: VisitHistoryItem = {
      date: editVisit.date,
      time: editVisit.time,
      type: editVisit.type,
      description: editVisit.description.trim(),
      attachments: editVisit.attachments,
      tags: parsedTags,
    };

    setVisits((current) =>
      current
        .map((visit, index) => (index === editingVisitIndex ? updatedVisit : visit))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );

    setIsEditVisitOpen(false);
    setEditingVisitIndex(null);
  };

  const handleUploadAndAnalyzeMedicalFile = async () => {
    if (!selectedMedicalFile) {
      return;
    }

    setIsAnalyzingFile(true);
    setUploadStatusMessage(null);

    try {
      const results = await analyzeDentalImage(selectedMedicalFile);

      const findingsByTooth = new Map<number, ToothStatus>();
      for (const item of results) {
        const toothNumber = Number.parseInt(item.tooth_number, 10);
        const status = normalizeStatusFromApi(item.class);
        if (!Number.isInteger(toothNumber) || status === null) {
          continue;
        }
        findingsByTooth.set(toothNumber, status);
      }

      if (findingsByTooth.size > 0) {
        setTeethData((current) =>
          current.map((tooth) => {
            const nextStatus = findingsByTooth.get(tooth.number);
            return nextStatus ? { ...tooth, status: nextStatus } : tooth;
          })
        );
      }

      const extension = selectedMedicalFile.name.split(".").pop()?.toLowerCase() ?? "";
      const isXRayType = ["png", "jpg", "jpeg", "bmp", "dcm", "dicom", "webp"].includes(extension);

      setMedicalFiles((current) => [
        {
          name: fileDescription.trim() || selectedMedicalFile.name,
          type: isXRayType ? "X-Ray" : "Document",
          date: new Date().toISOString().slice(0, 10),
          size: formatBytes(selectedMedicalFile.size),
        },
        ...current,
      ]);

      const statusText = findingsByTooth.size > 0
        ? `Analysis complete. Updated ${findingsByTooth.size} tooth status${findingsByTooth.size > 1 ? "es" : ""}.`
        : "Analysis complete. No recognized tooth status updates in response.";

      setUploadStatusMessage(statusText);
      setFileDescription("");
      setSelectedMedicalFile(null);
      setIsUploadFileOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "File analysis failed.";
      setUploadStatusMessage(message);
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
  const anomalies = teethData.filter((t) => t.status !== "healthy");

  return (
    <div className="space-y-6">
      <div className="soft-panel p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute -top-16 right-4 h-40 w-40 rounded-full bg-[#e8f4ff] blur-3xl" />
        <div className="absolute -bottom-14 left-8 h-32 w-32 rounded-full bg-[#ffe9f5] blur-3xl" />
        <div className="relative flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/patients"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#ffeef7] to-[#e9f6ff] border border-border/70 flex items-center justify-center font-display font-bold text-primary text-lg">
                {patient.name.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div>
                <h1 className="page-title">{patient.name}</h1>
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
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300">
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
                  const statusMeta = TOOTH_STATUS_META[tooth.status];
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={statusMeta.badgeClass}>{statusMeta.label}</Badge>
                      </div>
                      <div>
                        <Label htmlFor="tooth-status" className="text-xs text-muted-foreground">Status Class</Label>
                        <Select
                          value={tooth.status}
                          onValueChange={(value) => handleToothStatusChange(tooth.number, value as ToothStatus)}
                        >
                          <SelectTrigger id="tooth-status" className="mt-1.5">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {TOOTH_STATUS_CLASSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {TOOTH_STATUS_META[status].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {tooth.notes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm">{tooth.notes}</p>
                        </div>
                      )}
                      <div className="pt-2 border-t space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={handleOpenAddToothNote}
                        >
                          <FileText className="mr-2 h-3.5 w-3.5" /> Add Note
                        </Button>
                      </div>
                      <Dialog open={isAddToothNoteOpen} onOpenChange={setIsAddToothNoteOpen}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="font-display">Tooth #{selectedTooth} Note</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-2">
                            <div>
                              <Label htmlFor="tooth-note">Note</Label>
                              <Textarea
                                id="tooth-note"
                                className="mt-1.5 min-h-[110px]"
                                value={newToothNote}
                                onChange={(e) => setNewToothNote(e.target.value)}
                                placeholder="Add clinical note for this tooth..."
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsAddToothNoteOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSaveToothNote}>Save Note</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
          <Dialog open={isEditVisitOpen} onOpenChange={setIsEditVisitOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">Edit Appointment</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div>
                  <Label htmlFor="edit-visit-date">Visit Date</Label>
                  <Input
                    id="edit-visit-date"
                    type="date"
                    className="mt-1.5"
                    value={editVisit.date}
                    onChange={(e) => setEditVisit((current) => ({ ...current, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-visit-time">Visit Time</Label>
                  <Input
                    id="edit-visit-time"
                    type="time"
                    className="mt-1.5"
                    value={editVisit.time}
                    onChange={(e) => setEditVisit((current) => ({ ...current, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-visit-type">Visit Type</Label>
                  <Select
                    value={editVisit.type}
                    onValueChange={(value) => setEditVisit((current) => ({ ...current, type: value }))}
                  >
                    <SelectTrigger id="edit-visit-type" className="mt-1.5">
                      <SelectValue placeholder="Select visit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPOINTMENT_TYPES.map((appointmentType) => (
                        <SelectItem key={appointmentType.id} value={appointmentType.name}>
                          {appointmentType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-visit-description">Description</Label>
                  <Textarea
                    id="edit-visit-description"
                    className="mt-1.5 min-h-24"
                    placeholder="Appointment details..."
                    value={editVisit.description}
                    onChange={(e) => setEditVisit((current) => ({ ...current, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-visit-tags">Tags (space separated)</Label>
                  <Input
                    id="edit-visit-tags"
                    className="mt-1.5"
                    placeholder="urgent followup xrays"
                    value={editVisit.tagsText}
                    onChange={(e) => setEditVisit((current) => ({ ...current, tagsText: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-visit-files">Upload Files</Label>
                  <Input
                    id="edit-visit-files"
                    type="file"
                    className="mt-1.5"
                    multiple
                    onChange={handleEditVisitFiles}
                  />
                  {editVisit.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {editVisit.attachments.map((fileName) => (
                        <Badge key={fileName} variant="outline" className="gap-2 pr-1">
                          <span className="max-w-40 truncate">{fileName}</span>
                          <button
                            type="button"
                            className="rounded px-1 text-muted-foreground hover:bg-accent"
                            onClick={() => handleRemoveEditAttachment(fileName)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  className="w-full"
                  onClick={handleSaveEditedVisit}
                  disabled={!editVisit.date || !editVisit.time || !editVisit.type}
                >
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="font-display text-base">Visit History</CardTitle>
              <Dialog open={isAddVisitOpen} onOpenChange={setIsAddVisitOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-3.5 w-3.5" /> Add Visit</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">Add Visit History</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div>
                      <Label htmlFor="visit-date-time">Visit Date & Time</Label>
                      <Input
                        id="visit-date-time"
                        type="datetime-local"
                        className="mt-1.5"
                        value={getAddVisitDateTimeValue()}
                        onChange={(e) => handleAddVisitDateTimeChange(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="visit-type">Visit Type</Label>
                      <Select
                        value={newVisit.type}
                        onValueChange={(value) => setNewVisit((current) => ({ ...current, type: value }))}
                      >
                        <SelectTrigger id="visit-type" className="mt-1.5">
                          <SelectValue placeholder="Select visit type" />
                        </SelectTrigger>
                        <SelectContent>
                          {APPOINTMENT_TYPES.map((appointmentType) => (
                            <SelectItem key={appointmentType.id} value={appointmentType.name}>
                              {appointmentType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleAddVisit}
                      disabled={!newVisit.date || !newVisit.time || !newVisit.type}
                    >
                      Add To History
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-3">
              {visits.map((visit, i) => (
                <div key={i} className="p-4 rounded-lg border hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground w-28 shrink-0">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(visit.date).toLocaleDateString()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={visitTypeColors[visit.type] || "bg-muted text-muted-foreground"}>
                            {visit.type}
                          </Badge>
                        </div>
                        {visit.description && <p className="text-sm mt-1">{visit.description}</p>}
                        {visit.attachments && visit.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {visit.attachments.map((fileName) => (
                              <Badge key={fileName} variant="outline" className="text-[10px]">
                                <FileText className="mr-1 h-3 w-3" />
                                {fileName}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {visit.tags && visit.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {visit.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px]">#{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 shrink-0"
                      onClick={() => handleOpenEditVisit(visit, i)}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
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
              <Dialog open={isUploadFileOpen} onOpenChange={setIsUploadFileOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Upload className="mr-2 h-3.5 w-3.5" /> Upload File</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">Upload Medical File</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="medical-file-name">File Name</Label>
                      <Input
                        id="medical-file-name"
                        placeholder="File description..."
                        className="mt-1.5"
                        value={fileDescription}
                        onChange={(e) => setFileDescription(e.target.value)}
                      />
                    </div>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
                      {isAnalyzingFile ? (
                        <Loader2 className="h-8 w-8 mx-auto text-muted-foreground animate-spin" />
                      ) : (
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      )}
                      <div>
                        <Label htmlFor="medical-file-input" className="text-sm">Select file to analyze</Label>
                        <Input
                          id="medical-file-input"
                          type="file"
                          className="mt-1.5"
                          accept=".dcm,.dicom,.png,.jpg,.jpeg,.bmp,.webp"
                          disabled={isAnalyzingFile}
                          onChange={(e) => setSelectedMedicalFile(e.target.files?.[0] ?? null)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isAnalyzingFile
                          ? "Uploading and processing patient status..."
                          : "The uploaded image is sent to the AI API and tooth statuses are updated automatically."}
                      </p>
                      {selectedMedicalFile && (
                        <p className="text-xs text-foreground">Selected: {selectedMedicalFile.name}</p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleUploadAndAnalyzeMedicalFile}
                      disabled={!selectedMedicalFile || isAnalyzingFile}
                    >
                      {isAnalyzingFile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading and Processing...
                        </>
                      ) : (
                        "Upload And Analyze"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isAnalyzingFile && (
                <div className="mb-3 rounded-md border bg-accent/30 px-3 py-2 text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing uploaded file and extracting tooth statuses...
                </div>
              )}
              {uploadStatusMessage && (
                <div className="mb-3 rounded-md border bg-accent/40 px-3 py-2 text-sm">
                  {uploadStatusMessage}
                </div>
              )}
              <div className="space-y-2">
                {medicalFiles.map((file, i) => (
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
