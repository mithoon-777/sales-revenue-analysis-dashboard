import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, Download, FileDown, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardFilters } from "@/components/dashboard/filters";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  CategoryPieChart,
  MonthlySalesChart,
  RegionChart,
  RevenueTrendChart,
  TopProductsChart,
} from "@/components/dashboard/charts";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { StoreHydrate } from "@/components/dashboard/hydrate";
import { useDashboard } from "@/lib/store";
import { applyFilters, computeKpis, monthlyGrowth } from "@/lib/analytics";
import { exportCSV, exportPDF } from "@/lib/export";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Revenue Pulse" },
      { name: "description", content: "Sales and revenue analytics overview." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <StoreHydrate
      fallback={<div className="p-6 text-sm text-muted-foreground">Loading dashboard…</div>}
    >
      <DashboardInner />
    </StoreHydrate>
  );
}

function DashboardInner() {
  const rows = useDashboard((s) => s.rows);
  const filters = useDashboard((s) => s.filters);
  const source = useDashboard((s) => s.source);
  const filtered = applyFilters(rows, filters);
  const kpis = computeKpis(filtered);
  const growth = monthlyGrowth(filtered);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            Sales Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {source === "sample"
              ? "Showing sample data — upload a CSV or Excel file to analyze your own."
              : `Analyzing ${rows.length.toLocaleString()} records.`}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!filtered.length) return toast.error("No data to export");
              exportCSV(filtered);
              toast.success("CSV downloaded");
            }}
          >
            <Download className="mr-1.5 h-4 w-4" /> CSV
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              if (!filtered.length) return toast.error("No data to export");
              await exportPDF(filtered);
              toast.success("PDF downloaded");
            }}
          >
            <FileDown className="mr-1.5 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <DashboardFilters />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={`$${kpis.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          delta={`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}% vs prev month`}
          tone="primary"
        />
        <KpiCard
          label="Total Sales"
          value={kpis.totalQty.toLocaleString()}
          icon={Package}
          delta="units sold"
          tone="success"
        />
        <KpiCard
          label="Total Orders"
          value={kpis.orders.toLocaleString()}
          icon={ShoppingCart}
          delta="unique orders"
          tone="warning"
        />
        <KpiCard
          label="Avg Order Value"
          value={`$${kpis.aov.toFixed(2)}`}
          icon={TrendingUp}
          delta="per order"
          tone="accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueTrendChart rows={filtered} />
        </div>
        <InsightsPanel rows={filtered} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonthlySalesChart rows={filtered} />
        <CategoryPieChart rows={filtered} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopProductsChart rows={filtered} />
        <RegionChart rows={filtered} />
      </div>
    </div>
  );
}
