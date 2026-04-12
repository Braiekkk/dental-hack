export const TOOTH_STATUS_CLASSES = [
  "healthy",
  "bone_loss",
  "caries",
  "crown",
  "filling",
  "impacted_tooth",
  "implant",
  "missing_teeth",
  "periapical_lesion",
  "post_abutment",
  "root_piece",
  "root_canal_treatment",
] as const;

export type ToothStatus = (typeof TOOTH_STATUS_CLASSES)[number];

export const TOOTH_STATUS_META: Record<
  ToothStatus,
  {
    label: string;
    chartFill: string;
    chartStroke: string;
    compactLegendClass: string;
    badgeClass: string;
    textClass: string;
  }
> = {
  healthy: {
    label: "Healthy",
    chartFill: "#22c55e",
    chartStroke: "#16a34a",
    compactLegendClass: "bg-emerald-500 border-emerald-700",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    textClass: "text-emerald-700",
  },
  bone_loss: {
    label: "Bone Loss",
    chartFill: "#c8c8c8",
    chartStroke: "#9ca3af",
    compactLegendClass: "bg-zinc-300 border-zinc-400",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-300",
    textClass: "text-zinc-600",
  },
  caries: {
    label: "Caries",
    chartFill: "#ef4444",
    chartStroke: "#dc2626",
    compactLegendClass: "bg-destructive/80 border-destructive",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    textClass: "text-destructive",
  },
  implant: {
    label: "Implant",
    chartFill: "#3b82f6",
    chartStroke: "#2563eb",
    compactLegendClass: "bg-info/80 border-info",
    badgeClass: "bg-info/10 text-info border-info/20",
    textClass: "text-info",
  },
  crown: {
    label: "Crown",
    chartFill: "#06b6d4",
    chartStroke: "#0891b2",
    compactLegendClass: "bg-primary/80 border-primary",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    textClass: "text-primary",
  },
  filling: {
    label: "Filling",
    chartFill: "#8b5cf6",
    chartStroke: "#7c3aed",
    compactLegendClass: "bg-accent border-accent-foreground",
    badgeClass: "bg-accent text-accent-foreground",
    textClass: "text-violet-600",
  },
  impacted_tooth: {
    label: "Impacted Tooth",
    chartFill: "#f97316",
    chartStroke: "#ea580c",
    compactLegendClass: "bg-warning/60 border-warning",
    badgeClass: "bg-warning/10 text-warning border-warning/20",
    textClass: "text-warning",
  },
  missing_teeth: {
    label: "Missing teeth",
    chartFill: "#9ca3af",
    chartStroke: "#6b7280",
    compactLegendClass: "bg-muted border-border",
    badgeClass: "bg-muted text-muted-foreground",
    textClass: "text-muted-foreground",
  },
  periapical_lesion: {
    label: "Periapical lesion",
    chartFill: "#ff8c00",
    chartStroke: "#f97316",
    compactLegendClass: "bg-orange-300 border-orange-400",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-300",
    textClass: "text-orange-600",
  },
  post_abutment: {
    label: "Post  Abutment",
    chartFill: "#ffd700",
    chartStroke: "#d4a017",
    compactLegendClass: "bg-yellow-300 border-yellow-500",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
    textClass: "text-yellow-700",
  },
  root_piece: {
    label: "Root Piece",
    chartFill: "#a52a2a",
    chartStroke: "#7f1d1d",
    compactLegendClass: "bg-red-900 border-red-950",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
    textClass: "text-red-800",
  },
  root_canal_treatment: {
    label: "Root canal treatment",
    chartFill: "#800080",
    chartStroke: "#6d28d9",
    compactLegendClass: "bg-purple-500 border-purple-700",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-300",
    textClass: "text-purple-700",
  },
};