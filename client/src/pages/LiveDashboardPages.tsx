import { useMemo, useState } from "react";
import { AlertTriangle, Calendar, CalendarClock, Home, Phone, Search, Send, ShieldAlert, Sparkles, UsersRound } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { ActionModal, type ActionType } from "@/components/ActionModal";
import { DemoDataBadge } from "@/components/DashboardNotice";
import { AppShell } from "@/components/AppShell";
import { RiskBadge, SectionHeading, StatusBadge } from "@/components/Ui";
import { InterventionTypeLabel, RiskReasonList } from "@/components/DashboardPreview";
import { assets } from "@/data/mockData";
import { DEMO_ASHA_DASHBOARD } from "@/data/demoDashboard";
import { PageHero } from "@/pages/PortalPages";
import type { ChildRecord, DashboardChild, DashboardIntervention, RiskLevel } from "@/types";

const iconClass = "h-4 w-4";
const riskColors: Record<string, string> = {
  High: "#dc2626",
  Medium: "#f59e0b",
  Low: "#0f766e",
  Normal: "#94a3b8",
  Completed: "#0f766e",
  Pending: "#2563eb",
  Overdue: "#dc2626",
};

function ChartCard({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-6">
      <h2 className="font-display text-xl font-extrabold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricLegend({ data }: { data: Array<{ label: string; value: number }> }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
      {data.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: riskColors[item.label] ?? "#12324a" }} />
          {item.label} <strong>{item.value}</strong>
        </span>
      ))}
    </div>
  );
}

function DashboardShellNotice({
  data,
}: {
  data: { demoDataPresent: boolean };
}) {
  return (
    data.demoDataPresent ? <DemoDataBadge /> : null
  );
}

function childRecord(child: DashboardChild): ChildRecord {
  return child;
}

