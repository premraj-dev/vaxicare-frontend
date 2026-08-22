/** Verified Care Console: reusable semantic data display components. */

import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, CircleDashed, Clock3, ShieldCheck } from "lucide-react";
import type { RiskLevel, VaccinationStatus } from "@/types";

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    High: "bg-red-50 text-red-700 ring-red-200",
    Medium: "bg-amber-50 text-amber-800 ring-amber-200",
    Low: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    Normal: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  const Icon = risk === "High" ? AlertTriangle : risk === "Medium" ? Clock3 : risk === "Low" ? ShieldCheck : CheckCircle2;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${styles[risk]}`}><Icon className="h-3.5 w-3.5" />{risk} risk</span>;
}

export function StatusBadge({ status }: { status: VaccinationStatus | "Scheduled" | "Sent" | "Immediate action" | "Resolved" | "Completed" | "Pending" }) {
  const label = status.toString();
  const style = label === "Completed" || label === "Resolved" || label === "Sent"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : label === "Overdue" || label === "Immediate action"
      ? "bg-red-50 text-red-700 ring-red-200"
      : label === "Missed"
        ? "bg-amber-50 text-amber-800 ring-amber-200"
        : "bg-blue-50 text-blue-700 ring-blue-200";
  const Icon = label === "Completed" || label === "Resolved" || label === "Sent" ? CheckCircle2 : label === "Overdue" || label === "Immediate action" ? AlertTriangle : label === "Missed" ? Clock3 : CircleDashed;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${style}`}><Icon className="h-3.5 w-3.5" />{label}</span>;
}

export function StatCard({ icon: Icon, label, value, description, tone = "navy" }: { icon: LucideIcon; label: string; value: string | number; description: string; tone?: "navy" | "teal" | "amber" | "red" | "blue" }) {
  const tones = {
    navy: "bg-navy text-white shadow-navy/20",
    teal: "bg-teal text-white shadow-teal/20",
    amber: "bg-amber-50 text-amber-950 shadow-amber-100",
    red: "bg-red-50 text-red-950 shadow-red-100",
    blue: "bg-blue-50 text-blue-950 shadow-blue-100",
  };
  const iconBg = tone === "navy" || tone === "teal" ? "bg-white/14 text-white" : "bg-white text-current";
  const muted = tone === "navy" || tone === "teal" ? "text-white/70" : "text-current/60";
  return <div className={`card-lift rounded-2xl p-5 shadow-lg ${tones[tone]}`}><div className="flex items-start justify-between"><div><p className={`text-xs font-bold uppercase tracking-[0.12em] ${muted}`}>{label}</p><p className="mt-2 font-display text-3xl font-extrabold tracking-tight">{value}</p></div><div className={`grid h-10 w-10 place-items-center rounded-xl ${iconBg}`}><Icon className="h-5 w-5" /></div></div><p className={`mt-4 text-sm ${muted}`}>{description}</p></div>;
}

export function SectionHeading({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div>{eyebrow && <div className="mb-1 flex items-center gap-2"><span className="h-0.5 w-5 rounded-full bg-coral" /><p className="care-kicker">{eyebrow}</p></div>}<h2 className="font-display text-2xl font-extrabold tracking-tight text-ink md:text-3xl">{title}</h2>{detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}</div>{action}</div>;
}

export function ProgressLine({ value, label, accent = "teal" }: { value: number; label: string; accent?: "teal" | "amber" | "red" | "blue" }) {
  const colors = { teal: "bg-teal", amber: "bg-amber-400", red: "bg-red-500", blue: "bg-blue-500" };
  return <div><div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-slate-600">{label}</span><span className="font-bold text-ink">{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${colors[accent]}`} style={{ width: `${value}%` }} /></div></div>;
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center"><CheckCircle2 className="h-8 w-8 text-teal" /><p className="mt-3 font-display text-lg font-bold text-ink">{title}</p><p className="mt-1 max-w-sm text-sm text-slate-500">{detail}</p></div>;
}
