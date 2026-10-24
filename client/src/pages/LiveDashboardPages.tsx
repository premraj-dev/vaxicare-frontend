import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, Calendar, CalendarClock, Home, Phone, Plus, Search, Send, ShieldAlert, Sparkles, UsersRound, X } from "lucide-react";
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

const MOCK_RISK_QUEUE: DashboardChild[] = [
  {
    id: "mock-child-1",
    childId: "VC-1042",
    childName: "Anaya Patil",
    parentName: "Meera Patil",
    parentEmail: "meera.patil@example.test",
    guardianPhone: "+91 90000 10042",
    dob: "2024-02-14",
    gender: "Female",
    village: "Wagholi",
    lastVaccine: "OPV 2",
    nextVaccine: "DPT 3",
    nextDueDate: "2026-10-10",
    missedDoses: 2,
    daysOverdue: 14,
    dropoutProbability: 0.84,
    riskLevel: "High",
    priorityScore: 91.4,
    risk_reasons: ["Multiple missed doses", "More than 10 days overdue"],
    isDemo: true,
    completionRate: 58,
  },
  {
    id: "mock-child-2",
    childId: "VC-1087",
    childName: "Rohan Shinde",
    parentName: "Sunita Shinde",
    parentEmail: "sunita.shinde@example.test",
    guardianPhone: "+91 90000 10087",
    dob: "2023-11-03",
    gender: "Male",
    village: "Kesnand",
    lastVaccine: "DPT 2",
    nextVaccine: "Measles 1",
    nextDueDate: "2026-10-18",
    missedDoses: 1,
    daysOverdue: 6,
    dropoutProbability: 0.67,
    riskLevel: "High",
    priorityScore: 78.2,
    risk_reasons: ["Recent dose delay", "Upcoming catch-up needed"],
    isDemo: true,
    completionRate: 71,
  },
  {
    id: "mock-child-3",
    childId: "VC-1126",
    childName: "Ira Jadhav",
    parentName: "Pooja Jadhav",
    parentEmail: "pooja.jadhav@example.test",
    guardianPhone: "+91 90000 10126",
    dob: "2025-01-22",
    gender: "Female",
    village: "Lohgaon",
    lastVaccine: "OPV 1",
    nextVaccine: "DPT 2",
    nextDueDate: "2026-11-02",
    missedDoses: 0,
    daysOverdue: 0,
    dropoutProbability: 0.42,
    riskLevel: "Medium",
    priorityScore: 54.6,
    risk_reasons: ["Dose due soon"],
    isDemo: true,
    completionRate: 76,
  },
  {
    id: "mock-child-4",
    childId: "VC-1159",
    childName: "Kabir More",
    parentName: "Asha More",
    parentEmail: "asha.more@example.test",
    guardianPhone: "+91 90000 10159",
    dob: "2024-08-09",
    gender: "Male",
    village: "Wagholi",
    lastVaccine: "BCG",
    nextVaccine: "OPV 1",
    nextDueDate: "2026-10-28",
    missedDoses: 0,
    daysOverdue: 0,
    dropoutProbability: 0.24,
    riskLevel: "Low",
    priorityScore: 28.3,
    risk_reasons: [],
    isDemo: true,
    completionRate: 88,
  },
  {
    id: "mock-child-5",
    childId: "VC-1193",
    childName: "Diya Kulkarni",
    parentName: "Neha Kulkarni",
    parentEmail: "neha.kulkarni@example.test",
    guardianPhone: "+91 90000 10193",
    dob: "2023-06-30",
    gender: "Female",
    village: "Kesnand",
    lastVaccine: "Measles 1",
    nextVaccine: "DPT Booster",
    nextDueDate: "2026-12-15",
    missedDoses: 0,
    daysOverdue: 0,
    dropoutProbability: 0.12,
    riskLevel: "Low",
    priorityScore: 16.8,
    risk_reasons: [],
    isDemo: true,
    completionRate: 95,
  },
  {
    id: "mock-child-6",
    childId: "VC-1238",
    childName: "Aditi Deshmukh",
    parentName: "Kavita Deshmukh",
    parentEmail: "kavita.deshmukh@example.test",
    guardianPhone: "+91 90000 10238",
    dob: "2024-05-16",
    gender: "Female",
    village: "Kesnand",
    lastVaccine: "DPT 1",
    nextVaccine: "OPV 2",
    nextDueDate: "2026-11-08",
    missedDoses: 1,
    daysOverdue: 0,
    dropoutProbability: 0.51,
    riskLevel: "Medium",
    priorityScore: 47.5,
    risk_reasons: ["One dose needs follow-up"],
    isDemo: true,
    completionRate: 73,
  },
  {
    id: "mock-child-7",
    childId: "VC-1274",
    childName: "Arjun Pawar",
    parentName: "Sonal Pawar",
    parentEmail: "sonal.pawar@example.test",
    guardianPhone: "+91 90000 10274",
    dob: "2023-09-12",
    gender: "Male",
    village: "Lohgaon",
    lastVaccine: "OPV 3",
    nextVaccine: "Measles 1",
    nextDueDate: "2026-11-20",
    missedDoses: 0,
    daysOverdue: 0,
    dropoutProbability: 0.19,
    riskLevel: "Low",
    priorityScore: 22.1,
    risk_reasons: [],
    isDemo: true,
    completionRate: 91,
  },
];

