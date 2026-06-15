import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileUp,
  History,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { MAX_UPLOAD_BYTES, parseFile, validateFile } from "@/lib/parse";
import type { UploadHistoryEntry } from "@/lib/types";
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

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

function UploadPage() {
  const navigate = useNavigate();
  const rows = useDashboard((s) => s.rows);
  const source = useDashboard((s) => s.source);
  const history = useDashboard((s) => s.history);
  const setRows = useDashboard((s) => s.setRows);
  const loadSample = useDashboard((s) => s.loadSample);
  const addHistory = useDashboard((s) => s.addHistory);
  const clearHistory = useDashboard((s) => s.clearHistory);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastWarning, setLastWarning] = useState<{
    name: string;
    missing: string[];
    skipped: number;
  } | null>(null);

  async function handleFile(file: File) {
    setLastWarning(null);
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      const entry: UploadHistoryEntry = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        rowCount: 0,
        status: "error",
        message: validationError,
        timestamp: Date.now(),
      };
      addHistory(entry);
      return;
    }

    setBusy(true);
    try {
      const result = await parseFile(file);
      if (!result.rows.length) {
        const msg =
          result.missingColumns.length > 0
            ? `Missing required columns: ${result.missingColumns.join(", ")}`
            : "No valid rows found";
        toast.error(msg);
        addHistory({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          rowCount: 0,
          status: "error",
          message: msg,
          missingColumns: result.missingColumns,
          timestamp: Date.now(),
        });
        return;
      }

      setRows(result.rows, "uploaded");
      const hasWarning = result.missingColumns.length > 0 || result.skippedRows > 0;
      if (hasWarning) {
        setLastWarning({
          name: file.name,
          missing: result.missingColumns,
          skipped: result.skippedRows,
        });
        toast.warning(`Imported ${result.rows.length.toLocaleString()} records with warnings`);
      } else {
        toast.success(`Imported ${result.rows.length.toLocaleString()} records`);
      }
      addHistory({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        rowCount: result.rows.length,
        status: hasWarning ? "warning" : "success",
        message: hasWarning
          ? `${result.skippedRows} skipped${
              result.missingColumns.length ? `, missing: ${result.missingColumns.join(", ")}` : ""
            }`
          : undefined,
        missingColumns: result.missingColumns,
        timestamp: Date.now(),
      });
      if (!hasWarning) navigate({ to: "/" });
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to parse file";
      toast.error(msg);
      addHistory({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        rowCount: 0,
        status: "error",
        message: msg,
        timestamp: Date.now(),
      });
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

      {lastWarning && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Imported with warnings — {lastWarning.name}</AlertTitle>
          <AlertDescription className="space-y-1 text-sm">
            {lastWarning.missing.length > 0 && (
              <div>Missing columns: {lastWarning.missing.join(", ")}</div>
            )}
            {lastWarning.skipped > 0 && <div>{lastWarning.skipped} rows skipped (invalid date)</div>}
          </AlertDescription>
        </Alert>
      )}

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
                <p className="text-sm text-muted-foreground">
                  CSV or XLSX, up to {(MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(0)}MB
                </p>
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
              Current:{" "}
              <span className="font-medium text-foreground">{rows.length.toLocaleString()}</span>{" "}
              records ({source})
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-primary" /> Upload history
          </CardTitle>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No uploads yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <StatusBadge status={h.status} />
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate font-medium">{h.name}</TableCell>
                    <TableCell className="text-muted-foreground">{formatBytes(h.size)}</TableCell>
                    <TableCell className="text-right">{h.rowCount.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(h.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
                      {h.message ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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

function StatusBadge({ status }: { status: UploadHistoryEntry["status"] }) {
  if (status === "success") {
    return (
      <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600">
        <CheckCircle2 className="h-3 w-3" /> Success
      </Badge>
    );
  }
  if (status === "warning") {
    return (
      <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600">
        <AlertTriangle className="h-3 w-3" /> Warning
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 bg-destructive/10 text-destructive">
      <XCircle className="h-3 w-3" /> Error
    </Badge>
  );
}
