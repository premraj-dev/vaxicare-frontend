import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertTriangle,
  Bell,
  Calendar,
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
import { DashboardNotice, DemoDataBadge } from "@/components/DashboardNotice";
import {
  InterventionPreviewItem,
  PreviewLink,
  RiskPreviewItem,
} from "@/components/DashboardPreview";
import { RiskBadge, SectionHeading, StatCard, StatusBadge } from "@/components/Ui";
import {
  createReminderPlan,
  triggerBatchDailyScoring,
  type ReminderPlanResponse,
} from "@/lib/api";
import { useDashboardData } from "@/hooks/useDashboardData";
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

export function ParentDashboard() {
  const { data, loading, error } = useDashboardData("parent");
  const child = data?.children[0] ?? null;
  const records = data?.vaccinationRecords.filter((record) => record.childId === child?.id) ?? [];
  const shortReminders = records
    .filter((record) => record.status !== "Completed")
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    .slice(0, 3);

  return (
    <AppShell role="parent">
      <div className="min-w-0 space-y-5">
        <PageHeading
          eyebrow="Parent dashboard"
          title={`Welcome, ${data?.profile.full_name?.split(" ")[0] || "Parent"}`}
          detail="A quick view of your child's protection and what is coming next."
        />
        <div className="flex flex-wrap items-center gap-3">
          {data?.demoDataPresent && <DemoDataBadge />}
          <DashboardNotice
            loading={loading}
            error={error}
            empty={!loading && !error && !child}
            emptyMessage="No children are linked to this parent account yet."
          />
        </div>

        {child && (
          <>
            <section className="surface-card p-5 sm:p-6">
              <SectionHeading
                eyebrow="Child summary"
                title={child.childName}
                detail={`${child.village || "Village not recorded"} · ${child.gender} · ${formatDashboardDate(child.dob)}`}
                action={<RiskBadge risk={child.riskLevel ?? "Normal"} />}
              />
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-teal-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-teal">Vaccination progress</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-ink">{child.completionRate}%</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Next due vaccine</p>
                  <p className="mt-1 font-display text-lg font-extrabold text-ink">{child.nextVaccine}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Due date</p>
                  <p className="mt-1 font-display text-lg font-extrabold text-ink">{formatDashboardDate(child.nextDueDate)}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <PreviewLink href="/parent/vaccination">Full vaccination history <ChevronRight className="h-4 w-4" /></PreviewLink>
                <PreviewLink href="/parent/reminders">All reminders <ChevronRight className="h-4 w-4" /></PreviewLink>
                <PreviewLink href="/parent/profile">Profile details <ChevronRight className="h-4 w-4" /></PreviewLink>
              </div>
            </section>

            <section className="surface-card p-5 sm:p-6">
              <SectionHeading
                eyebrow="Coming up"
                title="Short reminder list"
                detail="Upcoming and overdue doses for your child."
                action={<PreviewLink href="/parent/reminders">View all <ChevronRight className="h-4 w-4" /></PreviewLink>}
              />
              {shortReminders.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No upcoming or overdue doses.</p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {shortReminders.map((record) => (
                    <article key={record.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-ink">{record.vaccine}</p>
                        <StatusBadge status={record.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">Due {formatDashboardDate(record.dueDate)}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

export function AshaDashboard() {
  const { data, loading, error, reload } = useDashboardData("asha");
  const [scoring, setScoring] = useState(false);
  const metricValue = (value: number) => loading ? "…" : error ? "—" : value;
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

  const runScoring = async () => {
    setScoring(true);
    try {
      const result = await triggerBatchDailyScoring();
      toast.success(`Batch scoring complete: ${result.total_scored} children scored.`);
      await reload();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Unable to run batch scoring.");
    } finally {
      setScoring(false);
    }
  };

  return (
    <AppShell role="asha">
      <div className="min-w-0 space-y-6">
        <section className="overflow-hidden rounded-3xl bg-navy p-5 text-white sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-200">ASHA dashboard</p>
              <h1 className="mt-2 font-display text-3xl font-extrabold">Your follow-up plan is ready.</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/75">Start with the children who need a call, reminder, or home visit today.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void runScoring()} disabled={scoring} className="secondary-button border-white/20 bg-white/10 text-white hover:bg-white/20">
                {scoring ? "Scoring…" : "Batch scoring"}
              </button>
              <Link href="/asha/risk-dashboard" className="primary-button bg-teal text-white hover:bg-teal-700">
                Review risk queue <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          {data?.demoDataPresent && <DemoDataBadge />}
          <DashboardNotice loading={loading} error={error} empty={false} />
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard icon={UsersRound} label="Total children" value={metricValue(data?.summary.totalChildren ?? 0)} description="Assigned to your account" tone="navy" />
          <StatCard icon={CheckCircle2} label="Vaccinated" value={metricValue(data?.summary.vaccinatedThisMonth ?? 0)} description="Doses recorded this month" tone="teal" />
          <StatCard icon={Calendar} label="Pending" value={metricValue(data?.summary.pending ?? 0)} description="Upcoming doses" tone="blue" />
          <StatCard icon={AlertTriangle} label="Overdue" value={metricValue(data?.summary.overdue ?? 0)} description="Past due, not given" tone="red" />
          <StatCard icon={ShieldAlert} label="High risk" value={metricValue(data?.summary.highRisk ?? 0)} description="Latest stored prediction" tone="amber" />
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
            <DashboardNotice loading={loading} error={error} empty={!loading && !error} emptyMessage="No high-risk children in the current queue." />
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
            <DashboardNotice loading={loading} error={error} empty={!loading && !error} emptyMessage="No interventions have been recorded yet." />
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
  const { data, loading, error } = useDashboardData("parent");
  const child = data?.children[0];
  const records = child
    ? data?.vaccinationRecords.filter((record) => record.childId === child.id) ?? []
    : [];

  return (
    <AppShell role="parent">
      <PageHeading eyebrow="Health record" title="Vaccination schedule & history" detail={child ? `Dose history for ${child.childName}.` : "Your child's recorded doses."} />
      <DashboardNotice loading={loading} error={error} empty={!loading && !error && records.length === 0} emptyMessage="No vaccination records are available." />
      {records.length > 0 && (
        <section className="surface-card p-5 sm:p-6">
          <div className="space-y-3">
            {records.map((record) => (
              <article key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4">
                <div>
                  <p className="font-bold text-ink">{record.vaccine}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {record.givenDate ? `Given ${formatDashboardDate(record.givenDate)}` : `Due ${formatDashboardDate(record.dueDate)}`}
                  </p>
                </div>
                <StatusBadge status={record.status} />
              </article>
            ))}
          </div>
          <Link href="/parent/reminders" className="primary-button mt-5">View reminders <Bell className="h-4 w-4" /></Link>
        </section>
      )}
    </AppShell>
  );
}

export function ParentReminders() {
  const { data, loading, error } = useDashboardData("parent");
  const [livePlan, setLivePlan] = useState<ReminderPlanResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const child = data?.children[0];
  const pendingRecords = child
    ? (data?.vaccinationRecords ?? [])
      .filter((record) => record.childId === child.id && record.status !== "Completed")
      .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    : [];

  const generatePlan = async () => {
    if (!child?.nextDueDate || !child.nextVaccine) {
      toast.error("There is no upcoming dose to plan a reminder for.");
      return;
    }
    setLoadingPlan(true);
    try {
      const plan = await createReminderPlan({
        child_id: child.id,
        child_name: child.childName,
        next_vaccine: child.nextVaccine,
        missed_dose_count: child.missedDoses,
        dropout_probability: child.dropoutProbability,
        next_dose_due_date: child.nextDueDate,
        preferred_language: "Marathi",
      });
      setLivePlan(plan);
      toast.success("Reminder plan created.");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Unable to create a reminder plan.");
    } finally {
      setLoadingPlan(false);
    }
  };

  return (
    <AppShell role="parent">
      <PageHeading eyebrow="Alerts" title="Reminders" detail="Upcoming and overdue doses, with the latest reminder plan." />
      <DashboardNotice loading={loading} error={error} empty={!loading && !error && !child} emptyMessage="No child is linked to this parent account." />
      {child && (
        <section className="surface-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-teal">{child.childName}</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">{child.nextVaccine}</h2>
              <p className="mt-2 text-sm text-slate-500">Next due {formatDashboardDate(child.nextDueDate)}</p>
            </div>
            <button type="button" onClick={() => void generatePlan()} disabled={loadingPlan || loading || !child.nextDueDate} className="primary-button">
              <Bell className="h-4 w-4" />{loadingPlan ? "Creating…" : "Generate reminder plan"}
            </button>
          </div>
          {livePlan && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {livePlan.reminders.map((reminder) => (
                <article key={`${reminder.reminder_number}-${reminder.reminder_date}`} className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                  <div className="flex items-center justify-between gap-2"><RiskBadge risk={livePlan.risk_level} /><StatusBadge status={reminder.status === "Immediate Overdue Trigger" ? "Overdue" : "Pending"} /></div>
                  <p className="mt-3 font-bold text-ink">{reminder.next_vaccine}</p>
                  <p className="mt-1 text-sm text-slate-500">Due {formatDashboardDate(reminder.vaccine_due_date)}</p>
                  <p className="mt-2 text-sm text-slate-600">Reminder {reminder.days_before_vaccine} day(s) before via {reminder.channel}.</p>
                </article>
              ))}
            </div>
          )}
          {!livePlan && (
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
  const { data, loading, error } = useDashboardData("parent");
  const [, setLocation] = useLocation();
  const child = data?.children[0];

  return (
    <AppShell role="parent">
      <PageHeading eyebrow="Profile" title="Guardian and child details" detail="The account and child information linked to your portal." />
      <DashboardNotice loading={loading} error={error} empty={!loading && !error && !child} emptyMessage="No child is linked to this parent account yet." />
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
  const { data, loading, error } = useDashboardData("asha");
  const [, setLocation] = useLocation();
  const villages = Array.from(new Set((data?.children ?? []).map((child: DashboardChild) => child.village).filter(Boolean)));

  return (
    <AppShell role="asha">
      <PageHeading eyebrow="ASHA profile" title="Profile and assigned area" detail="Your account, village assignment, and setup links." />
      {data?.demoDataPresent && <DemoDataBadge />}
      <DashboardNotice loading={loading} error={error} empty={false} />
      <section className="surface-card mt-5 p-5 sm:p-6">
        <SectionHeading title={data?.profile.full_name || "ASHA worker"} detail={data?.profile.email || "Authenticated ASHA account"} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Detail label="Assigned children" value={loading ? "…" : String(data?.summary.totalChildren ?? 0)} />
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