export function AshaRiskDashboard() {
  const [, setLocation] = useLocation();
  const [children, setChildren] = useState(MOCK_RISK_QUEUE);
  const [risk, setRisk] = useState<"All" | RiskLevel>("All");
  const [query, setQuery] = useState("");
  const [showAllChildren, setShowAllChildren] = useState(false);
  const [activeChild, setActiveChild] = useState<ChildRecord | null>(null);
  const [action, setAction] = useState<ActionType>("reminder");
  const [selectedChild, setSelectedChild] = useState<DashboardChild | null>(null);
  const [showRegisterChild, setShowRegisterChild] = useState(false);

  const rankedChildren = useMemo(() => {
    const matchingRisk = risk === "All"
      ? children
      : children.filter((child) => child.riskLevel?.toLowerCase() === risk.toLowerCase());
    const riskResults = matchingRisk.length > 0 ? matchingRisk : children;
    const normalizedQuery = query.trim().toLowerCase();

    return riskResults
      .filter((child) => `${child.childName} ${child.childId} ${child.village}`.toLowerCase().includes(normalizedQuery))
      .sort((left, right) => right.priorityScore - left.priorityScore);
  }, [children, risk, query]);
  const villageGroups = useMemo(() => {
    const groups = new Map<string, number>();
    for (const child of children) {
      groups.set(child.village || "Unassigned village", (groups.get(child.village || "Unassigned village") ?? 0) + 1);
    }
    return Array.from(groups.entries(), ([village, totalChildren]) => ({ village, totalChildren }));
  }, [children]);
  const visibleChildren = showAllChildren ? rankedChildren : rankedChildren.slice(0, 5);
  const begin = (child: DashboardChild, type: ActionType, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setAction(type);
    setActiveChild(childRecord(child));
  };

  return (
    <AppShell role="asha">
      <div className="min-w-0 space-y-2 sm:space-y-3">
        <header className="min-w-0 flex-none">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-teal">Today’s priority queue</p>
          <h1 className="mt-1 break-words font-display text-xl font-extrabold text-ink sm:text-2xl">High-risk queue & village capacity</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Assigned children are ordered by their stored prediction priority score.</p>
        </header>
        <div className="flex flex-none flex-wrap items-center gap-2">
          <DemoDataBadge />
          <button type="button" onClick={() => setShowRegisterChild(true)} className="primary-button">
            <Plus className={iconClass} /> Add/Link Child
          </button>
        </div>
        <section className="min-w-0 flex-none rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <SectionHeading eyebrow="Assigned children" title="Village workload" detail="Children linked to your ASHA worker profile." />
          {villageGroups.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No village workload is available in the sample data.</p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {villageGroups.map((group) => (
                <div key={group.village} className="rounded-2xl border border-teal-100 bg-teal-50/50 p-2.5 sm:p-3">
                  <p className="font-bold text-ink">{group.village}</p>
                  <p className="mt-1 text-xs text-slate-500">{group.totalChildren} assigned children</p>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm sm:p-4">
          <div className="flex flex-none flex-col gap-2 sm:gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <SectionHeading title="Ranked care queue" detail="Sorted by the stored prediction priority score." />
              {rankedChildren.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllChildren((showing) => !showing)}
                  className="secondary-button min-h-8 px-3 py-1 text-xs"
                >
                  {showAllChildren ? "Show fewer" : `View All (${rankedChildren.length})`}
                </button>
              )}
            </div>
            <div className="flex min-w-0 flex-wrap gap-2">
              <div className="relative min-w-0 flex-1 sm:flex-none">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="field-control w-full pl-9 sm:w-56" placeholder="Search child or village" />
              </div>
              {(["All", "High", "Medium", "Low"] as const).map((level) => (
                <button key={level} onClick={() => setRisk(level)} className={risk === level ? "primary-button" : "secondary-button"}>{level}</button>
              ))}
            </div>
          </div>
          {rankedChildren.length === 0 && <p className="mt-2 flex-none text-sm text-slate-500">No assigned children match this search.</p>}
          <div className="mt-3 w-full overflow-x-auto rounded-xl border border-slate-200">
            <table className="data-table w-full text-slate-700">
              <thead>
                <tr><th>Child / Village</th><th>Last / next vaccine</th><th>Missed</th><th>Overdue</th><th>ML probability</th><th>Risk</th><th>Priority</th><th>Risk reasons</th><th>Action</th></tr>
              </thead>
              <tbody>
                {visibleChildren.map((child) => (
                  <tr
                    key={child.id}
                    className={`cursor-pointer focus-within:bg-teal-50/60 hover:bg-teal-50/40 ${child.riskLevel === "High" ? "bg-red-50/40" : ""}`}
                    onClick={() => setSelectedChild(child)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedChild(child);
                      }
                    }}
                    tabIndex={0}
                    aria-label={`Open actions for ${child.childName}`}
                  >
                    <td><p className="font-bold text-ink">{child.childName}</p><p className="text-xs text-slate-400">{child.childId} · <strong>{child.village || "—"}</strong></p></td>
                    <td><p>{child.lastVaccine} → <strong className="text-ink">{child.nextVaccine}</strong></p><p className="text-xs text-slate-400">Due {child.nextDueDate ?? "—"}</p></td>
                    <td className="font-bold text-ink">{child.missedDoses}</td>
                    <td>{child.daysOverdue ? <span className="font-bold text-red-700">{child.daysOverdue} days</span> : "—"}</td>
                    <td className="font-bold text-ink">{Math.round(child.dropoutProbability * 100)}%</td>
                    <td><RiskBadge risk={child.riskLevel ?? "Normal"} /></td>
                    <td><span className="font-display text-lg font-extrabold text-ink">{child.priorityScore.toFixed(1)}</span></td>
                    <td><RiskReasonList reasons={child.risk_reasons} /></td>
                    <td><div className="flex gap-2"><button onClick={(event) => begin(child, "call", event)} className="secondary-button min-h-9 px-3 py-1.5" aria-label={`Record call for ${child.childName}`}><Phone className={iconClass} /></button><button onClick={(event) => begin(child, child.riskLevel === "High" ? "reminder" : "visit", event)} className={child.riskLevel === "High" ? "danger-button min-h-9 px-3 py-1.5" : "primary-button min-h-9 px-3 py-1.5"}>{child.riskLevel === "High" ? "Record reminder" : "Take action"}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </section>
      </div>
      {activeChild && <ActionModal child={activeChild} type={action} onClose={() => setActiveChild(null)} />}
      {selectedChild && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedChild(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="child-actions-title" className="modal-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-teal">Child record</p>
                <h2 id="child-actions-title" className="mt-1 font-display text-xl font-extrabold text-ink">{selectedChild.childName}</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedChild.childId} · {selectedChild.village || "Village not assigned"}</p>
              </div>
              <button type="button" aria-label="Close child actions" onClick={() => setSelectedChild(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => { setSelectedChild(null); setLocation("/asha/vaccination-entry"); }}
                className="primary-button min-h-12 justify-center"
              >
                <Calendar className={iconClass} /> Vaccine Entry
              </button>
              <button
                type="button"
                onClick={() => { setSelectedChild(null); setShowRegisterChild(true); }}
                className="secondary-button min-h-12 justify-center"
              >
                <Plus className={iconClass} /> Add/Link Child
              </button>
            </div>
          </section>
        </div>
      )}
      {showRegisterChild && (
        <RegisterChildModal
          onClose={() => setShowRegisterChild(false)}
          onSaved={(child) => {
            setChildren((current) => [child, ...current]);
            setShowRegisterChild(false);
            toast.success(`${child.childName} was added to this demo queue locally.`);
          }}
        />
      )}
    </AppShell>
  );
}

function RegisterChildModal({ onClose, onSaved }: { onClose: () => void; onSaved: (child: DashboardChild) => void }) {
  const [childName, setChildName] = useState("");
  const [childId, setChildId] = useState("");
  const [village, setVillage] = useState("Jategaon Bk");
  const [gender, setGender] = useState<"Female" | "Male">("Female");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedId = childId.trim().toUpperCase();
    const normalizedName = childName.trim();
    if (!normalizedName || !normalizedId) return;
    onSaved({
      id: `offline-${normalizedId}`,
      childId: normalizedId,
      childName: normalizedName,
      parentName: "Demo Parent",
      parentEmail: "parent@example.test",
      guardianPhone: "Not provided",
      dob: "",
      gender,
      village: village.trim() || "Unassigned village",
      lastVaccine: "Not recorded",
      nextVaccine: "BCG",
      nextDueDate: null,
      missedDoses: 0,
      daysOverdue: 0,
      dropoutProbability: 0,
      riskLevel: "Low",
      priorityScore: 0,
      risk_reasons: [],
      isDemo: true,
      completionRate: 0,
    });
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="register-child-title" className="modal-card max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-teal">Offline demo</p>
            <h2 id="register-child-title" className="mt-1 font-display text-xl font-extrabold text-ink">Add a sample child</h2>
            <p className="mt-1 text-sm text-slate-500">This child is added to the current page only and is not sent to a server.</p>
          </div>
          <button type="button" aria-label="Close child registration" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field-label">Child name<input className="field-control" value={childName} onChange={(event) => setChildName(event.target.value)} required maxLength={100} /></label>
            <label className="field-label">Child ID<input className="field-control" value={childId} onChange={(event) => setChildId(event.target.value)} required maxLength={30} /></label>
            <label className="field-label">Village<input className="field-control" value={village} onChange={(event) => setVillage(event.target.value)} maxLength={100} /></label>
            <label className="field-label">Gender<select className="field-control" value={gender} onChange={(event) => setGender(event.target.value as "Female" | "Male")}><option>Female</option><option>Male</option></select></label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="secondary-button">Cancel</button>
            <button type="submit" className="primary-button">Add sample child</button>
          </div>
        </form>
      </section>
    </div>
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
