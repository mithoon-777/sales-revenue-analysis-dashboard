import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Filters, SalesRow, UploadHistoryEntry } from "./types";
import { generateSampleData } from "./sample-data";

type State = {
  rows: SalesRow[];
  source: "sample" | "uploaded";
  filters: Filters;
  history: UploadHistoryEntry[];
  setRows: (rows: SalesRow[], source?: "sample" | "uploaded") => void;
  clear: () => void;
  setFilter: <K extends keyof Filters>(k: K, v: Filters[K]) => void;
  resetFilters: () => void;
  loadSample: () => void;
  addHistory: (entry: UploadHistoryEntry) => void;
  clearHistory: () => void;
};

const defaultFilters: Filters = {
  dateFrom: null,
  dateTo: null,
  product: null,
  category: null,
  region: null,
};

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useDashboard = create<State>()(
  persist(
    (set) => ({
      rows: [],
      source: "sample",
      filters: defaultFilters,
      history: [],
      setRows: (rows, source = "uploaded") =>
        set({ rows, source, filters: defaultFilters }),
      clear: () => set({ rows: [], source: "sample", filters: defaultFilters }),
      setFilter: (k, v) =>
        set((s) => ({ filters: { ...s.filters, [k]: v } })),
      resetFilters: () => set({ filters: defaultFilters }),
      loadSample: () =>
        set({ rows: generateSampleData(), source: "sample", filters: defaultFilters }),
      addHistory: (entry) =>
        set((s) => ({ history: [entry, ...s.history].slice(0, 20) })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "sales-dashboard",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (noopStorage as unknown as Storage),
      ),
      skipHydration: true,
    },
  ),
);

