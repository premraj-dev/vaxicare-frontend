import { AlertTriangle, Calendar, CheckCircle2, HeartPulse, ShieldAlert, UsersRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/Ui";
import type { AshaDashboardResponse, ParentDashboardResponse } from "@/types";

export function ParentDashboard({ data }: { data: ParentDashboardResponse }) {
  const dueDate = new Date(`${data.next_vaccine.due_date}T00:00:00`).toLocaleDateString();

  return (
    <AppShell role="parent">
      <div className="min-w-0 space-y-3 sm:space-y-4">
        <section className="surface-card flex-none p-3 sm:p-4 lg:p-5">
          <p className="care-kicker">Parent dashboard</p>
          <h1 className="mt-1 break-words font-display text-xl font-extrabold text-ink sm:text-2xl">{data.child.name}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Risk status: <span className="font-semibold capitalize">{data.child.risk_status}</span>
          </p>
        </section>

        <section className="grid flex-none min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
          <StatCard icon={HeartPulse} label="Total doses" value={data.total_doses} description="Scheduled doses" tone="navy" />
          <StatCard icon={CheckCircle2} label="Completed" value={data.completed} description="Recorded as given" tone="teal" />
          <StatCard icon={Calendar} label="Upcoming" value={data.upcoming} description="Future scheduled doses" tone="blue" />
          <StatCard icon={AlertTriangle} label="Overdue" value={data.overdue} description="Past due doses" tone="red" />
        </section>

        <div className="space-y-3">
          <section className="surface-card p-3 sm:p-4 lg:p-5">
            <h2 className="font-display text-lg font-extrabold text-ink">Next vaccine</h2>
            <p className="mt-2 font-semibold text-slate-800">{data.next_vaccine.name}</p>
            <p className="mt-1 text-sm text-slate-600">Due {dueDate}</p>
            <p className="mt-1 text-sm font-semibold capitalize text-slate-700">{data.next_vaccine.status}</p>
          </section>

          <section className="surface-card p-3 sm:p-4 lg:p-5">
            <h2 className="font-display text-lg font-extrabold text-ink">Aarav's vaccine schedule</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              <li className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-800">{data.next_vaccine.name}</span>
                  <span className="text-xs text-slate-500">Due {dueDate}</span>
                </span>
                <span className="shrink-0 capitalize text-slate-700">{data.next_vaccine.status}</span>
              </li>
              <li className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="font-semibold text-slate-800">Completed doses</span>
                <span className="shrink-0 text-slate-700">{data.completed}</span>
              </li>
              <li className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="font-semibold text-slate-800">Upcoming doses</span>
                <span className="shrink-0 text-slate-700">{data.upcoming}</span>
              </li>
              <li className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="font-semibold text-slate-800">Overdue doses</span>
                <span className="shrink-0 text-slate-700">{data.overdue}</span>
              </li>
              <li className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="font-semibold text-slate-800">Total scheduled doses</span>
                <span className="shrink-0 text-slate-700">{data.total_doses}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

export function AshaDashboard({ data }: { data: AshaDashboardResponse }) {
  return (
    <AppShell role="asha">
      <div className="min-w-0 space-y-3 sm:space-y-4">
        <section className="flex-none">
          <p className="care-kicker">ASHA dashboard</p>
          <h1 className="mt-1 break-words font-display text-xl font-extrabold text-ink sm:text-2xl lg:text-3xl">Community care overview</h1>
        </section>

        <section className="grid flex-none min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
          <StatCard icon={UsersRound} label="Total children" value={data.total_children} description="Assigned children" tone="navy" />
          <StatCard icon={CheckCircle2} label="Vaccinated this month" value={data.vaccinated_this_month} description="Doses recorded this month" tone="teal" />
          <StatCard icon={Calendar} label="Pending" value={data.pending} description="Upcoming doses" tone="blue" />
          <StatCard icon={AlertTriangle} label="Overdue" value={data.overdue} description="Past due doses" tone="red" />
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2 sm:mb-3">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h2 className="font-display text-lg font-extrabold text-ink">Children by risk</h2>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            <StatCard icon={AlertTriangle} label="High risk" value={data.high_risk} description="Priority follow-up" tone="red" />
            <StatCard icon={ShieldAlert} label="Medium risk" value={data.medium_risk} description="Routine follow-up" tone="amber" />
            <StatCard icon={CheckCircle2} label="Low risk" value={data.low_risk} description="On-track monitoring" tone="teal" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
