import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { APPOINTMENT_TYPES } from "@/lib/appointment-types";

interface EditableType {
  id: string;
  name: string;
  description: string;
  defaultDurationMin: number;
}

export default function AppointmentTypes() {
  const [types, setTypes] = useState<EditableType[]>(
    APPOINTMENT_TYPES.map((type) => ({
      ...type,
      defaultDurationMin: 60,
    })),
  );

  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftDuration, setDraftDuration] = useState(60);

  const editingType = useMemo(
    () => types.find((type) => type.id === editingTypeId),
    [types, editingTypeId],
  );

  const openEditor = (typeId: string) => {
    const type = types.find((item) => item.id === typeId);
    if (!type) return;

    setEditingTypeId(type.id);
    setDraftName(type.name);
    setDraftDescription(type.description);
    setDraftDuration(type.defaultDurationMin);
  };

  const saveType = () => {
    if (!editingTypeId) return;

    setTypes((current) =>
      current.map((item) =>
        item.id === editingTypeId
          ? {
              ...item,
              name: draftName.trim() || item.name,
              description: draftDescription.trim() || item.description,
              defaultDurationMin: Number.isFinite(draftDuration) ? Math.max(15, draftDuration) : item.defaultDurationMin,
            }
          : item,
      ),
    );

    setEditingTypeId(null);
  };

  return (
    <div className="space-y-6">
      <div className="soft-panel p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -top-12 right-4 h-28 w-28 rounded-full bg-[#e4f8ef] blur-2xl" />
        <div className="absolute -bottom-12 right-20 h-36 w-36 rounded-full bg-[#e7f3ff] blur-3xl" />
        <div className="relative flex items-end justify-between gap-4">
          <div>
            <h1 className="page-title">Appointment Types</h1>
            <p className="page-subtitle">Manage your allowed appointment categories and default durations.</p>
          </div>
          <Badge variant="outline" className="bg-accent/40 text-accent-foreground border-accent/70 px-3 py-1">
            {types.length} configured
          </Badge>
        </div>
      </div>

      <Card className="soft-panel">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-display text-lg">Type Catalog</CardTitle>
          <Button variant="outline" size="sm" disabled>
            <Plus className="mr-2 h-4 w-4" /> Fixed Set
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {types.map((type) => (
            <div
              key={type.id}
              className="rounded-xl border border-border/70 bg-white/80 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
            >
              <div className="space-y-2">
                <p className="font-semibold leading-tight">{type.name}</p>
                <p className="text-sm text-muted-foreground">{type.description}</p>
                <Badge variant="outline" className="bg-muted text-muted-foreground border-border/70">
                  Default duration: {type.defaultDurationMin} min
                </Badge>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => openEditor(type.id)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">Edit Appointment Type</DialogTitle>
                  </DialogHeader>

                  {editingType && (
                    <div className="grid gap-4 py-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="type-name">Type Name</Label>
                        <Input
                          id="type-name"
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="type-description">Description</Label>
                        <Input
                          id="type-description"
                          value={draftDescription}
                          onChange={(event) => setDraftDescription(event.target.value)}
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="type-duration">Default Duration (minutes)</Label>
                        <Input
                          id="type-duration"
                          type="number"
                          min={15}
                          step={15}
                          value={draftDuration}
                          onChange={(event) => setDraftDuration(Number(event.target.value))}
                        />
                      </div>

                      <Button onClick={saveType} className="mt-2 w-full">Save Changes</Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
