import { useCallback, useEffect, useState } from "react";
import { getAshaDashboard, getParentDashboard } from "@/lib/api";
import type { DashboardResponse, Role } from "@/types";

export function useDashboardData(role: Role) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = role === "asha"
        ? await getAshaDashboard()
        : await getParentDashboard();
      setData(response);
    } catch (reason) {
      setData(null);
      setError(reason instanceof Error ? reason.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
