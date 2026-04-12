import { useState } from "react";
import { Search, Plus, Phone, MoreHorizontal, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Supplier {
  id: number;
  name: string;
  phone: string;
  totalBills: number;
  lastOrder: string;
}

const mockSuppliers: Supplier[] = [
  { id: 1, name: "DentalPro Tunisia", phone: "+216 71 234 567", totalBills: 12, lastOrder: "2026-04-05" },
  { id: 2, name: "MedSupply SARL", phone: "+216 73 456 789", totalBills: 8, lastOrder: "2026-03-28" },
  { id: 3, name: "Oral Care Distribution", phone: "+216 74 567 890", totalBills: 15, lastOrder: "2026-04-10" },
  { id: 4, name: "BioDent", phone: "+216 71 678 901", totalBills: 5, lastOrder: "2026-02-14" },
];

export default function Suppliers() {
  const [search, setSearch] = useState("");
  const filtered = mockSuppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="soft-panel p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -top-16 right-8 h-36 w-36 rounded-full bg-[#e8f4ff] blur-3xl" />
        <div className="absolute -bottom-14 left-6 h-32 w-32 rounded-full bg-[#ffe8f4] blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Supplier Network</h1>
            <p className="page-subtitle">Manage procurement relationships and billing history.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Supplier</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">New Supplier</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div><Label>Supplier Name</Label><Input placeholder="Company name" className="mt-1.5" /></div>
                <div><Label>Phone</Label><Input placeholder="+216..." className="mt-1.5" /></div>
                <Button className="w-full mt-2">Add Supplier</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="soft-panel overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-gradient-to-r from-[#fff8ed]/55 to-[#f6f8ff]/55">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/80"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Bills</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead className="w-10 text-right pr-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" /> {supplier.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      {supplier.totalBills}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(supplier.lastOrder).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Bills</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
