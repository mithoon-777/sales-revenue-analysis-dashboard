export type SalesRow = {
  orderId: string;
  date: string; // ISO yyyy-mm-dd
  product: string;
  category: string;
  region: string;
  quantity: number;
  unitPrice: number;
  revenue: number;
};

export type Filters = {
  dateFrom: string | null;
  dateTo: string | null;
  product: string | null;
  category: string | null;
  region: string | null;
};
