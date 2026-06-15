
## Sales & Revenue Analysis Dashboard

A fully client-side analytics dashboard. No backend required — uploaded files are parsed in the browser and held in memory/localStorage. This keeps it fast, private, and zero-setup.

### Scope

- Sidebar-navigated app shell with Dashboard, Upload, Insights, and Settings routes
- CSV + XLSX upload with auto column detection for: Order ID, Date, Product, Category, Region, Quantity, Unit Price, Revenue
- KPI cards: Total Sales (units), Total Revenue, Total Orders, Avg Order Value
- Charts (Recharts): revenue trend line, monthly sales bar, top products bar, revenue by category pie, revenue by region bar
- Global filters: date range, product, category, region — all charts/KPIs react
- Auto-generated insights (best product, top category, top region, MoM growth %)
- Export filtered data → CSV; export dashboard summary → PDF
- Dark/Light mode toggle, responsive layout, hover-elevated cards

### Tech

- TanStack Start routes: `/` (dashboard), `/upload`, `/insights`
- `papaparse` for CSV, `xlsx` (SheetJS) for Excel
- `recharts` for charts (already idiomatic)
- `jspdf` + `jspdf-autotable` for PDF export
- `zustand` for in-memory dataset + filter state (persisted to localStorage)
- shadcn components: sidebar, card, button, select, popover, calendar, table, tabs, sonner
- next-themes for dark/light toggle

### Routes & Layout

```text
src/routes/
  __root.tsx           // SidebarProvider + ThemeProvider shell
  index.tsx            // Dashboard (KPIs + charts + filters + exports)
  upload.tsx           // File dropzone, column mapping preview, sample data button
  insights.tsx         // Auto-generated narrative insights + supporting mini-charts
```

### Key Modules

- `src/lib/parse.ts` — CSV/XLSX → normalized rows; fuzzy header matching; coerces dates/numbers
- `src/lib/store.ts` — zustand store: `rows`, `filters`, derived selectors
- `src/lib/analytics.ts` — KPI, grouping, MoM growth, top-N helpers
- `src/lib/export.ts` — `toCSV(rows)` and `toPDF(summary, kpis, chartImages)`
- `src/components/dashboard/` — `KpiCard`, `Filters`, `RevenueTrend`, `MonthlySales`, `TopProducts`, `CategoryPie`, `RegionBar`, `InsightsPanel`
- `src/components/app-sidebar.tsx` — nav with Dashboard / Upload / Insights
- `src/components/theme-toggle.tsx`

### Data Flow

1. User uploads file on `/upload` → parsed → normalized rows stored in zustand (+ localStorage)
2. Dashboard reads rows + filters → memoized selectors produce KPIs and chart series
3. Changing any filter triggers recomputation; charts animate
4. Export buttons read currently-filtered rows

### Design

Professional business dashboard: neutral surface with a single accent color, generous spacing, semantic tokens defined in `src/styles.css` (no hardcoded colors). Cards use subtle shadow + hover lift. Icons via lucide-react. Fully responsive — sidebar collapses to icon rail on mobile.

### Out of Scope

- Auth / multi-user / cloud persistence (everything is local to the browser)
- Real-time data sources
- Custom report builder

A sample dataset will be bundled so the dashboard is populated on first load before any upload.
