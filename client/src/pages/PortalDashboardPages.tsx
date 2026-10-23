import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  HeartPulse,
  MapPin,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { DemoDataBadge } from "@/components/DashboardNotice";
import {
  InterventionPreviewItem,
  PreviewLink,
  RiskPreviewItem,
} from "@/components/DashboardPreview";
import { ProgressLine, RiskBadge, SectionHeading, StatCard, StatusBadge } from "@/components/Ui";
import {
  type Child,
  type ImmunizationRecord,
  type Vaccine,
} from "@/lib/api";
import {
  DEMO_ASHA_DASHBOARD,
  DEMO_COMMUNITY_RISK_COUNTS,
  DEMO_PARENT_DASHBOARD,
} from "@/data/demoDashboard";
import { formatDashboardDate } from "@/pages/dashboardUtils";
import type { DashboardChild } from "@/types";

function PageHeading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return (
    <header className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-teal">{eyebrow}</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </header>
  );
}

function logout(setLocation: (path: string) => void) {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_profile");
  setLocation("/login");
}

function formatChildAge(dateOfBirth: string): string {
  const birthDate = new Date(`${dateOfBirth}T00:00:00Z`);
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const birthUtc = Date.UTC(birthDate.getUTCFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate());
  if (Number.isNaN(birthUtc) || birthUtc > todayUtc) return "Age unavailable";

  let years = today.getUTCFullYear() - birthDate.getUTCFullYear();
  let months = today.getUTCMonth() - birthDate.getUTCMonth();
  let days = today.getUTCDate() - birthDate.getUTCDate();
  if (days < 0) {
    months -= 1;
    const previousMonthDays = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0)).getUTCDate();
    days += previousMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) return `${years} yr${years === 1 ? "" : "s"}${months ? ` ${months} mo` : ""}`;
  if (months > 0) return `${months} mo${months === 1 ? "" : "s"}${days ? ` ${days} d` : ""}`;
  return `${Math.floor((todayUtc - birthUtc) / 86_400_000)} days old`;
}

