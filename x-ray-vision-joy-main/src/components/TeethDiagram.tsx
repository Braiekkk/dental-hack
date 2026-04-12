import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ToothStatus = "healthy" | "cavity" | "fracture" | "missing" | "implant" | "crown" | "filling" | "impacted";

export interface ToothData {
  number: number;
  status: ToothStatus;
  notes?: string;
}

interface TeethDiagramProps {
  teeth: ToothData[];
  onToothClick?: (tooth: ToothData) => void;
  selectedTooth?: number | null;
  compact?: boolean;
}

const statusConfig: Record<ToothStatus, { color: string; label: string }> = {
  healthy: { color: "bg-success/80 border-success", label: "Healthy" },
  cavity: { color: "bg-destructive/80 border-destructive", label: "Cavity" },
  fracture: { color: "bg-warning/80 border-warning", label: "Fracture" },
  missing: { color: "bg-muted border-border", label: "Missing" },
  implant: { color: "bg-info/80 border-info", label: "Implant" },
  crown: { color: "bg-primary/80 border-primary", label: "Crown" },
  filling: { color: "bg-accent border-accent-foreground", label: "Filling" },
  impacted: { color: "bg-warning/60 border-warning", label: "Impacted" },
};

// FDI notation: upper right (18-11), upper left (21-28), lower left (38-31), lower right (41-48)
const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerLeft = [38, 37, 36, 35, 34, 33, 32, 31];
const lowerRight = [41, 42, 43, 44, 45, 46, 47, 48];

// Tooth shape paths for a simplified tooth icon
function ToothIcon({ number, status, className }: { number: number; status: ToothStatus; className?: string }) {
  const isUpper = number <= 28;
  const isMolar = [16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48].includes(number);
  const isPremolar = [14, 15, 24, 25, 34, 35, 44, 45].includes(number);
  const isCanine = [13, 23, 33, 43].includes(number);

  let width = 20;
  let height = 28;
  if (isMolar) { width = 26; height = 30; }
  else if (isPremolar) { width = 22; height = 28; }
  else if (isCanine) { width = 18; height = 30; }
  else { width = 16; height = 26; }

  if (status === "missing") {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className={cn("opacity-30", className)} width={width} height={height}>
        <rect x="2" y="2" width={width - 4} height={height - 4} rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
        <line x1="4" y1="4" x2={width - 4} y2={height - 4} stroke="currentColor" strokeWidth="1" />
        <line x1={width - 4} y1="4" x2="4" y2={height - 4} stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }

  const rootDirection = isUpper ? "down" : "up";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} width={width} height={height}>
      {/* Crown */}
      <rect
        x="2"
        y={rootDirection === "down" ? 2 : height - (isMolar ? 16 : 14)}
        width={width - 4}
        height={isMolar ? 14 : 12}
        rx="3"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Root(s) */}
      {isMolar ? (
        <>
          <rect x="4" y={rootDirection === "down" ? 14 : 2} width="5" height="12" rx="2" fill="currentColor" opacity="0.7" />
          <rect x={width / 2 - 2.5} y={rootDirection === "down" ? 14 : 2} width="5" height="10" rx="2" fill="currentColor" opacity="0.7" />
          <rect x={width - 9} y={rootDirection === "down" ? 14 : 2} width="5" height="12" rx="2" fill="currentColor" opacity="0.7" />
        </>
      ) : isPremolar ? (
        <>
          <rect x="4" y={rootDirection === "down" ? 12 : 2} width="5" height="12" rx="2" fill="currentColor" opacity="0.7" />
          <rect x={width - 9} y={rootDirection === "down" ? 12 : 2} width="5" height="12" rx="2" fill="currentColor" opacity="0.7" />
        </>
      ) : (
        <rect x={width / 2 - 3} y={rootDirection === "down" ? 12 : 2} width="6" height="14" rx="2" fill="currentColor" opacity="0.7" />
      )}
    </svg>
  );
}

export function TeethDiagram({ teeth, onToothClick, selectedTooth, compact = false }: TeethDiagramProps) {
  const getToothData = (num: number): ToothData => {
    return teeth.find((t) => t.number === num) || { number: num, status: "healthy" as ToothStatus };
  };

  const renderTooth = (num: number) => {
    const tooth = getToothData(num);
    const config = statusConfig[tooth.status];
    const isSelected = selectedTooth === num;

    return (
      <Tooltip key={num}>
        <TooltipTrigger asChild>
          <button
            onClick={() => onToothClick?.(tooth)}
            className={cn(
              "flex flex-col items-center gap-0.5 p-1 rounded-md transition-all hover:scale-110 cursor-pointer",
              isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5",
              !isSelected && "hover:bg-accent/50"
            )}
          >
            <span className={cn(
              "text-[9px] font-display font-bold",
              tooth.status === "healthy" ? "text-success" :
              tooth.status === "missing" ? "text-muted-foreground" :
              tooth.status === "cavity" ? "text-destructive" :
              tooth.status === "fracture" ? "text-warning" :
              tooth.status === "impacted" ? "text-warning" :
              "text-primary"
            )}>
              {num}
            </span>
            <div className={cn(
              tooth.status === "healthy" ? "text-success" :
              tooth.status === "missing" ? "text-muted-foreground" :
              tooth.status === "cavity" ? "text-destructive" :
              tooth.status === "fracture" ? "text-warning" :
              tooth.status === "impacted" ? "text-warning" :
              tooth.status === "implant" ? "text-info" :
              "text-primary"
            )}>
              <ToothIcon number={num} status={tooth.status} />
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p className="font-semibold">Tooth #{num}</p>
          <p className="capitalize">{config.label}</p>
          {tooth.notes && <p className="text-muted-foreground mt-0.5">{tooth.notes}</p>}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", compact ? "scale-90" : "")}>
      {/* Upper jaw label */}
      <p className="text-[10px] font-display font-semibold text-muted-foreground tracking-wider uppercase">Upper Jaw (Maxillary)</p>
      
      {/* Upper row */}
      <div className="flex items-end justify-center gap-px">
        <div className="flex items-end gap-px">
          {upperRight.map(renderTooth)}
        </div>
        <div className="w-px h-10 bg-border mx-1" />
        <div className="flex items-end gap-px">
          {upperLeft.map(renderTooth)}
        </div>
      </div>

      {/* Midline */}
      <div className="w-full max-w-md border-t border-dashed border-border my-1 relative">
        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-[9px] text-muted-foreground font-display">R — L</span>
      </div>

      {/* Lower row */}
      <div className="flex items-start justify-center gap-px">
        <div className="flex items-start gap-px">
          {lowerRight.map(renderTooth)}
        </div>
        <div className="w-px h-10 bg-border mx-1" />
        <div className="flex items-start gap-px">
          {lowerLeft.map(renderTooth)}
        </div>
      </div>

      {/* Lower jaw label */}
      <p className="text-[10px] font-display font-semibold text-muted-foreground tracking-wider uppercase">Lower Jaw (Mandibular)</p>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
        {Object.entries(statusConfig).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn("h-2.5 w-2.5 rounded-full border", val.color)} />
            <span className="text-[10px] text-muted-foreground">{val.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
