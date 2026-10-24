import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { AshaDashboard, ParentDashboard } from "@/components/DashboardViews";
import type { AshaDashboardResponse, ParentDashboardResponse } from "@/types";

function useDashboardData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const headers = new Headers();
        const accessToken = window.localStorage.getItem("access_token");
        if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers,
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Dashboard request failed (${response.status}).`);
        }

        const result = (await response.json()) as T;
        if (!controller.signal.aborted) setData(result);
      } catch (reason) {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Unable to load dashboard data.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadDashboard();
    return () => controller.abort();
  }, [endpoint]);

  return { data, isLoading, error };
}

function DashboardLoadState({
  isLoading,
  error,
}: {
  isLoading: boolean;
  error: string | null;
}) {
  if (isLoading) {
    return <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600" role="status">Loading data...</p>;
  }

  if (error) {
    return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>;
  }

  return null;
}

export function ParentDashboardPage() {
  const { data, isLoading, error } =
    useDashboardData<ParentDashboardResponse>("/api/dashboard/parent");

  if (isLoading || error) {
    return <DashboardLoadState isLoading={isLoading} error={error} />;
  }
  if (!data) {
    return <p role="alert">No dashboard data received.</p>;
  }

  return <ParentDashboard data={data} />;
}

export function AshaDashboardPage() {
  const { data, isLoading, error } =
    useDashboardData<AshaDashboardResponse>("/api/dashboard/asha");

  if (isLoading || error) {
    return <DashboardLoadState isLoading={isLoading} error={error} />;
  }
  if (!data) {
    return <p role="alert">No dashboard data received.</p>;
  }

  return <AshaDashboard data={data} />;
}