export function AshaRiskDashboard() {
  const data = DEMO_ASHA_DASHBOARD;
  const [risk, setRisk] = useState<"All" | RiskLevel>("All");
  const [query, setQuery] = useState("");
  const [activeChild, setActiveChild] = useState<ChildRecord | null>(null);
  const [action, setAction] = useState<ActionType>("reminder");

  const rankedChildren = useMemo(
    () => data.children
      .filter((child) => child.riskLevel !== null)
      .filter((child) => risk === "All" || child.riskLevel === risk)
      .filter((child) => `${child.childName} ${child.childId} ${child.village}`.toLowerCase().includes(query.toLowerCase()))
      .sort((left, right) => right.priorityScore - left.priorityScore),
    [data, risk, query],
  );
  const villageGroups = useMemo(() => {
    const groups = new Map<string, number>();
    for (const child of data.children) {
      groups.set(child.village || "Unassigned village", (groups.get(child.village || "Unassigned village") ?? 0) + 1);
    }
    return Array.from(groups.entries(), ([village, totalChildren]) => ({ village, totalChildren }));
  }, [data]);
  const begin = (child: DashboardChild, type: ActionType) => {
    setAction(type);
    setActiveChild(childRecord(child));
  };

  return (
    <AppShell role="asha">
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-teal">Today’s priority queue</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">High-risk queue & village capacity</h1>
        <p className="mt-2 text-sm text-slate-500">Sample community profiles are ordered by demo priority score.</p>
      </header>
      <div className="my-4 flex flex-wrap items-center gap-3">
        <DashboardShellNotice data={data} />
      </div>
      <section className="mb-7 surface-card p-6">
        <SectionHeading eyebrow="Assigned children" title="Village workload" detail="Sample children assigned to the Jategaon Bk demo community." />
        {villageGroups.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No assigned children are available.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {villageGroups.map((group) => (
              <div key={group.village} className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
                <p className="font-bold text-ink">{group.village}</p>
                <p className="mt-2 text-xs text-slate-500">{group.totalChildren} assigned children</p>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="surface-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading title="Ranked care queue" detail="Sorted by the stored prediction priority score." />
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="field-control w-56 pl-9" placeholder="Search child or village" />
            </div>
            {(["All", "High", "Medium", "Low"] as const).map((level) => (
              <button key={level} onClick={() => setRisk(level)} className={risk === level ? "primary-button" : "secondary-button"}>{level}</button>
            ))}
          </div>
        </div>
        {rankedChildren.length === 0 && <p className="mt-4 text-sm text-slate-500">No demo profiles match this search.</p>}
        <div className="mt-5 table-wrap">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Child / Village</th><th>Last / next vaccine</th><th>Missed</th><th>Overdue</th><th>ML probability</th><th>Risk</th><th>Priority</th><th>Risk reasons</th><th>Action</th></tr>
              </thead>
              <tbody>
                {rankedChildren.map((child) => (
                  <tr key={child.id} className={child.riskLevel === "High" ? "bg-red-50/40" : ""}>
                    <td><p className="font-bold text-ink">{child.childName}</p><p className="text-xs text-slate-400">{child.childId} · <strong>{child.village || "—"}</strong></p></td>
                    <td><p>{child.lastVaccine} → <strong className="text-ink">{child.nextVaccine}</strong></p><p className="text-xs text-slate-400">Due {child.nextDueDate ?? "—"}</p></td>
                    <td className="font-bold text-ink">{child.missedDoses}</td>
                    <td>{child.daysOverdue ? <span className="font-bold text-red-700">{child.daysOverdue} days</span> : "—"}</td>
                    <td className="font-bold text-ink">{Math.round(child.dropoutProbability * 100)}%</td>
                    <td><RiskBadge risk={child.riskLevel ?? "Normal"} /></td>
                    <td><span className="font-display text-lg font-extrabold text-ink">{child.priorityScore.toFixed(1)}</span></td>
                    <td><RiskReasonList reasons={child.risk_reasons} /></td>
                    <td><div className="flex gap-2"><button onClick={() => begin(child, "call")} className="secondary-button min-h-9 px-3 py-1.5" aria-label={`Record call for ${child.childName}`}><Phone className={iconClass} /></button><button onClick={() => begin(child, child.riskLevel === "High" ? "reminder" : "visit")} className={child.riskLevel === "High" ? "danger-button min-h-9 px-3 py-1.5" : "primary-button min-h-9 px-3 py-1.5"}>{child.riskLevel === "High" ? "Record reminder" : "Take action"}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {activeChild && <ActionModal child={activeChild} type={action} onClose={() => setActiveChild(null)} />}
    </AppShell>
  );
}

export function AshaInterventions() {
  const [records, setRecords] = useState(DEMO_ASHA_DASHBOARD.interventions);
  const [activeChild, setActiveChild] = useState<ChildRecord | null>(null);
  const [action, setAction] = useState<ActionType>("call");
  const [filter, setFilter] = useState("All");
  const data = DEMO_ASHA_DASHBOARD;
  const visibleRecords = records.filter(
    (record) => filter === "All" || record.status.toLowerCase() === filter.toLowerCase(),
  );
  const begin = (type: ActionType) => {
    if (!data.children[0]) {
      toast.error("No child is assigned to your account yet.");
      return;
    }
    setAction(type);
    setActiveChild(childRecord(data.children[0]));
  };
  const resolveAction = (record: DashboardIntervention) => {
    setRecords((current) => current.map((item) => item.id === record.id
      ? { ...item, status: "resolved", resolvedAt: new Date().toISOString() }
      : item));
    toast.success(`${record.childName}'s sample intervention was resolved locally.`);
  };

  return (
    <AppShell role="asha">
      <PageHero eyebrow="Interventions" title="Turn priorities into completed care" detail="Actions are persisted to Supabase and scoped to your assigned children." image={assets.ashaCare} />
      <div className="my-4"><DemoDataBadge /></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { type: "call", label: "Call parent", icon: Phone },
          { type: "reminder", label: "Record reminder", icon: Send },
          { type: "visit", label: "Home visit", icon: Home },
          { type: "followup", label: "Schedule follow-up", icon: CalendarClock },
        ].map(({ type, label, icon: Icon }) => (
          <button key={type} onClick={() => begin(type as ActionType)} className="card-lift surface-card flex items-center gap-4 p-5 text-left transition hover:border-teal">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal"><Icon className="h-5 w-5" /></span>
            <span><span className="block font-display text-lg font-extrabold text-ink">{label}</span><span className="mt-1 block text-xs text-slate-500">Record a frontline action</span></span>
          </button>
        ))}
      </div>
      <section className="mt-7 surface-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading title="Intervention history" detail="Actions linked to children assigned to your account." />
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="field-control max-w-44">
            <option value="All">All</option><option value="scheduled">Scheduled</option><option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="table-wrap">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Child</th><th>Intervention</th><th>Date</th><th>Note</th><th>Status</th><th>Resolve</th></tr></thead>
              <tbody>
                {visibleRecords.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-slate-500">No intervention records match this filter.</td></tr>}
                {visibleRecords.map((record) => (
                  <tr key={record.id}>
                    <td><p className="font-bold text-ink">{record.childName}</p><p className="text-xs text-slate-400">{record.childId}</p></td>
                    <td><InterventionTypeLabel type={record.type} /></td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td className="max-w-80">{record.note || "—"}</td>
                    <td><StatusBadge status={record.status} /></td>
                    <td>{record.status.toLowerCase() === "resolved" ? <span className="text-xs text-slate-400">Resolved</span> : <button onClick={() => void resolveAction(record)} className="secondary-button min-h-9 px-3 py-1.5">Resolve</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {activeChild && <ActionModal child={activeChild} type={action} onClose={() => setActiveChild(null)} />}
    </AppShell>
  );
}

export function AshaAnalytics() {
  const data = DEMO_ASHA_DASHBOARD;
  const analytics = data.analytics;
  const riskData = (analytics?.riskDistribution ?? []).map((item) => ({ ...item, fill: riskColors[item.label] }));
  const vaccinationData = analytics?.vaccinationDistribution ?? [];
  const monthlyData = analytics?.monthlyTrend ?? [];
  const interventionData = analytics?.interventionDistribution ?? [];

  return (
    <AppShell role="asha">
      <PageHero eyebrow="Area analytics" title="Understand your area's vaccination rhythm" detail="Counts and charts are calculated from your assigned children, vaccination records, predictions, and interventions." image={assets.ashaCare} />
      <div className="my-4 flex flex-wrap items-center gap-3">
        <DashboardShellNotice data={data} />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Vaccination status" detail="Counts derived from recorded dose dates and due dates.">
          <ResponsiveContainer width="100%" height={270}>
            <PieChart><Pie data={vaccinationData} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={62} outerRadius={90} paddingAngle={4}>{vaccinationData.map((item) => <Cell key={item.label} fill={riskColors[item.label] ?? "#2563eb"} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
          <MetricLegend data={vaccinationData} />
        </ChartCard>
        <ChartCard title="Latest risk distribution" detail="One latest stored prediction per assigned child.">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={riskData}><CartesianGrid vertical={false} stroke="#e5edf0" /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="value" radius={[7, 7, 0, 0]}>{riskData.map((item) => <Cell key={item.label} fill={item.fill} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Recent activity" detail="Monthly vaccinations and recorded follow-ups.">
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={monthlyData}><defs><linearGradient id="liveVaccinations" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity=".25" /><stop offset="100%" stopColor="#0f766e" stopOpacity="0" /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e5edf0" /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Area type="monotone" dataKey="vaccinations" stroke="#0f766e" fill="url(#liveVaccinations)" strokeWidth={3} /><Area type="monotone" dataKey="followUps" stroke="#2563eb" fill="transparent" strokeWidth={2} /></AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Interventions by type" detail="Actions recorded for assigned children.">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={interventionData} layout="vertical"><CartesianGrid horizontal={false} stroke="#e5edf0" /><XAxis type="number" allowDecimals={false} hide /><YAxis type="category" dataKey="label" width={100} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="value" fill="#12324a" radius={[0, 7, 7, 0]} /></BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </AppShell>
  );
}
