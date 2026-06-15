import type { SalesRow } from "./types";

const HEADER_MAP: Record<keyof SalesRow, string[]> = {
  orderId: ["order id", "orderid", "order", "id", "order_no", "order number"],
  date: ["date", "order date", "order_date", "purchase date"],
  product: ["product", "item", "product name", "sku name"],
  category: ["category", "product category", "type"],
  region: ["region", "country", "area", "market"],
  quantity: ["quantity", "qty", "units"],
  unitPrice: ["unit price", "unitprice", "price", "price per unit"],
  revenue: ["revenue", "total", "sales", "amount", "total revenue", "total sales"],
};

function normalizeKey(k: string) {
  return k.toLowerCase().trim().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function findHeader(headers: string[], aliases: string[]): string | null {
  const normalized = headers.map((h) => ({ raw: h, n: normalizeKey(h) }));
  for (const a of aliases) {
    const hit = normalized.find((h) => h.n === a);
    if (hit) return hit.raw;
  }
  for (const a of aliases) {
    const hit = normalized.find((h) => h.n.includes(a));
    if (hit) return hit.raw;
  }
  return null;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return isFinite(v) ? v : 0;
  if (v == null) return 0;
  const s = String(v).replace(/[$,€£\s]/g, "");
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

function toDateString(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    // Excel serial date
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(epoch.getTime() + v * 86400000);
    return d.toISOString().slice(0, 10);
  }
  const s = String(v ?? "").trim();
  if (!s) return "";
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}

export function normalizeRows(raw: Record<string, unknown>[]): SalesRow[] {
  if (!raw.length) return [];
  const headers = Object.keys(raw[0]);
  const map: Partial<Record<keyof SalesRow, string | null>> = {};
  (Object.keys(HEADER_MAP) as (keyof SalesRow)[]).forEach((k) => {
    map[k] = findHeader(headers, HEADER_MAP[k]);
  });

  const rows: SalesRow[] = [];
  raw.forEach((r, i) => {
    const get = (k: keyof SalesRow) => (map[k] ? r[map[k] as string] : undefined);
    const qty = toNumber(get("quantity"));
    const price = toNumber(get("unitPrice"));
    let revenue = toNumber(get("revenue"));
    if (!revenue) revenue = qty * price;
    const date = toDateString(get("date"));
    if (!date) return;
    rows.push({
      orderId: String(get("orderId") ?? `ROW-${i + 1}`),
      date,
      product: String(get("product") ?? "Unknown"),
      category: String(get("category") ?? "Uncategorized"),
      region: String(get("region") ?? "Unknown"),
      quantity: qty,
      unitPrice: price || (qty ? revenue / qty : 0),
      revenue,
    });
  });
  return rows;
}

export async function parseFile(file: File): Promise<SalesRow[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || file.type === "text/csv") {
    const Papa = (await import("papaparse")).default;
    return new Promise((resolve, reject) => {
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (res) => resolve(normalizeRows(res.data)),
        error: reject,
      });
    });
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: true });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: true });
    return normalizeRows(data);
  }
  throw new Error("Unsupported file type. Use .csv or .xlsx");
}
