import { Link } from "wouter";
import { RiskBadge, StatusBadge } from "@/components/Ui";
import type { DashboardChild, DashboardIntervention } from "@/types";

export function RiskReasonList({ reasons }: { reasons: string[] }) {
  if (reasons.length === 0) {
    return <span className="text-xs text-slate-500">No risk reasons returned by the prediction.</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {reasons.map((reason) => (
        <span key={reason} className="inline-flex rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
          {reason}
        </span>
      ))}
    </div>
  );
}

export function RiskPreviewItem({ child }: { child: DashboardChild }) {
  return (
    <article className="rounded-xl border border-red-100 bg-red-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-ink">{child.childName}</p>
        <RiskBadge risk={child.riskLevel ?? "Normal"} />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {child.village || "Village unassigned"} · {child.daysOverdue} days overdue
      </p>
      <div className="mt-3"><RiskReasonList reasons={child.risk_reasons.slice(0, 2)} /></div>
    </article>
  );
}

export function InterventionTypeLabel({ type }: { type: DashboardIntervention["type"] }) {
  return <span className="capitalize">{type.replace("_", " ")}</span>;
}

export function InterventionPreviewItem({ record }: { record: DashboardIntervention }) {
  return (
    <article className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div>
        <p className="font-bold text-ink">{record.childName}</p>
        <p className="mt-1 text-xs text-slate-500">
          <InterventionTypeLabel type={record.type} /> · {new Date(record.date).toLocaleDateString()}
        </p>
        {record.note && <p className="mt-2 text-sm text-slate-600">{record.note}</p>}
      </div>
      <StatusBadge status={record.status} />
    </article>
  );
}

export function PreviewLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="secondary-button text-xs py-2 px-3.5">{children}</Link>;
}
