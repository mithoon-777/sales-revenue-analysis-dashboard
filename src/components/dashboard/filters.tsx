import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboard } from "@/lib/store";
import { uniqueValues } from "@/lib/analytics";

const ALL = "__all__";

export function DashboardFilters() {
  const rows = useDashboard((s) => s.rows);
  const filters = useDashboard((s) => s.filters);
  const setFilter = useDashboard((s) => s.setFilter);
  const reset = useDashboard((s) => s.resetFilters);

  const products = uniqueValues(rows, "product");
  const categories = uniqueValues(rows, "category");
  const regions = uniqueValues(rows, "region");

  const active =
    filters.dateFrom || filters.dateTo || filters.product || filters.category || filters.region;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-1">
          <Label className="mb-1.5 flex items-center gap-1.5 text-xs">
            <CalendarIcon className="h-3 w-3" /> From
          </Label>
          <Input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => setFilter("dateFrom", e.target.value || null)}
          />
        </div>
        <div className="lg:col-span-1">
          <Label className="mb-1.5 flex items-center gap-1.5 text-xs">
            <CalendarIcon className="h-3 w-3" /> To
          </Label>
          <Input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => setFilter("dateTo", e.target.value || null)}
          />
        </div>
        <FilterSelect
          label="Product"
          value={filters.product}
          options={products}
          onChange={(v) => setFilter("product", v)}
        />
        <FilterSelect
          label="Category"
          value={filters.category}
          options={categories}
          onChange={(v) => setFilter("category", v)}
        />
        <FilterSelect
          label="Region"
          value={filters.region}
          options={regions}
          onChange={(v) => setFilter("region", v)}
        />
        <div className="flex items-end">
          <Button variant="outline" className="w-full" onClick={reset} disabled={!active}>
            <X className="mr-1.5 h-4 w-4" /> Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <Select value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? null : v)}>
        <SelectTrigger>
          <SelectValue placeholder={`All ${label.toLowerCase()}s`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All {label.toLowerCase()}s</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
