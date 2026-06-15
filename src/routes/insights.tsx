import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardFilters } from "@/components/dashboard/filters";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { CategoryPieChart, RegionChart, TopProductsChart } from "@/components/dashboard/charts";
import { StoreHydrate } from "@/components/dashboard/hydrate";
import { useDashboard } from "@/lib/store";
import { applyFilters, monthlyGrowth, revenueByMonth } from "@/lib/analytics";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — Revenue Pulse" },
      { name: "description", content: "Auto-generated insights from your sales data." },
    ],
  }),
  component: () => (
    <StoreHydrate fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <InsightsPage />
    </StoreHydrate>
  ),
});

function InsightsPage() {
  const rows = useDashboard((s) => s.rows);
  const filters = useDashboard((s) => s.filters);
  const filtered = applyFilters(rows, filters);
  const months = revenueByMonth(filtered);
  const growth = monthlyGrowth(filtered);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Highlights and trends generated from your filtered data.
        </p>
      </div>
      <DashboardFilters />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InsightsPanel rows={filtered} />
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" /> Growth snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Months tracked" value={months.length.toString()} />
              <Stat label="MoM growth" value={`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`} />
              <Stat
                label="Best month"
                value={
                  months.length
                    ? months.reduce((a, b) => (b.revenue > a.revenue ? b : a)).month
                    : "—"
                }
              />
              <Stat
                label="Avg monthly rev"
                value={
                  months.length
                    ? `$${Math.round(
                        months.reduce((s, m) => s + m.revenue, 0) / months.length,
                      ).toLocaleString()}`
                    : "—"
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopProductsChart rows={filtered} />
        <CategoryPieChart rows={filtered} />
      </div>
      <RegionChart rows={filtered} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-bold">{value}</p>
    </div>
  );
}
