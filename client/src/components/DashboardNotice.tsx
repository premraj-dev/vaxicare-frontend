export function DashboardNotice({
  loading,
  error,
  empty,
  emptyMessage = "No records are available for this account.",
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage?: string;
}) {
  if (loading) {
    return <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500" role="status">Loading live Supabase data…</p>;
  }

  if (error) {
    return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>;
  }

  if (empty) {
    return <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">{emptyMessage}</p>;
  }

  return null;
}

export function DemoDataBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
      Simulated demo data
    </span>
  );
}
