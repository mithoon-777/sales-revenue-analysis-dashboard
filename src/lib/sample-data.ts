import type { SalesRow } from "./types";

const products = [
  { name: "Aurora Headphones", category: "Electronics", price: 189 },
  { name: "Nimbus Laptop", category: "Electronics", price: 1299 },
  { name: "Pulse Smartwatch", category: "Electronics", price: 249 },
  { name: "Terra Backpack", category: "Accessories", price: 79 },
  { name: "Loom Hoodie", category: "Apparel", price: 65 },
  { name: "Drift Sneakers", category: "Apparel", price: 120 },
  { name: "Ember Mug", category: "Home", price: 24 },
  { name: "Glow Desk Lamp", category: "Home", price: 89 },
];
const regions = ["North America", "Europe", "Asia", "South America", "Oceania"];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateSampleData(): SalesRow[] {
  const rand = seeded(42);
  const rows: SalesRow[] = [];
  const start = new Date();
  start.setMonth(start.getMonth() - 11);
  start.setDate(1);
  for (let i = 0; i < 600; i++) {
    const p = products[Math.floor(rand() * products.length)];
    const region = regions[Math.floor(rand() * regions.length)];
    const day = Math.floor(rand() * 330);
    const d = new Date(start);
    d.setDate(d.getDate() + day);
    const qty = 1 + Math.floor(rand() * 5);
    const price = Math.round(p.price * (0.85 + rand() * 0.3));
    rows.push({
      orderId: `ORD-${(10000 + i).toString()}`,
      date: d.toISOString().slice(0, 10),
      product: p.name,
      category: p.category,
      region,
      quantity: qty,
      unitPrice: price,
      revenue: qty * price,
    });
  }
  return rows;
}
