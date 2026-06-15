import type { SalesRow } from "./types";
import { computeKpis, generateInsights, revenueByCategory, revenueByRegion, topProducts } from "./analytics";

export function exportCSV(rows: SalesRow[], filename = "sales-data.csv") {
  const headers = ["Order ID", "Date", "Product", "Category", "Region", "Quantity", "Unit Price", "Revenue"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [r.orderId, r.date, r.product, r.category, r.region, r.quantity, r.unitPrice, r.revenue]
        .map((v) => {
          const s = String(v ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportPDF(rows: SalesRow[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();
  const k = computeKpis(rows);

  doc.setFontSize(20);
  doc.text("Sales & Revenue Summary", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 27);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 34,
    head: [["Metric", "Value"]],
    body: [
      ["Total Revenue", `$${k.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
      ["Total Units Sold", k.totalQty.toLocaleString()],
      ["Total Orders", k.orders.toLocaleString()],
      ["Average Order Value", `$${k.aov.toFixed(2)}`],
    ],
    theme: "striped",
    headStyles: { fillColor: [88, 80, 236] },
  });

  const insights = generateInsights(rows);
  autoTable(doc, {
    head: [["Insight", "Value"]],
    body: insights.map((i) => [i.label, i.value]),
    theme: "grid",
    headStyles: { fillColor: [88, 80, 236] },
  });

  autoTable(doc, {
    head: [["Top Products", "Revenue"]],
    body: topProducts(rows, 5).map((p) => [p.product, `$${p.revenue.toLocaleString()}`]),
    theme: "grid",
    headStyles: { fillColor: [88, 80, 236] },
  });

  autoTable(doc, {
    head: [["Category", "Revenue"]],
    body: revenueByCategory(rows).map((c) => [c.category, `$${c.revenue.toLocaleString()}`]),
    theme: "grid",
    headStyles: { fillColor: [88, 80, 236] },
  });

  autoTable(doc, {
    head: [["Region", "Revenue"]],
    body: revenueByRegion(rows).map((c) => [c.region, `$${c.revenue.toLocaleString()}`]),
    theme: "grid",
    headStyles: { fillColor: [88, 80, 236] },
  });

  doc.save("dashboard-summary.pdf");
}