function dateAtAgeDays(dateOfBirth: string, ageDays: number): string {
  const date = new Date(`${dateOfBirth}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + ageDays);
  return date.toISOString().slice(0, 10);
}

const demoBirthDate = new Date();
demoBirthDate.setUTCMonth(demoBirthDate.getUTCMonth() - 6);
const demoDateOfBirth = demoBirthDate.toISOString().slice(0, 10);

const DEMO_CHILD: Child = {
  id: "demo-aarav-umap",
  parent_id: "demo-parent",
  name: "Aarav Umap",
  date_of_birth: demoDateOfBirth,
  gender: "Male",
  created_at: new Date().toISOString(),
};

const DEMO_VACCINES: Vaccine[] = [
  { id: "demo-bcg", name: "BCG", recommended_age_days: 0, description: "Tuberculosis protection at birth." },
  { id: "demo-opv-0", name: "OPV-0", recommended_age_days: 0, description: "Oral polio birth dose." },
  { id: "demo-hepb-birth", name: "Hepatitis B (birth dose)", recommended_age_days: 0, description: "Birth dose, ideally within 24 hours." },
  { id: "demo-opv-1", name: "OPV-1", recommended_age_days: 42, description: "First primary oral polio dose." },
  { id: "demo-penta-1", name: "Pentavalent-1", recommended_age_days: 42, description: "First primary pentavalent dose." },
  { id: "demo-rota-1", name: "Rotavirus-1", recommended_age_days: 42, description: "First rotavirus dose." },
  { id: "demo-fipv-1", name: "fIPV-1", recommended_age_days: 42, description: "First fractional IPV dose." },
  { id: "demo-pcv-1", name: "PCV-1", recommended_age_days: 42, description: "First pneumococcal conjugate dose." },
  { id: "demo-opv-2", name: "OPV-2", recommended_age_days: 70, description: "Second primary oral polio dose." },
  { id: "demo-penta-2", name: "Pentavalent-2", recommended_age_days: 70, description: "Second primary pentavalent dose." },
  { id: "demo-rota-2", name: "Rotavirus-2", recommended_age_days: 70, description: "Second rotavirus dose." },
  { id: "demo-opv-3", name: "OPV-3", recommended_age_days: 98, description: "Third primary oral polio dose." },
  { id: "demo-penta-3", name: "Pentavalent-3", recommended_age_days: 98, description: "Third primary pentavalent dose." },
  { id: "demo-rota-3", name: "Rotavirus-3", recommended_age_days: 98, description: "Third rotavirus dose." },
  { id: "demo-fipv-2", name: "fIPV-2", recommended_age_days: 98, description: "Second fractional IPV dose." },
  { id: "demo-pcv-2", name: "PCV-2", recommended_age_days: 98, description: "Second pneumococcal conjugate dose." },
  { id: "demo-mr-1", name: "MR-1", recommended_age_days: 270, description: "First measles-rubella dose at 9–12 months." },
  { id: "demo-pcv-booster", name: "PCV booster", recommended_age_days: 270, description: "Pneumococcal booster at 9–12 months." },
  { id: "demo-vit-a-1", name: "Vitamin A - Dose 1", recommended_age_days: 270, description: "First dose with MR-1; subsequent doses are given every 6 months." },
  { id: "demo-je-1", name: "JE-1 (endemic districts)", recommended_age_days: 270, description: "Japanese encephalitis dose for endemic districts." },
  { id: "demo-vit-a-2", name: "Vitamin A - Dose 2", recommended_age_days: 487, description: "Second Vitamin A dose at 16–18 months." },
  { id: "demo-mr-2", name: "MR-2", recommended_age_days: 548, description: "Second measles-rubella dose at 16–24 months." },
  { id: "demo-dpt-booster-1", name: "DPT booster-1", recommended_age_days: 548, description: "First DPT booster at 16–24 months." },
  { id: "demo-opv-booster", name: "OPV booster", recommended_age_days: 548, description: "Oral polio booster at 16–24 months." },
  { id: "demo-je-2", name: "JE-2 (endemic districts)", recommended_age_days: 548, description: "Second Japanese encephalitis dose for endemic districts." },
  { id: "demo-vit-a-3", name: "Vitamin A - Dose 3", recommended_age_days: 670, description: "Vitamin A dose given every 6 months." },
  { id: "demo-vit-a-4", name: "Vitamin A - Dose 4", recommended_age_days: 852, description: "Vitamin A dose given every 6 months." },
  { id: "demo-vit-a-5", name: "Vitamin A - Dose 5", recommended_age_days: 1035, description: "Vitamin A dose given every 6 months." },
  { id: "demo-vit-a-6", name: "Vitamin A - Dose 6", recommended_age_days: 1218, description: "Vitamin A dose given every 6 months." },
  { id: "demo-vit-a-7", name: "Vitamin A - Dose 7", recommended_age_days: 1400, description: "Vitamin A dose given every 6 months." },
  { id: "demo-vit-a-8", name: "Vitamin A - Dose 8", recommended_age_days: 1583, description: "Vitamin A dose given every 6 months." },
  { id: "demo-vit-a-9", name: "Vitamin A - Dose 9", recommended_age_days: 1766, description: "Final routine Vitamin A dose by 5 years." },
  { id: "demo-dpt-booster-2", name: "DPT booster-2", recommended_age_days: 1825, description: "Second DPT booster at 5–6 years." },
  { id: "demo-td-10", name: "Td", recommended_age_days: 3650, description: "Td dose at 10 years." },
  { id: "demo-td-16", name: "Td", recommended_age_days: 5840, description: "Td dose at 16 years." },
];

const DEMO_RECORDS: ImmunizationRecord[] = DEMO_VACCINES
  .filter((vaccine) => vaccine.recommended_age_days <= 70)
  .map((vaccine) => ({
    id: `demo-record-${vaccine.id}`,
    child_id: DEMO_CHILD.id,
    vaccine_id: vaccine.id,
    status: "completed",
    administered_by: null,
    administered_date: dateAtAgeDays(DEMO_CHILD.date_of_birth, vaccine.recommended_age_days),
  }));

export function ParentDashboard() {
  const children = [DEMO_CHILD];
  const vaccines = DEMO_VACCINES;
  const records = DEMO_RECORDS;

  return (
    <AppShell role="parent">
      <div className="min-w-0 space-y-5">
        <PageHeading
          eyebrow="Parent dashboard"
          title="Your family health overview"
          detail="A clear view of your children's immunization progress and upcoming care."
        />
        <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900" role="status">
          Demo preview · sample family data shown locally; no network data is required.
        </p>

        {children.length > 0 && (
          <section className="space-y-5">
            <SectionHeading
              eyebrow="Guardian overview"
              title="Children in your care"
              detail="Track each child's age, profile, and protection progress."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {children.map((child) => {
                const childRecords = records.filter((record) => record.child_id === child.id);
                const completedCount = new Set(
                  childRecords
                    .filter((record) => record.status === "completed")
                    .map((record) => record.vaccine_id)
                    .filter((vaccineId) => vaccines.some((vaccine) => vaccine.id === vaccineId)),
                ).size;
                const progress = vaccines.length ? Math.round((completedCount / vaccines.length) * 100) : 0;

                return (
                  <article key={child.id} className="surface-card flex flex-col overflow-hidden rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-teal-50 via-white to-blue-50 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[.14em] text-teal">Child profile</p>
                          <h2 className="mt-1 font-display text-xl font-extrabold text-ink">{child.name}</h2>
                        </div>
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-teal shadow-sm ring-1 ring-teal-100">
                          <HeartPulse className="h-5 w-5" />
                        </span>
                      </div>
                      <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
                        <CalendarDays className="h-4 w-4 text-teal" /> {formatChildAge(child.date_of_birth)}
                      </p>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date of birth</dt>
                          <dd className="mt-1 font-bold text-ink">{formatDashboardDate(child.date_of_birth)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gender</dt>
                          <dd className="mt-1 font-bold text-ink">{child.gender || "Not specified"}</dd>
                        </div>
                      </dl>
                      <div className="mt-5">
                        {vaccines.length ? (
                          <ProgressLine value={progress} label={`Vaccination progress · ${completedCount}/${vaccines.length} doses`} />
                        ) : (
                          <p className="text-xs text-slate-500">Vaccination schedule is not configured yet.</p>
                        )}
                      </div>
                      <Link href="/parent/vaccination" className="primary-button mt-5 justify-center">
                        View immunization record <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

export function AshaDashboard() {
  const data = DEMO_ASHA_DASHBOARD;
  const metricValue = (value: number) => value;
  const topHighRisk = useMemo(
    () => (data?.children ?? [])
      .filter((child) => child.riskLevel === "High")
      .sort((left, right) => right.priorityScore - left.priorityScore)
      .slice(0, 3),
    [data],
  );
  const latestInterventions = useMemo(
    () => [...(data?.interventions ?? [])]
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 3),
    [data],
  );

  return (
    <AppShell role="asha">
      <div className="min-w-0 space-y-6">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-teal">ASHA dashboard · Jategaon Bk</p>
              <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">Community care overview</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">A local demo of all 37 children in your assigned community.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/asha/risk-dashboard" className="primary-button bg-teal text-white hover:bg-teal-700">
                Review risk queue <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <DemoDataBadge />
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={UsersRound} label="Community children" value={metricValue(data.summary.totalChildren)} description="Jategaon Bk · demo caseload" tone="blue" />
          <StatCard icon={AlertTriangle} label="High risk" value={DEMO_COMMUNITY_RISK_COUNTS.high} description="Priority follow-up" tone="red" />
          <StatCard icon={Calendar} label="Medium risk" value={DEMO_COMMUNITY_RISK_COUNTS.medium} description="Routine follow-up" tone="amber" />
          <StatCard icon={CheckCircle2} label="Low risk" value={DEMO_COMMUNITY_RISK_COUNTS.low} description="On-track monitoring" tone="teal" />
        </section>

        <section className="space-y-4">
          <SectionHeading
            eyebrow="Assigned children"
            title="All 37 child profiles"
            detail="Sample children, guardian details, and current immunization status."
          />
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Child</th><th>Age / gender</th><th>Guardian</th><th>Contact</th><th>Immunization status</th><th>Risk</th></tr>
                </thead>
                <tbody>
                  {data.children.map((child) => {
                    const childRecords = data.vaccinationRecords.filter((record) => record.childId === child.id);
                    const completed = childRecords.filter((record) => record.status === "Completed").length;
                    const overdue = childRecords.filter((record) => record.status === "Overdue").length;
                    const upcoming = childRecords.filter((record) => record.status === "Upcoming").length;
                    return (
                      <tr key={child.id}>
                        <td><p className="font-bold text-ink">{child.childName}</p><p className="text-xs text-slate-400">{child.childId} · {child.village}</p></td>
                        <td>{formatChildAge(child.dob)}<p className="text-xs text-slate-400">{child.gender}</p></td>
                        <td>{child.parentName}</td>
                        <td>{child.guardianPhone}</td>
                        <td><span className="font-semibold text-emerald-700">{completed} complete</span><p className="text-xs text-amber-800">{overdue} overdue</p><p className="text-xs text-slate-500">{upcoming} upcoming</p></td>
                        <td><RiskBadge risk={child.riskLevel ?? "Normal"} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="surface-card p-5 sm:p-6">
          <SectionHeading eyebrow="First-time setup" title="Frontline onboarding & daily checklist" detail="Quick links for area setup, risk review, and vaccine recording." />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ChecklistLink href="/asha/area-registration" icon={<MapPin className="h-5 w-5 text-teal" />} title="Set up area" detail="Confirm area, district, taluka, and village." />
            <ChecklistLink href="/asha/risk-dashboard" icon={<ShieldAlert className="h-5 w-5 text-amber-600" />} title="Review high risk" detail="Prioritize children by stored ML score." />
            <ChecklistLink href="/asha/vaccination-entry" icon={<ClipboardCheck className="h-5 w-5 text-blue-700" />} title="Record vaccine" detail="Record a completed dose for a child." />
          </div>
        </section>

        <section className="surface-card p-5 sm:p-6">
          <SectionHeading
            eyebrow="Priority preview"
            title="Top high-risk children"
            detail="The three highest-priority high-risk children in your assigned queue."
            action={<PreviewLink href="/asha/risk-dashboard">View all <ChevronRight className="h-4 w-4" /></PreviewLink>}
          />
          {topHighRisk.length ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-3">{topHighRisk.map((child) => <RiskPreviewItem key={child.id} child={child} />)}</div>
          ) : (
            <p className="text-sm text-slate-500">No high-risk children in the current queue.</p>
          )}
        </section>

        <section className="surface-card p-5 sm:p-6">
          <SectionHeading
            eyebrow="Recent activity"
            title="Latest interventions"
            detail="The three most recently recorded actions."
            action={<PreviewLink href="/asha/interventions">View all <ChevronRight className="h-4 w-4" /></PreviewLink>}
          />
          {latestInterventions.length ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-3">{latestInterventions.map((record) => <InterventionPreviewItem key={record.id} record={record} />)}</div>
          ) : (
            <p className="text-sm text-slate-500">No interventions have been recorded yet.</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function ChecklistLink({ href, icon, title, detail }: { href: string; icon: React.ReactNode; title: string; detail: string }) {
  return (
    <Link href={href} className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-teal-200 hover:bg-teal-50/40">
      <div className="flex items-center justify-between">{icon}<ChevronRight className="h-5 w-5 text-slate-300" /></div>
      <h2 className="mt-3 font-display text-lg font-extrabold text-ink">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{detail}</p>
    </Link>
  );
}

export function ParentVaccination() {
  const children = [DEMO_CHILD];
  const vaccines = DEMO_VACCINES;
  const records = DEMO_RECORDS;

  const today = new Date().toISOString().slice(0, 10);
  const recordsByChild = useMemo(() => {
    const grouped = new Map<string, ImmunizationRecord[]>();
    for (const record of records) {
      const childRecords = grouped.get(record.child_id) ?? [];
      childRecords.push(record);
      grouped.set(record.child_id, childRecords);
    }
    return grouped;
  }, [records]);

  return (
    <AppShell role="parent">
      <PageHeading eyebrow="Health record" title="Vaccination schedule & history" detail="Your child's immunization schedule based on the Indian National Immunization Schedule." />
      <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900" role="status">
        Demo preview · sample vaccination records are shown locally.
      </p>
      {children.map((child) => {
        const childRecords = recordsByChild.get(child.id) ?? [];
        const schedule = vaccines.map((vaccine) => {
          const dueDate = new Date(`${child.date_of_birth}T00:00:00Z`);
          dueDate.setUTCDate(dueDate.getUTCDate() + vaccine.recommended_age_days);
          const dueDateString = dueDate.toISOString().slice(0, 10);
          const record = childRecords.find((item) => item.child_id === child.id && item.vaccine_id === vaccine.id);
          const status: "completed" | "due" | "upcoming" = record?.status === "completed"
            ? "completed"
            : dueDateString <= today
              ? "due"
              : "upcoming";
          return { vaccine, dueDateString, record, status };
        });

        const completed = schedule.filter((item) => item.status === "completed");
        const due = schedule.filter((item) => item.status === "due");
        const upcoming = schedule.filter((item) => item.status === "upcoming");
        const completionRate = schedule.length ? Math.round((completed.length / schedule.length) * 100) : 0;

        return (
          <section key={child.id} className="surface-card mt-5 overflow-hidden rounded-2xl shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-teal-50 via-white to-blue-50 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-teal">Child immunization record</p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">{child.name}</h2>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                    <span className="font-semibold text-ink">{formatChildAge(child.date_of_birth)}</span>
                    <span className="text-slate-300">•</span>
                    <span>Born {formatDashboardDate(child.date_of_birth)}</span>
                    {child.gender && <><span className="text-slate-300">•</span><span>{child.gender}</span></>}
                  </p>
                </div>
                <Link href="/parent/reminders" className="secondary-button rounded-xl border-white bg-white shadow-sm">
                  View reminders <Bell className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-5 max-w-xl rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <ProgressLine value={completionRate} label={`${completed.length} of ${schedule.length} scheduled vaccines completed`} />
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-3">
              <VaccineScheduleGroup
                title="Completed"
                detail="Doses recorded as administered."
                items={completed}
                childId={child.id}
                tone="emerald"
              />
              <VaccineScheduleGroup
                title="Due now"
                detail="Recommended age reached; awaiting a record."
                items={due}
                childId={child.id}
                tone="amber"
              />
              <VaccineScheduleGroup
                title="Upcoming"
                detail="Not yet due based on date of birth."
                items={upcoming}
                childId={child.id}
                tone="blue"
              />
            </div>
          </section>
        );
      })}
    </AppShell>
  );
}

function VaccineScheduleGroup({
  title,
  detail,
  items,
  childId,
  tone,
}: {
  title: string;
  detail: string;
  items: Array<{
    vaccine: Vaccine;
    dueDateString: string;
    record: ImmunizationRecord | undefined;
    status: "completed" | "due" | "upcoming";
  }>;
  childId: string;
  tone: "emerald" | "amber" | "blue";
}) {
  const toneClasses = {
    emerald: {
      header: "border-emerald-200 bg-emerald-50 text-emerald-900",
      count: "bg-white text-emerald-800 ring-emerald-200",
      card: "border-emerald-100 bg-white hover:border-emerald-200",
      icon: "bg-emerald-100 text-emerald-700",
    },
    amber: {
      header: "border-amber-200 bg-amber-50 text-amber-950",
      count: "bg-white text-amber-900 ring-amber-200",
      card: "border-amber-200 bg-amber-50/40 hover:border-amber-300",
      icon: "bg-amber-100 text-amber-800",
    },
    blue: {
      header: "border-slate-200 bg-slate-50 text-slate-800",
      count: "bg-white text-slate-700 ring-slate-200",
      card: "border-slate-100 bg-white hover:border-blue-200",
      icon: "bg-blue-50 text-blue-700",
    },
  }[tone];

  return (
    <section className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 sm:p-4">
      <div className={`rounded-xl border p-4 ${toneClasses.header}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-extrabold">{title}</h3>
          <span className={`inline-flex min-w-8 justify-center rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${toneClasses.count}`}>{items.length}</span>
        </div>
        <p className="mt-1 text-xs opacity-80">{detail}</p>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
          No vaccines in this section.
        </p>
      ) : (
        <ol className="mt-3 space-y-3">
          {items.map(({ vaccine, dueDateString, record, status }) => (
            <li key={`${childId}-${vaccine.id}`} className={`rounded-xl border p-4 shadow-sm transition ${toneClasses.card}`}>
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${toneClasses.icon}`}>
                  {status === "completed"
                    ? <CheckCircle2 className="h-5 w-5" />
                    : status === "due"
                      ? <AlertTriangle className="h-5 w-5" />
                      : <CalendarDays className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="font-bold text-ink">{vaccine.name}</h4>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ${
                      status === "completed"
                        ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
                        : status === "due"
                          ? "bg-amber-100 text-amber-900 ring-amber-200"
                          : "bg-slate-100 text-slate-700 ring-slate-200"
                    }`}>
                      {status === "completed" ? "Completed" : status === "due" ? "Due now" : "Upcoming"}
                    </span>
                  </div>
                  {vaccine.description && (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{vaccine.description}</p>
                  )}
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    {status === "completed" && record?.administered_date
                      ? `Administered ${formatDashboardDate(record.administered_date)}`
                      : `${status === "due" ? "Due" : "Expected"} ${formatDashboardDate(dueDateString)}`}
                    <span className="mx-1.5 text-slate-300">·</span>
                    Recommended at {vaccine.recommended_age_days} days
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function ParentReminders() {
  const [planCreated, setPlanCreated] = useState(false);
  const child = DEMO_PARENT_DASHBOARD.children[0];
  const pendingRecords = DEMO_VACCINES
    .filter((vaccine) => vaccine.recommended_age_days > 70 && vaccine.recommended_age_days <= 270)
    .map((vaccine) => ({
      id: vaccine.id,
      vaccine: vaccine.name,
      dueDate: dateAtAgeDays(child.dob, vaccine.recommended_age_days),
      status: "Upcoming",
    }));

  return (
    <AppShell role="parent">
      <PageHeading eyebrow="Alerts" title="Reminders" detail="Upcoming and overdue doses, with the latest reminder plan." />
      <p className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900">Demo preview · reminder data is local to this browser.</p>
      {child && (
        <section className="surface-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-teal">{child.childName}</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">{child.nextVaccine}</h2>
              <p className="mt-2 text-sm text-slate-500">Next due {formatDashboardDate(child.nextDueDate)}</p>
            </div>
            <button type="button" onClick={() => { setPlanCreated(true); toast.success("Sample reminder plan displayed."); }} className="primary-button">
              <Bell className="h-4 w-4" />{planCreated ? "Sample plan ready" : "Generate reminder plan"}
            </button>
          </div>
          {planCreated && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {pendingRecords.slice(0, 3).map((record, index) => (
                <article key={record.id} className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                  <div className="flex items-center justify-between gap-2"><RiskBadge risk="Low" /><StatusBadge status="Pending" /></div>
                  <p className="mt-3 font-bold text-ink">{record.vaccine}</p>
                  <p className="mt-1 text-sm text-slate-500">Due {formatDashboardDate(record.dueDate)}</p>
                  <p className="mt-2 text-sm text-slate-600">Sample reminder {index + 1} · local demo only.</p>
                </article>
              ))}
            </div>
          )}
          {!planCreated && (
            <div className="mt-5 space-y-3">
              {pendingRecords.length ? pendingRecords.map((record) => (
                <article key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div><p className="font-bold text-ink">{record.vaccine}</p><p className="mt-1 text-sm text-slate-500">Due {formatDashboardDate(record.dueDate)}</p></div>
                  <StatusBadge status={record.status} />
                </article>
              )) : <p className="text-sm text-slate-500">No upcoming or overdue doses.</p>}
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}

export function ParentProfile() {
  const [, setLocation] = useLocation();
  const data = DEMO_PARENT_DASHBOARD;
  const child = data.children[0];

  return (
    <AppShell role="parent">
      <PageHeading eyebrow="Profile" title="Guardian and child details" detail="The account and child information linked to your portal." />
      <p className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900">Demo preview · fictional profile details.</p>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="surface-card p-5 sm:p-6">
          <SectionHeading title="Guardian" detail="Authenticated account details." />
          <Detail label="Name" value={data?.profile.full_name || "—"} />
          <Detail label="Email" value={data?.profile.email || "—"} />
        </section>
        {child && (
          <section className="surface-card p-5 sm:p-6">
            <SectionHeading title="Child" detail="Child details in your account." />
            <Detail label="Name" value={child.childName} />
            <Detail label="Guardian name" value={child.parentName || data?.profile.full_name || "—"} />
            <Detail label="Date of birth" value={formatDashboardDate(child.dob)} />
            <Detail label="Gender" value={child.gender} />
            <Detail label="Village" value={child.village || "—"} />
            <Detail label="Guardian phone" value={child.guardianPhone || "—"} />
          </section>
        )}
      </div>
      <button type="button" onClick={() => logout(setLocation)} className="secondary-button mt-5">Log out</button>
    </AppShell>
  );
}

export function AshaProfile() {
  const [, setLocation] = useLocation();
  const data = DEMO_ASHA_DASHBOARD;
  const villages = Array.from(new Set(data.children.map((child: DashboardChild) => child.village).filter(Boolean)));

  return (
    <AppShell role="asha">
      <PageHeading eyebrow="ASHA profile" title="Profile and assigned area" detail="Your account, village assignment, and setup links." />
      <DemoDataBadge />
      <section className="surface-card mt-5 p-5 sm:p-6">
        <SectionHeading title={data.profile.full_name} detail={`${data.profile.email} · sample profile`} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Detail label="Assigned children" value={String(data.summary.totalChildren)} />
          <Detail label="Village" value={villages.length ? villages.join(", ") : "Not assigned"} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/asha/area-registration" className="primary-button"><MapPin className="h-4 w-4" />Set up area</Link>
          <Link href="/asha/vaccination-entry" className="secondary-button"><HeartPulse className="h-4 w-4" />Vaccine entry</Link>
        </div>
      </section>
      <button type="button" onClick={() => logout(setLocation)} className="secondary-button mt-5">Log out</button>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}
