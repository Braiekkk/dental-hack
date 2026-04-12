import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  supplies: SupplyRequirement[];
}

interface SupplyRequirement {
  itemName: string;
  quantity: number | null;
}

const APPOINTMENT_TYPES_STORAGE_KEY = "dentalflow:appointment-types:v1";

const SUPPLY_OPTIONS = [
  "Mouth Mirror",
  "Carvers Plastics",
  "Forceps",
  "Syringes",
  "Orthodontic Pliers",
  "Dental Cotton Rolls",
  "Face Mask",
  "Gloves",
  "Barrier Films",
  "Dental Needles",
  "Dental Composite A2",
  "Anesthetic Cartridges",
] as const;

const DEFAULT_SUPPLIES_BY_TYPE: Record<string, SupplyRequirement[]> = {
  "routine-checkup": [
    { itemName: "Mouth Mirror", quantity: 1 },
    { itemName: "Gloves", quantity: 1 },
    { itemName: "Face Mask", quantity: 1 },
  ],
  "dental-cleaning": [
    { itemName: "Face Mask", quantity: 1 },
    { itemName: "Dental Cotton Rolls", quantity: 2 },
    { itemName: "Gloves", quantity: 1 },
  ],
  filling: [
    { itemName: "Dental Composite A2", quantity: 1 },
    { itemName: "Dental Needles", quantity: 1 },
    { itemName: "Gloves", quantity: 1 },
  ],
  "emergency-visit": [
    { itemName: "Anesthetic Cartridges", quantity: 1 },
    { itemName: "Syringes", quantity: 1 },
    { itemName: "Gloves", quantity: 1 },
    { itemName: "Face Mask", quantity: 1 },
  ],
  "tooth-extraction": [
    { itemName: "Forceps", quantity: 1 },
    { itemName: "Dental Needles", quantity: 1 },
    { itemName: "Syringes", quantity: 1 },
    { itemName: "Gloves", quantity: 1 },
  ],
};

const buildDefaultTypes = (): EditableType[] =>
  APPOINTMENT_TYPES.map((type) => ({
    ...type,
    defaultDurationMin: 60,
    supplies: DEFAULT_SUPPLIES_BY_TYPE[type.id] ?? [],
  }));

const parseStoredTypes = (raw: string | null): EditableType[] | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const sanitized = parsed
      .filter((item) => item && typeof item.id === "string" && typeof item.name === "string")
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: typeof item.description === "string" ? item.description : "",
        defaultDurationMin:
          typeof item.defaultDurationMin === "number" && Number.isFinite(item.defaultDurationMin)
            ? Math.max(15, item.defaultDurationMin)
            : 60,
        supplies: Array.isArray(item.supplies)
          ? item.supplies
              .filter((supply) => supply && typeof supply.itemName === "string")
              .map((supply) => ({
                itemName: supply.itemName,
                quantity:
                  typeof supply.quantity === "number" && Number.isFinite(supply.quantity)
                    ? Math.max(0.01, supply.quantity)
                    : null,
              }))
          : [],
      }));

    return sanitized.length > 0 ? sanitized : null;
  } catch {
    return null;
  }
};

