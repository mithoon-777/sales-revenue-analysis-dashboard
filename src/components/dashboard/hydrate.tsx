import { useEffect, useState, type ReactNode } from "react";
import { useDashboard } from "@/lib/store";

/**
 * Hydrates the persisted zustand store after mount and seeds sample data
 * if the store is empty. Renders nothing on SSR/first paint to avoid mismatch.
 */
export function StoreHydrate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    useDashboard.persist.rehydrate()?.then?.(() => {
      if (useDashboard.getState().rows.length === 0) {
        useDashboard.getState().loadSample();
      }
      setReady(true);
    });
    // Fallback if rehydrate returns undefined (no async)
    if (useDashboard.getState().rows.length === 0) {
      useDashboard.getState().loadSample();
    }
    setReady(true);
  }, []);
  if (!ready) return <>{fallback ?? null}</>;
  return <>{children}</>;
}
