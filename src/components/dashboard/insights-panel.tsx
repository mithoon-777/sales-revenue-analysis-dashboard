import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateInsights } from "@/lib/analytics";
import type { SalesRow } from "@/lib/types";
import { cn } from "@/lib/utils";

export function InsightsPanel({ rows }: { rows: SalesRow[] }) {
  const insights = generateInsights(rows);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2.5">
        {insights.length === 0 && (
          <p className="text-sm text-muted-foreground">Upload data to see insights.</p>
        )}
        {insights.map((i) => (
          <div
            key={i.label}
            className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{i.label}</p>
              <p className="truncate text-sm font-semibold">{i.value}</p>
            </div>
            <div
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                i.tone === "up" && "bg-success/15 text-success",
                i.tone === "down" && "bg-destructive/15 text-destructive",
                i.tone === "neutral" && "bg-muted text-muted-foreground",
              )}
            >
              {i.tone === "down" ? (
                <ArrowDownRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowUpRight className="h-3.5 w-3.5" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
