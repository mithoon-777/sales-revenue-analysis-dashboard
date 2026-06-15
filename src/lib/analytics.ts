import type { Filters, SalesRow } from "./types";

export function applyFilters(rows: SalesRow[], f: Filters): SalesRow[] {
  return rows.filter((r) => {
    if (f.dateFrom && r.date < f.dateFrom) return false;
    if (f.dateTo && r.date > f.dateTo) return false;
    if (f.product && r.product !== f.product) return false;
    if (f.category && r.category !== f.category) return false;
    if (f.region && r.region !== f.region) return false;
    return true;
  });
}

export function computeKpis(rows: SalesRow[]) {
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalQty = rows.reduce((s, r) => s + r.quantity, 0);
  const orders = new Set(rows.map((r) => r.orderId)).size || rows.length;
  const aov = orders ? totalRevenue / orders : 0;
  return { totalRevenue, totalQty, orders, aov };
}

function groupSum<T>(arr: T[], key: (t: T) => string, val: (t: T) => number) {
  const m = new Map<string, number>();
  arr.forEach((it) => m.set(key(it), (m.get(key(it)) ?? 0) + val(it)));
  return m;
}

export function revenueByMonth(rows: SalesRow[]) {
  const m = groupSum(
    rows,
    (r) => r.date.slice(0, 7),
    (r) => r.revenue,
  );
  return Array.from(m.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }));
}

export function unitsByMonth(rows: SalesRow[]) {
  const m = groupSum(
    rows,
    (r) => r.date.slice(0, 7),
    (r) => r.quantity,
  );
  return Array.from(m.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, units]) => ({ month, units }));
}

export function topProducts(rows: SalesRow[], n = 8) {
  const m = groupSum(
    rows,
    (r) => r.product,
    (r) => r.revenue,
  );
  return Array.from(m.entries())
    .map(([product, revenue]) => ({ product, revenue: Math.round(revenue) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, n);
}

export function revenueByCategory(rows: SalesRow[]) {
  const m = groupSum(
    rows,
    (r) => r.category,
    (r) => r.revenue,
  );
  return Array.from(m.entries())
    .map(([category, revenue]) => ({ category, revenue: Math.round(revenue) }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function revenueByRegion(rows: SalesRow[]) {
  const m = groupSum(
    rows,
    (r) => r.region,
    (r) => r.revenue,
  );
  return Array.from(m.entries())
    .map(([region, revenue]) => ({ region, revenue: Math.round(revenue) }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function monthlyGrowth(rows: SalesRow[]) {
  const months = revenueByMonth(rows);
  if (months.length < 2) return 0;
  const last = months[months.length - 1].revenue;
  const prev = months[months.length - 2].revenue;
  if (!prev) return 0;
  return ((last - prev) / prev) * 100;
}

export function generateInsights(rows: SalesRow[]) {
  if (!rows.length) return [];
  const products = topProducts(rows, 1);
  const cats = revenueByCategory(rows);
  const regs = revenueByRegion(rows);
  const growth = monthlyGrowth(rows);
  const months = revenueByMonth(rows);
  const best = months.reduce((a, b) => (b.revenue > a.revenue ? b : a), months[0]);
  const insights: { label: string; value: string; tone: "up" | "down" | "neutral" }[] = [];
  if (products[0])
    insights.push({
      label: "Best performing product",
      value: `${products[0].product} · $${products[0].revenue.toLocaleString()}`,
      tone: "up",
    });
  if (cats[0])
    insights.push({
      label: "Highest revenue category",
      value: `${cats[0].category} · $${cats[0].revenue.toLocaleString()}`,
      tone: "up",
    });
  if (regs[0])
    insights.push({
      label: "Highest revenue region",
      value: `${regs[0].region} · $${regs[0].revenue.toLocaleString()}`,
      tone: "up",
    });
  insights.push({
    label: "Month-over-month growth",
    value: `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`,
    tone: growth >= 0 ? "up" : "down",
  });
  if (best)
    insights.push({
      label: "Top month",
      value: `${best.month} · $${best.revenue.toLocaleString()}`,
      tone: "neutral",
    });
  return insights;
}

export function uniqueValues(rows: SalesRow[], key: keyof SalesRow): string[] {
  return Array.from(new Set(rows.map((r) => String(r[key])))).sort();
}
