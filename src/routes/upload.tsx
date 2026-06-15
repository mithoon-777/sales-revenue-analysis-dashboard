import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileSpreadsheet, FileUp, Sparkles, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StoreHydrate } from "@/components/dashboard/hydrate";
import { useDashboard } from "@/lib/store";
import { parseFile } from "@/lib/parse";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Data — Revenue Pulse" },
      { name: "description", content: "Upload CSV or Excel sales files to analyze." },
    ],
  }),
  component: () => (
    <StoreHydrate fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <UploadPage />
    </StoreHydrate>
  ),
});

function UploadPage() {
  const navigate = useNavigate();
  const rows = useDashboard((s) => s.rows);
  const source = useDashboard((s) => s.source);
  const setRows = useDashboard((s) => s.setRows);
  const loadSample = useDashboard((s) => s.loadSample);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const parsed = await parseFile(file);
      if (!parsed.length) {
        toast.error("Couldn't find any valid rows. Check column headers.");
        return;
      }
      setRows(parsed, "uploaded");
      toast.success(`Imported ${parsed.length.toLocaleString()} records`);
      navigate({ to: "/" });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to parse file");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Upload Data</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drop a CSV or Excel file with sales records. Expected columns: Order ID, Date, Product,
          Category, Region, Quantity, Unit Price, Revenue.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
                dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30",
              )}
            >
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                <FileUp className="h-7 w-7" />
              </div>
              <div>
                <p className="text-base font-semibold">Drop your file here</p>
                <p className="text-sm text-muted-foreground">CSV or XLSX, up to ~10MB</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
              <Button onClick={() => inputRef.current?.click()} disabled={busy}>
                {busy ? "Parsing…" : "Choose file"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={loadSample}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Load sample dataset
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => {
                useDashboard.getState().clear();
                toast.success("Data cleared");
              }}
              disabled={rows.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear all data
            </Button>
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              Current: <span className="font-medium text-foreground">{rows.length.toLocaleString()}</span>{" "}
              records ({source})
            </div>
          </CardContent>
        </Card>
      </div>

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview (first 10 rows)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 10).map((r) => (
                  <TableRow key={r.orderId}>
                    <TableCell className="font-mono text-xs">{r.orderId}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.product}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell>{r.region}</TableCell>
                    <TableCell className="text-right">{r.quantity}</TableCell>
                    <TableCell className="text-right">${r.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${r.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