export default function AppointmentTypes() {
  const [types, setTypes] = useState<EditableType[]>(() => {
    const stored = parseStoredTypes(localStorage.getItem(APPOINTMENT_TYPES_STORAGE_KEY));
    return stored ?? buildDefaultTypes();
  });

  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftDuration, setDraftDuration] = useState(60);
  const [draftSupplies, setDraftSupplies] = useState<SupplyRequirement[]>([]);

  useEffect(() => {
    localStorage.setItem(APPOINTMENT_TYPES_STORAGE_KEY, JSON.stringify(types));
  }, [types]);

  const editingType = useMemo(
    () => types.find((type) => type.id === editingTypeId),
    [types, editingTypeId],
  );

  const getEquivalenceSuggestion = (quantity: number, itemName: string) => {
    if (!(quantity > 0) || quantity >= 1) return "";

    const reciprocal = 1 / quantity;
    if (Math.abs(reciprocal - Math.round(reciprocal)) < 0.00001) {
      return `Every ${Math.round(reciprocal)} patients you will use 1 ${itemName}.`;
    }

    return `On average, 1 ${itemName} every ${reciprocal.toFixed(2)} patients.`;
  };

  const openEditor = (typeId: string) => {
    const type = types.find((item) => item.id === typeId);
    if (!type) return;

    setEditingTypeId(type.id);
    setDraftName(type.name);
    setDraftDescription(type.description);
    setDraftDuration(type.defaultDurationMin);
    setDraftSupplies(type.supplies.length > 0 ? type.supplies : [{ itemName: "Gloves", quantity: null }]);
  };

  const addSupply = () => {
    setDraftSupplies((current) => [...current, { itemName: "Gloves", quantity: null }]);
  };

  const removeSupply = (index: number) => {
    setDraftSupplies((current) => current.filter((_, supplyIndex) => supplyIndex !== index));
  };

  const updateSupplyName = (index: number, itemName: string) => {
    setDraftSupplies((current) =>
      current.map((supply, supplyIndex) =>
        supplyIndex === index
          ? {
              ...supply,
              itemName,
            }
          : supply,
      ),
    );
  };

  const updateSupplyQuantity = (index: number, quantity: number | null) => {
    setDraftSupplies((current) =>
      current.map((supply, supplyIndex) =>
        supplyIndex === index
          ? {
              ...supply,
              quantity:
                quantity === null
                  ? null
                  : Number.isFinite(quantity)
                    ? Math.max(0.01, quantity)
                    : null,
            }
          : supply,
      ),
    );
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
              supplies: draftSupplies
                .filter((supply) => supply.itemName.trim().length > 0)
                .map((supply) => ({
                  itemName: supply.itemName,
                  quantity:
                    typeof supply.quantity === "number" && Number.isFinite(supply.quantity)
                      ? Math.max(0.01, supply.quantity)
                      : null,
                })),
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
                <p className="text-xs text-muted-foreground">
                  Supplies: {type.supplies.map((supply) => {
                    const quantityLabel = supply.quantity == null ? "null" : `${supply.quantity}x`;
                    const autoEquivalence =
                      typeof supply.quantity === "number"
                        ? getEquivalenceSuggestion(supply.quantity, supply.itemName)
                        : "";
                    const equivalence =
                      typeof supply.quantity === "number" && supply.quantity < 1 ? autoEquivalence : "";
                    return `${quantityLabel} ${supply.itemName}${equivalence ? ` (${equivalence})` : ""}`;
                  }).join(", ") || "None"}
                </p>
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

                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label>Supply Necessities</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addSupply}>
                            <Plus className="mr-2 h-3.5 w-3.5" /> Add Supply
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {draftSupplies.length === 0 && (
                            <p className="text-xs text-muted-foreground">No supplies configured yet.</p>
                          )}

                          {draftSupplies.map((supply, index) => (
                            <div key={`${supply.itemName}-${index}`} className="space-y-1">
                              <div className="grid grid-cols-[1fr_110px_auto] gap-2">
                                <Select
                                  value={supply.itemName}
                                  onValueChange={(value) => updateSupplyName(index, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select supply" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SUPPLY_OPTIONS.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Input
                                  type="number"
                                  min={0.01}
                                  step={0.1}
                                  value={supply.quantity ?? ""}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    updateSupplyQuantity(index, value === "" ? null : Number(value));
                                  }}
                                />

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeSupply(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              {typeof supply.quantity === "number" && supply.quantity < 1 && (
                                <p className="text-xs text-muted-foreground pl-1">
                                  {getEquivalenceSuggestion(supply.quantity, supply.itemName)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
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
