import { useState } from "react";
import { Search, Plus, Package, AlertTriangle, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import anestheticCartridgesImg from "@/assets/tools/Anesthetic Cartridges.png";
import barrierFilmsImg from "@/assets/tools/Barrier Films.png";
import dentalCompositeImg from "@/assets/tools/Dental Composite A2.png";
import cottonRollsImg from "@/assets/tools/Dental Cotton Rolls.png";
import dentalMirrorImg from "@/assets/tools/dental mirror.png";
import dentalNeedlesImg from "@/assets/tools/Dental Needles.png";
import faceMaskImg from "@/assets/tools/Face Mask.png";
import glovesImg from "@/assets/tools/gloves.png";
import orthodonticPlierImg from "@/assets/tools/Orthodontic Plier.png";
import syringeImg from "@/assets/tools/Syringe.png";

interface StockItem {
  id: number;
  name: string;
  remaining: number;
  threshold: number;
  expiration: string;
  category: string;
  image?: string;
}

const toolImages: Record<string, string> = {
  "Mouth Mirror": dentalMirrorImg,
  "Carvers Plastics": dentalCompositeImg,
  Forceps: orthodonticPlierImg,
  Syringes: syringeImg,
  "Orthodontic Pliers": orthodonticPlierImg,
  "Dental Cotton Rolls": cottonRollsImg,
  "Face Mask": faceMaskImg,
  Gloves: glovesImg,
  "Barrier Films": barrierFilmsImg,
  "Dental Needles": dentalNeedlesImg,
  "Dental Composite A2": dentalCompositeImg,
  "Anesthetic Cartridges": anestheticCartridgesImg,
};

const toolImageClassByName: Record<string, string> = {
  "Mouth Mirror": "scale-[0.94]",
  "Carvers Plastics": "scale-[0.9]",
  Forceps: "scale-[0.9]",
  Syringes: "scale-[0.76]",
  "Orthodontic Pliers": "scale-[0.88]",
  "Dental Cotton Rolls": "scale-[0.96]",
  "Face Mask": "scale-[0.95]",
  Gloves: "scale-[0.93]",
  "Barrier Films": "scale-[0.92]",
  "Dental Needles": "scale-[0.9]",
  "Dental Composite A2": "scale-[0.95]",
  "Anesthetic Cartridges": "scale-[0.9]",
};

const mockStock: StockItem[] = [
  { id: 1, name: "Mouth Mirror", remaining: 500, threshold: 50, expiration: "N/A", category: "Instruments" },
  { id: 2, name: "Carvers Plastics", remaining: 71, threshold: 20, expiration: "N/A", category: "Instruments" },
  { id: 3, name: "Forceps", remaining: 150, threshold: 30, expiration: "N/A", category: "Instruments" },
  { id: 4, name: "Syringes", remaining: 500, threshold: 100, expiration: "2027-06-01", category: "Supplies" },
  { id: 5, name: "Orthodontic Pliers", remaining: 78, threshold: 20, expiration: "N/A", category: "Instruments" },
  { id: 6, name: "Dental Cotton Rolls", remaining: 600, threshold: 100, expiration: "2028-01-01", category: "Supplies" },
  { id: 7, name: "Face Mask", remaining: 400, threshold: 50, expiration: "2027-03-15", category: "PPE" },
  { id: 8, name: "Gloves", remaining: 600, threshold: 100, expiration: "2027-12-01", category: "PPE" },
  { id: 9, name: "Barrier Films", remaining: 5, threshold: 10, expiration: "N/A", category: "Supplies" },
  { id: 10, name: "Dental Needles", remaining: 20, threshold: 15, expiration: "2026-09-20", category: "Supplies" },
  { id: 11, name: "Dental Composite A2", remaining: 3, threshold: 10, expiration: "2026-08-15", category: "Materials" },
  { id: 12, name: "Anesthetic Cartridges", remaining: 8, threshold: 20, expiration: "2026-12-30", category: "Medication" },
];

function ItemPlaceholder({ name, image }: { name: string; image?: string }) {
  if (image) {
    const itemFitClass = toolImageClassByName[name] ?? "scale-[0.92]";
    return (
      <div className="h-24 w-full bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className={`h-full w-full object-contain transition-transform duration-200 ${itemFitClass}`}
        />
      </div>
    );
  }

  return (
    <div className="h-24 w-full bg-muted/50 rounded-lg flex items-center justify-center">
      <Package className="h-10 w-10 text-muted-foreground/40" />
    </div>
  );
}

function getItemStatus(item: StockItem): { label: string; variant: "outline" | "destructive" | "warning" | "success" } {
  if (item.remaining < item.threshold) {
    return { label: "Low Stock", variant: "destructive" };
  }
  if (item.expiration !== "N/A") {
    const exp = new Date(item.expiration);
    const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 120) {
      return { label: "Expiring", variant: "warning" };
    }
  }
  return { label: "In Stock", variant: "success" };
}

export default function Stock() {
  const [search, setSearch] = useState("");
  const filtered = mockStock.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = mockStock.filter((i) => i.remaining < i.threshold).length;
  const expiringSoonCount = mockStock.filter((i) => {
    if (i.expiration === "N/A") return false;
    const exp = new Date(i.expiration);
    const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff < 120;
  }).length;

  return (
    <div className="space-y-6">
      <div className="soft-panel p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -top-16 -right-12 h-44 w-44 rounded-full bg-[#fff0da] blur-3xl" />
        <div className="absolute -bottom-14 left-8 h-32 w-32 rounded-full bg-[#e9f4ff] blur-3xl" />
        <div className="relative flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
          <div>
            <h1 className="page-title">Inventory Atlas</h1>
            <p className="page-subtitle">Track instruments, supplies, and expiration risk at a glance.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64 bg-white/85"
            />
          </div>
          <Link to="/suppliers">
            <Button variant="outline">Manage Suppliers</Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Add Stock Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div><Label>Item Name</Label><Input placeholder="Name" className="mt-1.5" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Quantity</Label><Input type="number" placeholder="0" className="mt-1.5" /></div>
                  <div><Label>Min Threshold</Label><Input type="number" placeholder="0" className="mt-1.5" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Category</Label><Input placeholder="Category" className="mt-1.5" /></div>
                  <div><Label>Expiration Date</Label><Input type="date" className="mt-1.5" /></div>
                </div>
                <Button className="w-full mt-2">Add Item</Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{mockStock.length}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{lowStockCount}</p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{expiringSoonCount}</p>
              <p className="text-xs text-muted-foreground">Expiring Soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map((item) => {
          const status = getItemStatus(item);
          return (
            <Card key={item.id} className="overflow-hidden border-2 border-primary/15 hover:border-primary/35 transition-all hover:-translate-y-0.5">
              <CardContent className="p-0">
                {/* Image Placeholder */}
                <div className="p-3 pb-0">
                  <ItemPlaceholder name={item.name} image={toolImages[item.name]} />
                </div>
                
                {/* Content */}
                <div className="p-3 pt-2 space-y-2">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>Restock</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Quantity: <span className={item.remaining < item.threshold ? "text-destructive font-semibold" : "font-medium"}>{item.remaining}</span>
                  </p>
                  
                  <Badge 
                    variant="outline" 
                    className={
                      status.variant === "destructive" 
                        ? "bg-destructive/10 text-destructive border-destructive/20 text-xs" 
                        : status.variant === "warning"
                        ? "bg-warning/10 text-warning border-warning/20 text-xs"
                        : "bg-success/10 text-success border-success/20 text-xs"
                    }
                  >
                    {status.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No items found</p>
        </div>
      )}
    </div>
  );
}
