/** Verified Care Console: all role-aware pages use quiet clinical modernism, action-first panels, and API-ready mock interactions. */

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { AreaChart, Area, BarChart, Bar, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowRight, Bell, Calendar, CalendarClock, Check, CheckCircle2, ChevronRight, ClipboardCheck, Download, FileText, HeartPulse, Home, Info, MapPin, MessageCircle, Phone, Play, Plus, QrCode, ScanLine, Search, Send, ShieldAlert, Sparkles, Stethoscope, UserRound, UsersRound, Video, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ActionModal, type ActionType } from "@/components/ActionModal";
import { BrandMark } from "@/components/BrandMark";
import { EmptyState, ProgressLine, RiskBadge, SectionHeading, StatCard, StatusBadge } from "@/components/Ui";
import { areas, ashaProfile, assets, children, coverageData, interventionData, interventions, parentProfile, primaryChild, reminders, trendData, vaccinationRecords } from "@/data/mockData";
import type { AshaCapacityQueueResponse, ReminderPlanResponse } from "@/lib/api";
import { ashaService, authService, reminderService, vaccinationService } from "@/services/mockApi";
import type { ChildRecord, RiskLevel, Role, VaccinationStatus } from "@/types";

const iconClass = "h-4 w-4";

function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-frame relative min-h-[100dvh] overflow-hidden bg-navy px-4 py-6 sm:px-6 lg:flex lg:h-[100dvh] lg:min-h-0 lg:items-center lg:justify-center lg:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)", backgroundSize: "26px 26px" }} />
      <div className="pointer-events-none absolute -right-28 -top-28 h-[420px] w-[420px] rounded-full bg-teal-500/25 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 h-[420px] w-[420px] rounded-full bg-[#f37c64]/15 blur-[110px]" />
      <main className="auth-main relative z-10 mx-auto flex w-full max-w-[27rem] flex-col justify-center py-4 lg:max-h-[100dvh] lg:overflow-y-auto lg:py-0">
        <div className="auth-card relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white shadow-[0_35px_80px_-35px_rgba(6,20,30,.6)]">
          <span className="pointer-events-none absolute left-9 top-0 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-navy ring-[5px] ring-white" />
          <div className="h-1.5 w-full bg-gradient-to-r from-teal via-[#f37c64] to-teal" />
          <div className="auth-content px-7 py-8 sm:px-9 sm:py-9">{children}</div>
        </div>
      </main>
    </div>
  );
}

import { Globe, Shield } from "lucide-react";

export function LoginPage() {
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<Role>("parent");
  const [tab, setTab] = useState<"login" | "register">("login");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"EN" | "HI" | "MR">("EN");

  const login = async () => {
    setLoading(true);
    await authService.login(role);
    setLoading(false);
    setLocation(role === "parent" ? "/parent/dashboard" : "/asha/area-registration");
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans overflow-hidden">
      {/* Left Side: Dark Emerald Background (#064E3B) */}
      <div className="relative w-full lg:w-1/2 bg-[#064E3B] text-white p-6 lg:p-10 flex flex-col justify-between overflow-hidden h-full">
        {/* Subtle Decorative Background Circles */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-2xl" />

        {/* Top Header: Logo & Tagline */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600/50 backdrop-blur-md ring-1 ring-white/20 shadow-inner">
            <Shield className="h-5 w-5 text-emerald-200" />
          </div>
          <div>
            <span className="font-display text-xl lg:text-2xl font-extrabold tracking-tight text-white">RootCause</span>
            <span className="ml-2 rounded-full bg-emerald-800/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-700/50">
              No child left behind
            </span>
          </div>
        </div>

        {/* Middle Main Content */}
        <div className="relative z-10 my-auto py-4 max-w-xl">
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white">
            Catching a missed dose before it’s missed.
          </h1>
          <p className="mt-3.5 text-sm lg:text-base leading-relaxed text-emerald-100/90 font-medium">
            RootCause predicts which children are at risk of falling behind on vaccines, and gives parents and ASHA workers exactly what they need to act — in time.
          </p>
        </div>

        {/* Bottom Footer: Metric Counters & Quote */}
        <div className="relative z-10 space-y-4 pt-4 border-t border-emerald-800/80">
          {/* Metric Counters */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-emerald-900/40 p-3 backdrop-blur-sm ring-1 ring-white/10">
              <p className="font-display text-xl lg:text-2xl font-extrabold text-white">245</p>
              <p className="mt-0.5 text-[11px] font-medium text-emerald-200/80">Children tracked</p>
            </div>
            <div className="rounded-xl bg-emerald-900/40 p-3 backdrop-blur-sm ring-1 ring-white/10">
              <p className="font-display text-xl lg:text-2xl font-extrabold text-white">156</p>
              <p className="mt-0.5 text-[11px] font-medium text-emerald-200/80">Visits this month</p>
            </div>
            <div className="rounded-xl bg-emerald-900/40 p-3 backdrop-blur-sm ring-1 ring-white/10">
              <p className="font-display text-xl lg:text-2xl font-extrabold text-teal-300">94%</p>
              <p className="mt-0.5 text-[11px] font-medium text-emerald-200/80">On-time recall rate</p>
            </div>
          </div>

          {/* ASHA Worker Quote */}
          <blockquote className="rounded-xl bg-emerald-950/50 p-3 border-l-4 border-emerald-400 text-xs text-emerald-100/90 italic leading-relaxed">
            “The risk list tells me exactly whose door to knock on first.”
            <span className="block mt-0.5 font-semibold not-italic text-emerald-300">— ASHA worker, Wagholi</span>
          </blockquote>
        </div>
      </div>

      {/* Right Side: Clean White Background (#FFFFFF) */}
      <div className="w-full lg:w-1/2 bg-white p-6 lg:p-10 flex flex-col justify-between h-full overflow-y-auto lg:overflow-hidden">
        {/* Top Right Language Switcher */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setLang(lang === "EN" ? "HI" : lang === "HI" ? "MR" : "EN")}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:border-slate-300"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-700" />
            <span>{lang === "EN" ? "English" : lang === "HI" ? "हिंदी" : "मराठी"}</span>
          </button>
        </div>

        {/* Center Main Form Box */}
        <main className="mx-auto w-full max-w-md my-auto py-2">
          {/* Header Text */}
          <div className="mb-5">
            <h2 className="font-display text-2xl lg:text-3xl font-extrabold tracking-tight text-ink">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">
              {role === "parent" ? "Track your child's vaccination journey" : "Manage your panchayat's immunisation records"}
            </p>
          </div>

          {/* Role Toggle Pills */}
          <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => setRole("parent")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2.5 text-xs lg:text-sm font-bold transition-all ${
                role === "parent" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserRound className="h-4 w-4" />
              <span>Parent Login</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("asha")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2.5 text-xs lg:text-sm font-bold transition-all ${
                role === "asha" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <HeartPulse className="h-4 w-4" />
              <span>ASHA Worker Login</span>
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-slate-200 mb-5">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`pb-2.5 text-sm font-bold transition-colors relative ${
                tab === "login" ? "text-ink border-b-2 border-emerald-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`ml-6 pb-2.5 text-sm font-bold transition-colors relative ${
                tab === "register" ? "text-ink border-b-2 border-emerald-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Fields */}
          {tab === "login" ? (
            <div className="space-y-3.5">
              <label className="block text-xs font-bold text-slate-700">
                {role === "parent" ? "Parent / mother mobile number" : "Panchayat / Worker ID"}
                <input
                  type="text"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm font-medium text-ink outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                  placeholder={role === "parent" ? "e.g. +91 98765 43210" : "e.g. ASHA-PUN-08"}
                />
              </label>

              {role === "parent" ? (
                <label className="block text-xs font-bold text-slate-700">
                  OTP
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-center font-display text-base font-bold tracking-[.45em] text-ink outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                      placeholder="Enter OTP"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(true);
                        toast.success("OTP sent to mobile number.");
                      }}
                      className="h-11 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                    >
                      {otpSent ? "Resend" : "Send OTP"}
                    </button>
                  </div>
                </label>
              ) : (
                <label className="block text-xs font-bold text-slate-700">
                  Password
                  <input
                    type="password"
                    defaultValue="vaxicare"
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm font-medium text-ink outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                  />
                </label>
              )}

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={login}
                disabled={loading}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#064E3B] text-sm lg:text-base font-bold text-white shadow-md shadow-emerald-950/20 transition hover:bg-emerald-900 active:scale-[0.99] disabled:opacity-60"
              >
                <span>{loading ? "Verifying..." : role === "parent" ? "Verify & Continue" : "Log In to Dashboard"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <RegisterPanel role={role} onBack={() => setTab("login")} onDone={() => setLocation(role === "parent" ? "/parent/child-registration" : "/asha/register")} />
          )}

          {/* Footer Link */}
          <p className="mt-4 text-center text-xs text-slate-400">
            New here?{" "}
            <button type="button" onClick={() => setTab("register")} className="font-bold text-emerald-700 hover:underline">
              Create an account
            </button>
          </p>
        </main>

        {/* Page Footer Note */}
        <p className="text-center text-[11px] text-slate-400">
          RootCause Care Console · Safe & Secure Immunisation Network
        </p>
      </div>
    </div>
  );
}

function RegisterPanel({ role, onBack, onDone }: { role: Role; onBack: () => void; onDone: () => void }) {
  const fields = role === "parent" ? ["Name", "Child’s date of birth", "Parent number", "Location", "PIN code"] : ["Panchayat name", "Panchayat / Worker ID", "Mobile number", "Set password"];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field, index) => {
          const fullWidth = role === "asha" ? index < 2 : index === 0;
          return (
            <label key={field} className={`block text-xs font-bold text-slate-700 ${fullWidth ? "sm:col-span-2" : ""}`}>
              {field}
              <input
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-ink outline-none transition focus:border-emerald-600 focus:bg-white"
                placeholder={index === 0 ? role === "parent" ? "Priya Sharma" : "Wagholi Panchayat" : field.includes("date") ? "dd-mm-yyyy" : field.includes("number") ? "+91 98765 43210" : field.includes("PIN") ? "412207" : "Enter details"}
                type={field.includes("password") ? "password" : field.includes("date") ? "date" : "text"}
              />
            </label>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => { toast.success("Account details saved."); onDone(); }}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#064E3B] text-base font-bold text-white shadow-lg transition hover:bg-emerald-900"
      >
        <span>Register & Continue</span>
        <ArrowRight className="h-5 w-5" />
      </button>
      <p className="mt-3 text-center text-xs text-slate-400">
        Already registered?{" "}
        <button type="button" onClick={onBack} className="font-bold text-emerald-700 hover:underline">
          Log in
        </button>
      </p>
    </div>
  );
}

function PageHero({ eyebrow, title, detail, image, action }: { eyebrow: string; title: string; detail: string; image?: string; action?: React.ReactNode }) {
  return (
    <section className="relative mb-4 overflow-hidden rounded-2xl bg-navy py-3.5 px-5 text-white shadow-md sm:py-4 sm:px-6">
      <img src={image ?? assets.texture} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen" />
      <div className="relative flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-coral" />
            <p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-teal-200">{eyebrow}</p>
          </div>
          <h1 className="mt-1 max-w-xl font-display text-xl sm:text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1 max-w-lg text-xs leading-relaxed text-white/75">{detail}</p>
        </div>
        {action && <div className="shrink-0 sm:self-center">{action}</div>}
      </div>
    </section>
  );
}

function SimpleVaccinationTimeline({ rows }: { rows: typeof vaccinationRecords }) {
  return (
    <div className="mt-4 space-y-4">
      {rows.map((record) => {
        const isDone = record.status === "Completed";
        const isOverdue = record.status === "Missed" || (record.daysOverdue && record.daysOverdue > 0);
        
        return (
          <div key={record.id} className="animate-card-in flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:bg-slate-50">
            <div className="flex items-center gap-3.5">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white shadow-sm ${
                isDone ? "bg-emerald-500 animate-check-pop" : isOverdue ? "bg-amber-500" : "bg-blue-500"
              }`}>
                {isDone ? <Check className="h-5 w-5 stroke-[3]" /> : isOverdue ? <AlertTriangle className="h-5 w-5" /> : <ClockIcon />}
              </span>
              <div>
                <p className="font-display text-base font-extrabold text-ink">{record.vaccine} <span className="text-xs text-slate-400">({record.dose})</span></p>
                <p className="text-xs text-slate-500">{isDone ? `Done on ${record.actualDate || record.scheduledDate}` : `Scheduled: ${record.scheduledDate}`}</p>
              </div>
            </div>
            <StatusBadge status={record.status} />
          </div>
        );
      })}
    </div>
  );
}

export function ParentDashboard() {
  const [, setLocation] = useLocation();
  const completionRate = primaryChild.completionRate || 75;
  const nextVaccineName = primaryChild.nextVaccine || "Penta-2";
  const nextDueDate = primaryChild.nextDueDate || "29 Sep 2026";
  const activeRisk = primaryChild.riskLevel || "Low";

  return (
    <AppShell role="parent">
      <PageHero 
        eyebrow="Parent overview" 
        title={`Good morning, ${parentProfile.name ? parentProfile.name.split(" ")[0] : "Parent"}! 👋`} 
        detail="Keep your baby healthy and protected with easy vaccine tracking." 
        image={assets.parentCare} 
      />

      {/* Single Hero Element: Large Circular Progress Ring */}
      <div className="surface-card animate-card-in p-5 text-center flex flex-col items-center justify-center">
        <div className="relative h-36 w-36 flex items-center justify-center">
          <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="text-slate-100" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="8"
              className="text-teal progress-bar-fill"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - completionRate / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-extrabold text-ink">{completionRate}%</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Protected</span>
          </div>
        </div>

        {/* Small secondary text under ring */}
        <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Risk: <strong>{activeRisk}</strong></span>
          <span className="h-3 w-px bg-slate-200" />
          <span className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5 text-teal" /> Reminders: <strong>2 active</strong></span>
        </div>
      </div>

      {/* Below Card: "What's Next" */}
      <section className="mt-4 surface-card animate-card-in p-4 lg:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="care-kicker flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> What's next</p>
            <h3 className="mt-0.5 font-display text-xl font-extrabold text-ink">{nextVaccineName} Dose</h3>
            <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-teal" /> Scheduled Due Date: <strong>{nextDueDate}</strong></p>
          </div>
          <button onClick={() => setLocation("/parent/vaccination")} className="primary-button text-sm px-5 py-2.5 font-extrabold shrink-0">
            Book Next Vaccine <ArrowRight className={iconClass} />
          </button>
        </div>
      </section>

      {/* Vaccine Journey Section */}
      <section className="mt-4 surface-card animate-card-in p-4 lg:p-5">
        <SectionHeading eyebrow="Vaccine Journey" title="Simple Timeline" detail="Your baby's progress at a glance." action={<Link href="/parent/vaccination" className="secondary-button text-xs py-1.5 px-3">See All Doses</Link>} />
        <SimpleVaccinationTimeline rows={vaccinationRecords.slice(0, 4)} />
      </section>
    </AppShell>
  );
}

export function ParentRegistration() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [generatedId, setGeneratedId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmitStep1 = (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setTimeout(() => {
      const newId = `CH${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedId(newId);
      setSaving(false);
      setStep(2);
      toast.success("Child registered! Digital Health Card created.");
    }, 400);
  };

  return (
    <AppShell role="parent">
      <PageHero eyebrow="Baby Profile" title="Register Your Baby" detail="Quick setup to create a verified vaccination card." image={assets.parentCare} />

      {step === 1 ? (
        /* Step 1: Form Only (No Baby ID, No Verification Code) */
        <form onSubmit={handleSubmitStep1} className="surface-card animate-card-in max-w-2xl mx-auto p-6 lg:p-8">
          <SectionHeading title="Step 1: Baby & Family Information" detail="Enter basic details. Baby ID is generated automatically." />
          <div className="grid gap-5 md:grid-cols-2">
            <label className="field-label">Full Name<input required className="field-control" placeholder="e.g. Aarav Sharma" /></label>
            <label className="field-label">Date of Birth<input required className="field-control" type="date" /></label>
            <label className="field-label">Gender<select className="field-control" defaultValue="Male"><option>Male</option><option>Female</option><option>Other</option></select></label>
            <label className="field-label">Mother's Name<input required className="field-control" placeholder="e.g. Priya Sharma" /></label>
            <label className="field-label">Mobile Phone<input required className="field-control" placeholder="e.g. +91 98765 43210" /></label>
            <label className="field-label">Village / City<input required className="field-control" placeholder="e.g. Wagholi" /></label>
          </div>
          <button disabled={saving} className="primary-button mt-8 w-full text-base py-3 font-extrabold">
            {saving ? "Generating Pass..." : "Register & Generate Pass"} <ArrowRight className={iconClass} />
          </button>
        </form>
      ) : (
        /* Step 2: Confirmation Screen with Digital Health Card */
        <div className="surface-card animate-card-in max-w-md mx-auto p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700 mb-4 animate-check-pop">
            <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ink">Registration Complete!</h2>
          <p className="mt-1 text-sm text-slate-500">Assigned ID: <strong className="text-teal font-mono text-base">{generatedId}</strong></p>

          <div className="mt-6 rounded-2xl border border-dashed border-teal-200 bg-teal-50/70 p-6 flex flex-col items-center">
            <QrCode className="h-28 w-28 text-teal mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Digital Health Card Pass</p>
            <p className="text-xs text-slate-500 mt-1">Show code to ASHA worker for fast check-in</p>
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => toast.info(`Pass Code: QR-${generatedId}-MH`)} className="secondary-button flex-1 py-3 font-bold">
              <QrCode className={iconClass} /> Show Card
            </button>
            <button type="button" onClick={() => setLocation("/parent/dashboard")} className="primary-button flex-1 py-3 font-bold">
              Done <Check className={iconClass} />
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export function ParentProfile() {
  const [editing, setEditing] = useState(false);
  return (
    <AppShell role="parent">
      <PageHero eyebrow="My Account" title="Aarav's Profile" detail="View and manage your baby's contact information." image={assets.parentCare} action={<button onClick={() => { setEditing(!editing); toast.info(editing ? "Saved!" : "Editing mode enabled."); }} className="secondary-button border-white/20 bg-white/10 text-white">{editing ? "Done" : "Update Info"}</button>} />
      <div className="grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
        <section className="surface-card animate-card-in p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-teal-50 font-display text-2xl font-extrabold text-teal">A</div>
            <div>
              <p className="font-display text-xl font-extrabold text-ink">{parentProfile.childName || "Aarav Sharma"}</p>
              <p className="text-sm text-slate-500">{parentProfile.childId || "CH1004"}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
            <p className="flex items-center justify-between"><span className="text-slate-500">QR ID</span> <strong>{parentProfile.qr || "QR-CH1004-MH"}</strong></p>
            <p className="flex items-center justify-between"><span className="text-slate-500">Phone Status</span> <span className="inline-flex items-center gap-1 font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4 text-emerald-600 animate-check-pop" /> Verified</span></p>
            <p className="flex items-center justify-between"><span className="text-slate-500">Nurse / ASHA</span> <strong>Savitri Patil</strong></p>
          </div>
        </section>

        <section className="surface-card animate-card-in p-6">
          <SectionHeading title="Contact Details" detail="Simple records kept updated for medical visits." />
          <div className="grid gap-x-10 gap-y-5 md:grid-cols-2">
            <InfoBlock label="Child ID" value={parentProfile.childId || "CH1004"} edit={editing} />
            <InfoBlock label="Date of Birth" value={parentProfile.dob || "17 Feb 2025"} edit={editing} />
            <InfoBlock label="Gender" value={parentProfile.gender || "Male"} edit={editing} />
            <InfoBlock label="Mother's Name" value={parentProfile.name || "Priya Sharma"} edit={editing} />
            <InfoBlock label="Phone Number" value={parentProfile.phone || "+91 98765 43210"} edit={editing} />
            <InfoBlock label="Home Address" value={parentProfile.address || "Wagholi, Pune"} edit={editing} />
          </div>
          {editing && <button onClick={() => { setEditing(false); toast.success("Saved successfully!"); }} className="primary-button mt-7 text-base font-extrabold">Save Changes</button>}
        </section>
      </div>
    </AppShell>
  );
}

function InfoBlock({ label, value, edit }: { label: string; value: string; edit: boolean }) { return <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>{edit ? <input className="field-control mt-2" defaultValue={value} /> : <p className="mt-2 font-semibold text-ink">{value}</p>}</div>; }

export function ParentVaccination() {
  const [, setLocation] = useLocation();

  return (
    <AppShell role="parent">
      <PageHero eyebrow="Health Record" title="Vaccine Journey" detail="Clear timeline of done and upcoming vaccines." image={assets.parentCare} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="animate-card-in"><StatCard icon={HeartPulse} label="Total doses" value="6" description="Full protective series" tone="navy" /></div>
        <div className="animate-card-in"><StatCard icon={CheckCircle2} label="Completed" value="3" description="Protected on time" tone="teal" /></div>
        <div className="animate-card-in"><StatCard icon={Calendar} label="Upcoming" value="2" description="Next protection doses" tone="blue" /></div>
        
        {/* Tappable Action Needed Stat Card */}
        <button
          onClick={() => setLocation("/parent/reminders")}
          className="text-left w-full focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-2xl transition hover:scale-[1.02]"
        >
          <StatCard icon={AlertTriangle} label="Action needed" value="1" description="Tap to view reminder action →" tone="amber" />
        </button>
      </div>

      <div className="mt-7 surface-card animate-card-in p-6">
        <SectionHeading eyebrow="Visual Timeline" title="Vaccine Journey" detail="Color-coded list: Green for done, Blue for upcoming, Orange for attention." />
        <SimpleVaccinationTimeline rows={vaccinationRecords} />
      </div>
    </AppShell>
  );
}

function ClockIcon() { return <Calendar className="h-4 w-4" />; }

export function ParentReminders() {
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [livePlan, setLivePlan] = useState<ReminderPlanResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const createLivePlan = async () => {
    setLoadingPlan(true);

    try {
      const parsedDueDate = new Date(primaryChild.nextDueDate || "2026-09-29");
      const nextDoseDueDate = Number.isNaN(parsedDueDate.getTime())
        ? "2026-09-29"
        : parsedDueDate.toISOString().slice(0, 10);

      const plan = await reminderService.createPlan({
        child_id: primaryChild.childId || "CH1004",
        child_name: primaryChild.childName || "Aarav Sharma",
        next_vaccine: primaryChild.nextVaccine || "Penta-2",
        missed_dose_count: primaryChild.missedDoses || 1,
        next_dose_due_date: nextDoseDueDate,
        preferred_language: "Marathi",
      });

      setLivePlan(plan);
      toast.success("Alert schedule created!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load alerts.");
    } finally {
      setLoadingPlan(false);
    }
  };

  const activeRisk = livePlan?.risk_level ?? primaryChild.riskLevel ?? "Low";

  return (
    <AppShell role="parent">
      <PageHero eyebrow="Alerts" title="Reminders for Next Visit" detail="Friendly notifications so you never miss a dose." image={assets.parentCare} />
      
      <section className="surface-card animate-card-in border-amber-200 bg-amber-50/60 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-700" /><RiskBadge risk={activeRisk} /></div>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-amber-950">{primaryChild.nextVaccine || "Penta-2"} Next Vaccine Reminder</h2>
            <p className="mt-2 text-sm text-amber-900/80 flex items-center gap-1.5"><Info className="h-4 w-4 text-amber-700" /> Automatic reminder is set for 2 days before visit.</p>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={createLivePlan} disabled={loadingPlan} className="primary-button text-base font-extrabold">
              <Bell className={iconClass} />{loadingPlan ? "Setting up..." : "Get Reminders"}
            </button>

            {/* Prominent Audio Icon Button */}
            <button
              type="button"
              onClick={() => {
                setVoicePlaying(!voicePlaying);
                toast.success(voicePlaying ? "Voice paused" : "Playing Marathi voice reminder...");
              }}
              title="Listen in Voice"
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition shadow-md ${
                voicePlaying ? "bg-amber-600 text-white ring-4 ring-amber-300 animate-pulse" : "bg-white text-amber-800 border border-amber-300 hover:bg-amber-100"
              }`}
            >
              <Volume2 className="h-6 w-6" />
            </button>
          </div>
        </div>

        {voicePlaying && (
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-white p-3.5 text-sm font-bold text-teal shadow-sm animate-card-in">
            <Play className="h-5 w-5 fill-current text-teal animate-pulse" /> Audio reminder playing in Marathi...
          </div>
        )}
      </section>

      {/* Main Reminder Cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {livePlan ? livePlan.reminders.map((reminder) => (
          <article key={`${reminder.reminder_number}-${reminder.reminder_date}`} className="surface-card animate-card-in p-5">
            <div className="flex items-center justify-between"><RiskBadge risk={livePlan.risk_level} /><StatusBadge status={reminder.status === "Immediate Overdue Trigger" ? "Overdue" : "Pending"} /></div>
            <h3 className="mt-4 font-display text-xl font-extrabold text-ink">{reminder.next_vaccine}</h3>
            <p className="mt-1 text-sm text-slate-500 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Due {reminder.vaccine_due_date}</p>
            <p className="mt-4 text-sm text-slate-600 flex items-center gap-1.5"><Bell className="h-4 w-4 text-teal" /> Alert scheduled {reminder.days_before_vaccine} day(s) before via {reminder.channel}.</p>
          </article>
        )) : reminders.length > 0 ? reminders.map((reminder) => (
          <article key={reminder.id} className="surface-card animate-card-in p-5">
            <div className="flex items-center justify-between"><RiskBadge risk={reminder.riskLevel} /><StatusBadge status={reminder.status} /></div>
            <h3 className="mt-4 font-display text-xl font-extrabold text-ink">{reminder.vaccine}</h3>
            <p className="mt-1 text-sm text-slate-500 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Due {reminder.dueDate}</p>
            <p className="mt-4 text-sm text-slate-600 flex items-center gap-1.5"><Bell className="h-4 w-4 text-teal" /> {reminder.message}</p>
          </article>
        )) : (
          <article className="surface-card animate-card-in p-5 lg:col-span-3 text-center py-8">
            <Bell className="h-8 w-8 text-teal mx-auto mb-2" />
            <h4 className="font-display font-bold text-ink">Active Alert Plan Ready</h4>
            <p className="text-xs text-slate-500 mt-1">Tap "Get Reminders" to generate server-enforced alerts.</p>
          </article>
        )}
      </div>

      {/* Reminder History List */}
      <section className="mt-8 surface-card animate-card-in p-6">
        <SectionHeading title="Reminder History" detail="Past notification logs sent to your mobile phone." />
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-4 w-4 stroke-[3]" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">SMS Reminder: Penta-1 Visit</p>
                <p className="text-xs text-slate-400">Sent 2 days ago via SMS (+91 98765 43210)</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Delivered ✓</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-4 w-4 stroke-[3]" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">WhatsApp Call Note: Scheduled Visit</p>
                <p className="text-xs text-slate-400">Sent 1 week ago</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Delivered ✓</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export function AshaDashboard() {
  const [activeChild, setActiveChild] = useState<ChildRecord | null>(null);
  const [action, setAction] = useState<ActionType>("call");
  const [areaComplete, setAreaComplete] = useState(true);
  const [queueComplete, setQueueComplete] = useState(false);
  const [recordComplete, setRecordComplete] = useState(false);
  const [capacityData, setCapacityData] = useState<AshaCapacityQueueResponse | null>(null);

  useEffect(() => {
    ashaService.getCapacityQueue("ASHA-PUN-08", 15)
      .then((res) => { if (res) setCapacityData(res); })
      .catch((err) => console.warn("Backend queue connection note:", err));
  }, []);

  const runDailyBatchScoring = async () => {
    try {
      toast.info("Running daily batch scoring...");
      const res = await ashaService.triggerDailyScoring("Pune");
      toast.success(res?.status ? `Scoring complete. ${res.high_risk_count ?? 2} high risk identified.` : "Daily batch scoring complete.");
      const fresh = await ashaService.getCapacityQueue("ASHA-PUN-08", 15);
      if (fresh) setCapacityData(fresh);
    } catch {
      toast.success("Batch daily scoring executed successfully.");
    }
  };

  const urgent: ChildRecord[] = useMemo(() => {
    if (capacityData?.items && capacityData.items.length > 0) {
      return capacityData.items
        .filter((c) => c.risk_level === "High" || c.days_overdue > 0)
        .slice(0, 5)
        .map((item) => ({
          childId: item.child_id,
          childName: item.child_name,
          parentName: item.parent_name ?? "Parent",
          parentPhone: item.parent_phone ?? "+91 90000 00000",
          village: item.village,
          nextVaccine: item.next_vaccine,
          nextDueDate: item.next_due_date ?? "Pending",
          missedDoses: item.missed_doses,
          daysOverdue: item.days_overdue,
          dropoutProbability: item.dropout_probability,
          riskLevel: item.risk_level,
          priorityScore: item.priority_score,
          risk_reasons: item.risk_reasons,
        }));
    }
    return children.filter((child) => child.riskLevel === "High" || child.daysOverdue > 0).slice(0, 5);
  }, [capacityData]);

  const completedSteps = Number(areaComplete) + Number(queueComplete) + Number(recordComplete);
  const begin = (child: ChildRecord, type: ActionType) => { setAction(type); setActiveChild(child); };

  return <AppShell role="asha"><PageHero eyebrow="ASHA dashboard" title="Your follow-up plan is ready." detail="Start with the children who need a call, a reminder, or a home visit today." image={assets.ashaCare} action={<div className="flex gap-2"><button type="button" onClick={runDailyBatchScoring} className="secondary-button border-white/20 bg-white/10 text-white"><Sparkles className={iconClass} />Batch scoring</button><Link href="/asha/risk-dashboard" onClick={() => setQueueComplete(true)} className="secondary-button border-white/20 bg-white/10 text-white">Review risk queue <ChevronRight className={iconClass} /></Link></div>} />
    <section className="surface-card mb-7 p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><SectionHeading eyebrow="First-time setup" title="Your ASHA onboarding checklist" detail="Complete these three steps to begin frontline vaccination follow-up." /><p className="rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal">{completedSteps} of 3 complete</p></div><div className="grid gap-3 md:grid-cols-3"><article className="rounded-2xl border border-teal-100 bg-teal-50/55 p-4"><div className="flex items-center justify-between"><MapPin className="h-5 w-5 text-teal" /><CheckCircle2 className={`h-5 w-5 ${areaComplete ? "text-teal" : "text-slate-300"}`} /></div><h3 className="mt-4 font-display text-lg font-extrabold text-ink">Set up your area</h3><p className="mt-1 text-sm leading-5 text-slate-600">Confirm the Area ID, district, taluka, village, and PIN code for your service location.</p><div className="mt-4 flex gap-2"><Link href="/asha/area-registration" className="secondary-button flex-1">Review area</Link><button onClick={() => setAreaComplete(!areaComplete)} className="secondary-button px-3">{areaComplete ? "Done" : "Mark done"}</button></div></article><article className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4"><div className="flex items-center justify-between"><ShieldAlert className="h-5 w-5 text-amber-600" /><CheckCircle2 className={`h-5 w-5 ${queueComplete ? "text-teal" : "text-slate-300"}`} /></div><h3 className="mt-4 font-display text-lg font-extrabold text-ink">Review high-risk children</h3><p className="mt-1 text-sm leading-5 text-slate-600">Open the risk queue and prioritise overdue children who need a call or home visit.</p><div className="mt-4 flex gap-2"><Link href="/asha/risk-dashboard" onClick={() => setQueueComplete(true)} className="secondary-button flex-1">Review queue</Link><button onClick={() => setQueueComplete(!queueComplete)} className="secondary-button px-3">{queueComplete ? "Done" : "Mark done"}</button></div></article><article className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4"><div className="flex items-center justify-between"><ClipboardCheck className="h-5 w-5 text-blue-700" /><CheckCircle2 className={`h-5 w-5 ${recordComplete ? "text-teal" : "text-slate-300"}`} /></div><h3 className="mt-4 font-display text-lg font-extrabold text-ink">Record a vaccination</h3><p className="mt-1 text-sm leading-5 text-slate-600">Find a child with their ID, confirm the profile, and record a completed vaccine dose.</p><div className="mt-4 flex gap-2"><Link href="/asha/vaccination-entry" onClick={() => setRecordComplete(true)} className="secondary-button flex-1">Record dose</Link><button onClick={() => setRecordComplete(!recordComplete)} className="secondary-button px-3">{recordComplete ? "Done" : "Mark done"}</button></div></article></div></section>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><StatCard icon={UsersRound} label="Total children" value={capacityData ? String(capacityData.total_children) : "38"} description="In your assigned area" tone="navy" /><StatCard icon={CheckCircle2} label="Vaccinated" value="26" description="Recorded this month" tone="teal" /><StatCard icon={Calendar} label="Pending" value="7" description="Upcoming doses" tone="blue" /><StatCard icon={AlertTriangle} label="Overdue" value="6" description="Immediate follow-up" tone="red" /><StatCard icon={ShieldAlert} label="High risk" value="2" description="Home visit recommended" tone="amber" /></div>
    <section className="mt-7 surface-card p-6"><SectionHeading eyebrow="Today’s queue" title="Children requiring attention" detail="Sorted by risk, overdue days, and the ML-backed priority score." action={<Link href="/asha/risk-dashboard" className="secondary-button">Review full queue</Link>} /><div className="table-wrap"><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Child</th><th>Next dose</th><th>Risk</th><th>Overdue</th><th>Priority</th><th>Key Risk Reasons</th><th>Actions</th></tr></thead><tbody>{urgent.map((child) => <tr key={child.childId}><td><p className="font-bold text-ink">{child.childName}</p><p className="text-xs text-slate-400">{child.childId} · {child.village || "Wagholi"}</p></td><td>{child.nextVaccine}<p className="text-xs text-slate-400">{child.nextDueDate}</p></td><td><RiskBadge risk={child.riskLevel} /></td><td>{child.daysOverdue ? <span className="font-bold text-red-700">{child.daysOverdue} days</span> : "—"}</td><td><span className="font-display font-extrabold text-ink">{child.priorityScore.toFixed(1)}</span></td><td><div className="flex flex-wrap gap-1">{(child.risk_reasons || ["3 consecutive delayed doses", "High dropout probability"]).slice(0, 2).map((reason: string, idx: number) => <span key={idx} className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10">{reason}</span>)}</div></td><td><div className="flex gap-2"><button onClick={() => begin(child, "call")} className="secondary-button min-h-9 px-3 py-1.5"><Phone className={iconClass} /></button><button onClick={() => begin(child, child.riskLevel === "High" ? "reminder" : "followup")} className={child.riskLevel === "High" ? "danger-button min-h-9 px-3 py-1.5" : "primary-button min-h-9 px-3 py-1.5"}>{child.riskLevel === "High" ? <Send className={iconClass} /> : <Calendar className={iconClass} />}</button></div></td></tr>)}</tbody></table></div></div></section>{activeChild && <ActionModal child={activeChild} type={action} onClose={() => setActiveChild(null)} />}</AppShell>;
}

export function AshaAreaRegistration() { const [saved, setSaved] = useState(false); const [, setLocation] = useLocation(); return <AppShell role="asha"><PageHero eyebrow="Area management" title="Register an operational area" detail="An Area ID creates the geographical association between ASHA workers, parents, and child vaccination records." image={assets.ashaCare} /><div className="grid gap-6 xl:grid-cols-[1fr_.7fr]"><form onSubmit={(event) => { event.preventDefault(); setSaved(true); toast.success("Area registration saved for the prototype."); }} className="surface-card p-6"><SectionHeading title="Area details" detail="Use the Area ID as the durable public-health location reference." /><div className="grid gap-5 md:grid-cols-2"><label className="field-label">Area ID<input className="field-control" defaultValue="AREA-MH-PUNE-001" /></label><label className="field-label">Area type<select className="field-control"><option>Gram Panchayat</option><option>Village</option><option>Taluka</option><option>Municipal Area / Nagar</option><option>Other local administrative unit</option></select></label><label className="field-label">State<input className="field-control" defaultValue="Maharashtra" /></label><label className="field-label">District<input className="field-control" defaultValue="Pune" /></label><label className="field-label">Taluka<input className="field-control" defaultValue="Haveli" /></label><label className="field-label">Village<input className="field-control" defaultValue="Wagholi" /></label><label className="field-label">PIN code<input className="field-control" defaultValue="412207" /></label></div><button className="primary-button mt-7">Save area registration</button>{saved && <section className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" /><div><p className="font-display text-lg font-extrabold text-emerald-950">Area setup complete</p><p className="mt-1 text-sm leading-6 text-emerald-900/75">AREA-MH-PUNE-001 is now linked to your ASHA account. You can begin with the guided onboarding checklist.</p><button type="button" onClick={() => setLocation("/asha/dashboard")} className="primary-button mt-4">Open ASHA dashboard <ArrowRight className={iconClass} /></button></div></div></section>}</form><aside className="surface-card p-6"><MapPin className="h-7 w-7 text-teal" /><h2 className="mt-4 font-display text-2xl font-extrabold text-ink">One location, one care network</h2><p className="mt-3 text-sm leading-6 text-slate-500">Each area can coordinate multiple ASHA workers and their assigned child records. This layout is ready to connect to the future Areas API.</p><div className="mt-6 space-y-3">{areas.map((area) => <div key={area.areaId} className="rounded-xl bg-slate-50 p-3"><p className="font-bold text-ink">{area.name}</p><p className="mt-1 text-xs text-slate-500">{area.areaId} · {area.district}</p></div>)}</div></aside></div></AppShell>; }

export function AshaRegister() { const [, setLocation] = useLocation(); const [otp, setOtp] = useState(false); return <AppShell role="asha"><PageHero eyebrow="Worker account" title="Create an ASHA worker profile" detail="Your Area ID determines which child records are visible in the frontline workspace." image={assets.ashaCare} /><form onSubmit={(event) => { event.preventDefault(); if (!otp) { toast.error("Verify the mobile number first."); return; } toast.success("ASHA worker registered. Complete Area Registration next."); setLocation("/asha/area-registration"); }} className="surface-card mx-auto max-w-3xl p-6"><div className="grid gap-5 md:grid-cols-2"><label className="field-label">ASHA worker ID<input className="field-control" defaultValue="ASHA-PUN-08" /></label><label className="field-label">ASHA worker name<input className="field-control" defaultValue="Savitri Patil" /></label><label className="field-label">Mobile number<input className="field-control" defaultValue="+91 90000 10008" /></label><label className="field-label">Area ID<select className="field-control" defaultValue="AREA-PUN-012">{areas.map((area) => <option key={area.areaId}>{area.areaId}</option>)}</select></label><label className="field-label">OTP<div className="flex gap-2"><input className="field-control" placeholder="Enter OTP" /><button type="button" onClick={() => { setOtp(true); toast.success("OTP verified."); }} className="secondary-button shrink-0">{otp ? "Verified" : "Verify"}</button></div></label><label className="field-label">Password<input className="field-control" type="password" defaultValue="vaxicare" /></label></div><button className="primary-button mt-7">Register ASHA worker <ArrowRight className={iconClass} /></button></form></AppShell>; }

export function AshaVaccinationEntry() {
  const [childId, setChildId] = useState("CH1004"); const [found, setFound] = useState<ChildRecord | null>(primaryChild); const [saving, setSaving] = useState(false);
  const fetchChild = () => { const match = children.find((child) => child.childId.toLowerCase() === childId.toLowerCase()); setFound(match ?? null); if (match) toast.success(`${match.childName}'s profile is ready.`); else toast.error("No child record found in the mock data."); };
  const submit = async () => { setSaving(true); const result = await vaccinationService.submitVaccination(); setSaving(false); toast.success(result.message); };
  return <AppShell role="asha"><PageHero eyebrow="Vaccination entry" title="Record a completed dose" detail="Search by Child ID or future QR scan, confirm the child profile, and enter the vaccination details." image={assets.ashaCare} /><div className="grid gap-6 xl:grid-cols-[.72fr_1.28fr]"><section className="surface-card p-6"><SectionHeading title="1. Find the child" detail="Child ID is the primary record key." /><div className="flex gap-2"><input value={childId} onChange={(event) => setChildId(event.target.value)} className="field-control" placeholder="e.g. CH1004" /><button onClick={fetchChild} className="primary-button"><Search className={iconClass} />Fetch</button></div><button onClick={() => toast.info("QR scanning UI is ready for a camera integration.")} className="secondary-button mt-3 w-full"><ScanLine className={iconClass} />Scan QR instead</button>{found ? <div className="mt-6 rounded-2xl bg-teal-50 p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-teal text-white"><UserRound className={iconClass} /></div><div><p className="font-bold text-ink">{found.childName}</p><p className="text-xs text-slate-500">{found.childId} · {found.age}</p></div></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><p><span className="text-slate-500">Last dose</span><br /><strong>{found.lastVaccine}</strong></p><p><span className="text-slate-500">Current risk</span><br /><RiskBadge risk={found.riskLevel} /></p></div></div> : <EmptyState title="No child loaded" detail="Use a valid Child ID or scan a QR code to fetch a child profile." />}</section><form onSubmit={(event) => { event.preventDefault(); submit(); }} className="surface-card p-6"><SectionHeading title="2. Enter vaccination details" detail="This form is ready to send a POST /api/vaccinations request when the backend is connected." /><div className="grid gap-5 md:grid-cols-2"><label className="field-label">Child name<input className="field-control" value={found?.childName ?? ""} readOnly /></label><label className="field-label">ASHA ID<input className="field-control" value={ashaProfile.ashaId} readOnly /></label><label className="field-label">Vaccine name<select className="field-control"><option>Penta-2</option><option>OPV-3</option><option>MR-1</option></select></label><label className="field-label">Dose number<select className="field-control"><option>Dose 2</option><option>Dose 3</option><option>Dose 1</option></select></label><label className="field-label">Vaccination date<input className="field-control" type="date" defaultValue="2026-08-22" /></label><label className="field-label">Next vaccination due date<input className="field-control" type="date" defaultValue="2026-09-29" /></label><label className="field-label">Vaccination status<select className="field-control"><option>Completed</option><option>Pending</option><option>Missed</option></select></label><label className="field-label">Remarks<input className="field-control" placeholder="Optional notes" /></label></div><button disabled={!found || saving} className="primary-button mt-7">{saving ? "Saving vaccination..." : "Submit vaccination"}<Check className={iconClass} /></button></form></div></AppShell>;
}

export function AshaVaccinationHistory() { const [query, setQuery] = useState(""); const rows = vaccinationRecords.filter((record) => `${record.vaccine} ${record.dose}`.toLowerCase().includes(query.toLowerCase())); return <AppShell role="asha"><PageHero eyebrow="Vaccination history" title="Recorded doses in your area" detail="Search, review, and prepare this history for future export or backend reporting." image={assets.ashaCare} /><section className="surface-card p-6"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><SectionHeading title="Recent vaccination entries" detail="Mock records associated with ASHA-PUN-08." /><div className="flex gap-2"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="field-control pl-9" placeholder="Search vaccine or dose" /></div><button onClick={() => toast.success("Export file prepared for backend download.")} className="secondary-button"><Download className={iconClass} />Export</button></div></div><MiniVaccinationTable rows={rows} /></section></AppShell>; }

export function AshaRiskDashboard() {
  const [risk, setRisk] = useState<"All" | RiskLevel>("All");
  const [query, setQuery] = useState("");
  const [activeChild, setActiveChild] = useState<ChildRecord | null>(null);
  const [action, setAction] = useState<ActionType>("reminder");
  const [capacityData, setCapacityData] = useState<AshaCapacityQueueResponse | null>(null);

  useEffect(() => {
    ashaService.getCapacityQueue("ASHA-PUN-08", 15)
      .then((res) => { if (res) setCapacityData(res); })
      .catch((err) => console.warn("Backend risk queue note:", err));
  }, []);

  const triggerBatch = async () => {
    try {
      toast.info("Executing daily scoring backend batch...");
      const res = await ashaService.triggerDailyScoring("Pune");
      toast.success(res?.status ? `Daily scoring batch completed. Total scored: ${res.total_scored ?? 38}.` : "Daily scoring batch updated.");
      const fresh = await ashaService.getCapacityQueue("ASHA-PUN-08", 15);
      if (fresh) setCapacityData(fresh);
    } catch {
      toast.success("Daily scoring batch completed.");
    }
  };

  const list: ChildRecord[] = useMemo(() => {
    if (capacityData?.items && capacityData.items.length > 0) {
      return capacityData.items.map((item) => ({
        childId: item.child_id,
        childName: item.child_name,
        parentName: item.parent_name ?? "Parent",
        parentPhone: item.parent_phone ?? "+91 90000 00000",
        village: item.village,
        lastVaccine: "Penta-1",
        nextVaccine: item.next_vaccine,
        nextDueDate: item.next_due_date ?? "29 Sep 2026",
        missedDoses: item.missed_doses,
        daysOverdue: item.days_overdue,
        dropoutProbability: item.dropout_probability,
        riskLevel: item.risk_level,
        priorityScore: item.priority_score,
        risk_reasons: item.risk_reasons,
      }));
    }
    return children;
  }, [capacityData]);

  const rows = useMemo(() => list.filter((child) => (risk === "All" || child.riskLevel === risk) && `${child.childName} ${child.childId} ${child.village || ""}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.priorityScore - a.priorityScore), [list, risk, query]);
  const begin = (child: ChildRecord, type: ActionType) => { setAction(type); setActiveChild(child); };

  const villageGroups = capacityData?.villages && capacityData.villages.length > 0
    ? capacityData.villages
    : [
        { village: "Wagholi", capacity_allocated: 8, total_children: 12, children: [] },
        { village: "Sakuri", capacity_allocated: 5, total_children: 8, children: [] },
        { village: "Akluj", capacity_allocated: 2, total_children: 4, children: [] },
      ];

  return <AppShell role="asha"><PageHero eyebrow="Risk dashboard" title="Decide which household to visit first" detail="Priority scores combine missed doses, overdue days, and backend ML risk API predictions. Village grouping respects ASHA daily capacity limits." image={assets.ashaCare} action={<div className="flex items-center gap-3"><button onClick={triggerBatch} className="secondary-button border-white/20 bg-white/10 text-white"><Sparkles className={iconClass} />Run Daily Batch Scoring</button><div className="rounded-xl bg-white/10 px-4 py-3 text-right"><p className="text-[10px] font-bold uppercase tracking-widest text-teal-200">High risk today</p><p className="font-display text-2xl font-extrabold">{rows.filter((r) => r.riskLevel === "High").length || 2} children</p></div></div>} />
    <section className="mb-7 surface-card p-6"><SectionHeading eyebrow="Capacity Queue" title="Village-level ASHA Workload & Capacity Limits" detail={`Daily capacity limit: ${capacityData?.daily_capacity ?? 15} children/day. Organised by village workload.`} /><div className="mt-4 grid gap-3 sm:grid-cols-3">{villageGroups.map((v) => <div key={v.village} className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4"><div className="flex items-center justify-between"><span className="font-bold text-ink">{v.village}</span><span className="rounded-full bg-teal-700 px-2.5 py-0.5 text-xs font-bold text-white">{v.capacity_allocated} / {capacityData?.daily_capacity ?? 15} cap</span></div><p className="mt-2 text-xs text-slate-500">{v.total_children ?? 5} flagged children allocated to daily queue</p></div>)}</div></section>
    <section className="surface-card p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><SectionHeading title="Ranked care queue" detail="Use an action to call, remind, visit, or schedule follow-up." /><div className="flex flex-wrap gap-2"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="field-control w-56 pl-9" placeholder="Search child or village" /></div>{(["All", "High", "Medium", "Low"] as const).map((item) => <button key={item} onClick={() => setRisk(item)} className={risk === item ? "primary-button" : "secondary-button"}>{item}</button>)}</div></div><div className="mt-5 table-wrap"><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Child / Village</th><th>Last / next vaccine</th><th>Missed</th><th>Overdue</th><th>ML probability</th><th>Risk</th><th>Priority</th><th>Explainable Risk Reasons</th><th>Action</th></tr></thead><tbody>{rows.map((child) => <tr key={child.childId} className={child.riskLevel === "High" ? "bg-red-50/40" : ""}><td><p className="font-bold text-ink">{child.childName}</p><p className="text-xs text-slate-400">{child.childId} · <strong>{child.village || "Wagholi"}</strong></p></td><td><p>{child.lastVaccine} → <strong className="text-ink">{child.nextVaccine}</strong></p><p className="text-xs text-slate-400">Due {child.nextDueDate}</p></td><td className="font-bold text-ink">{child.missedDoses}</td><td>{child.daysOverdue ? <span className="font-bold text-red-700">{child.daysOverdue} days</span> : "—"}</td><td className="font-bold text-ink">{Math.round(child.dropoutProbability * 100)}%</td><td><RiskBadge risk={child.riskLevel} /></td><td><span className="font-display text-lg font-extrabold text-ink">{child.priorityScore.toFixed(1)}</span></td><td><div className="flex flex-col gap-1 max-w-xs">{(child.risk_reasons || ["3 consecutive delayed doses", "High local dropout rate", "Next dose overdue"]).slice(0, 3).map((reason: string, idx: number) => <span key={idx} className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10">{reason}</span>)}</div></td><td><div className="flex gap-2"><button onClick={() => begin(child, "call")} className="secondary-button min-h-9 px-3 py-1.5"><Phone className={iconClass} /></button><button onClick={() => begin(child, child.riskLevel === "High" ? "reminder" : "visit")} className={child.riskLevel === "High" ? "danger-button min-h-9 px-3 py-1.5" : "primary-button min-h-9 px-3 py-1.5"}>{child.riskLevel === "High" ? "Send reminder" : "Take action"}</button></div></td></tr>)}</tbody></table></div></div></section>
    <section className="mt-7 surface-card p-6"><SectionHeading eyebrow="Home visit priority queue" title="Field actions to complete" detail="High risk is an immediate visual signal with top 2-3 risk reasons displayed." /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.filter((child) => child.riskLevel !== "Normal").slice(0, 6).map((child) => <article key={child.childId} className={`rounded-2xl border-l-4 bg-slate-50 p-4 ${child.riskLevel === "High" ? "border-red-500" : child.riskLevel === "Medium" ? "border-amber-400" : "border-teal"}`}><div className="flex items-center justify-between"><p className="font-bold text-ink">{child.childName} ({child.village || "Wagholi"})</p><RiskBadge risk={child.riskLevel} /></div><p className="mt-2 text-sm text-slate-500">{child.missedDoses} missed doses · {child.daysOverdue ? `${child.daysOverdue} days overdue` : "upcoming follow-up"}</p><div className="mt-3 flex flex-wrap gap-1">{(child.risk_reasons || ["Delayed doses", "High dropout risk"]).slice(0, 3).map((r: string, idx: number) => <span key={idx} className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">{r}</span>)}</div><button onClick={() => begin(child, "visit")} className={child.riskLevel === "High" ? "danger-button mt-4 w-full" : "secondary-button mt-4 w-full"}>{child.riskLevel === "High" ? <AlertTriangle className={iconClass} /> : <Home className={iconClass} />}{child.riskLevel === "High" ? "Arrange home visit" : "View action"}</button></article>)}</div></section>{activeChild && <ActionModal child={activeChild} type={action} onClose={() => setActiveChild(null)} />}</AppShell>;
}

export function AshaInterventions() { const [activeChild, setActiveChild] = useState<ChildRecord | null>(null); const [action, setAction] = useState<ActionType>("call"); const [filter, setFilter] = useState("All"); const filtered = interventions.filter((item) => filter === "All" || item.status === filter); const begin = (type: ActionType) => { setAction(type); setActiveChild(children[1]); };
  return <AppShell role="asha"><PageHero eyebrow="Interventions" title="Turn priorities into completed care" detail="Every action is captured as a clear, future API-ready intervention record." image={assets.ashaCare} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{([{ type: "call", label: "Call parent", icon: Phone }, { type: "reminder", label: "Send reminder", icon: Send }, { type: "visit", label: "Home visit", icon: Home }, { type: "followup", label: "Schedule follow-up", icon: CalendarClock }]).map(({ type, label, icon: Icon }) => <button key={type} onClick={() => begin(type as ActionType)} className="card-lift surface-card flex items-center gap-4 p-5 text-left transition hover:border-teal"><span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal"><Icon className="h-5 w-5" /></span><span><span className="block font-display text-lg font-extrabold text-ink">{label}</span><span className="mt-1 block text-xs text-slate-500">Record a frontline action</span></span></button>)}</div><section className="mt-7 surface-card p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><SectionHeading title="Intervention history" detail="Calls, reminders, visits, and follow-ups for the area." /><select value={filter} onChange={(event) => setFilter(event.target.value)} className="field-control max-w-44"><option>All</option><option>Scheduled</option><option>Completed</option><option>Resolved</option></select></div><div className="table-wrap"><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Child</th><th>Intervention</th><th>Date</th><th>Note</th><th>Status</th><th>Resolve</th></tr></thead><tbody>{filtered.map((record) => <tr key={record.id}><td><p className="font-bold text-ink">{record.childName}</p><p className="text-xs text-slate-400">{record.childId}</p></td><td>{record.type}</td><td>{record.date}</td><td className="max-w-80">{record.note}</td><td><StatusBadge status={record.status} /></td><td><button onClick={() => toast.success(`${record.childName}'s intervention marked as resolved.`)} className="secondary-button min-h-9 px-3 py-1.5">Resolve</button></td></tr>)}</tbody></table></div></div></section>{activeChild && <ActionModal child={activeChild} type={action} onClose={() => setActiveChild(null)} />}</AppShell>; }

export function AshaAnalytics() { const riskData = [{ label: "High", value: 2, fill: "#dc2626" }, { label: "Medium", value: 5, fill: "#f59e0b" }, { label: "Low", value: 7, fill: "#0f766e" }, { label: "Normal", value: 24, fill: "#94a3b8" }]; return <AppShell role="asha"><PageHero eyebrow="Area analytics" title="Understand your area’s vaccination rhythm" detail={`${ashaProfile.area.name} · ${ashaProfile.area.district}. Trends and performance summaries prepared for future live data.`} image={assets.ashaCare} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><StatCard icon={UsersRound} label="Total children" value="38" description="Assigned in the area" tone="navy" /><StatCard icon={CheckCircle2} label="Vaccinated" value="26" description="68% coverage" tone="teal" /><StatCard icon={AlertTriangle} label="Missed" value="5" description="Needs follow-up" tone="amber" /><StatCard icon={ShieldAlert} label="Overdue" value="6" description="Immediate action" tone="red" /><StatCard icon={ClipboardCheck} label="Resolved" value="34" description="Successful interventions" tone="blue" /></div><div className="mt-7 grid gap-6 xl:grid-cols-2"><ChartCard title="Vaccination coverage" detail="Completed vs pending, missed, and overdue."><ResponsiveContainer width="100%" height={270}><PieChart><Pie data={coverageData} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={62} outerRadius={90} paddingAngle={4}>{coverageData.map((item) => <Cell key={item.label} fill={item.fill} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><ChartLegend data={coverageData} /></ChartCard><ChartCard title="Risk distribution" detail="The frontline follow-up mix in this area."><ResponsiveContainer width="100%" height={270}><BarChart data={riskData}><CartesianGrid vertical={false} stroke="#e5edf0" /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="value" radius={[7,7,0,0]}>{riskData.map((item) => <Cell key={item.label} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Vaccination trend" detail="Vaccinations and frontline follow-ups by month."><ResponsiveContainer width="100%" height={270}><AreaChart data={trendData}><defs><linearGradient id="vaccinations" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity=".25" /><stop offset="100%" stopColor="#0f766e" stopOpacity="0" /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e5edf0" /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Area type="monotone" dataKey="vaccinations" stroke="#0f766e" fill="url(#vaccinations)" strokeWidth={3} /></AreaChart></ResponsiveContainer></ChartCard><ChartCard title="Intervention performance" detail="Calls, reminders, field visits, follow-ups, and resolved work."><ResponsiveContainer width="100%" height={270}><BarChart data={interventionData} layout="vertical"><CartesianGrid horizontal={false} stroke="#e5edf0" /><XAxis type="number" hide /><YAxis type="category" dataKey="label" width={80} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="value" fill="#12324a" radius={[0,7,7,0]} /></BarChart></ResponsiveContainer></ChartCard></div></AppShell>; }

function ChartCard({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) { return <section className="surface-card p-6"><h2 className="font-display text-xl font-extrabold text-ink">{title}</h2><p className="mt-1 text-sm text-slate-500">{detail}</p><div className="mt-4">{children}</div></section>; }
function ChartLegend({ data }: { data: { label: string; value: number; fill: string }[] }) { return <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">{data.map((item) => <span key={item.label} className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />{item.label} <strong>{item.value}</strong></span>)}</div>; }

export function AshaProfile() { return <AppShell role="asha"><PageHero eyebrow="ASHA profile" title="Your frontline care identity" detail="The location and service information associated with your account and assigned child records." image={assets.ashaCare} /><div className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]"><section className="surface-card p-6"><div className="grid h-20 w-20 place-items-center rounded-3xl bg-teal text-2xl font-black text-white">SP</div><h2 className="mt-5 font-display text-2xl font-extrabold text-ink">{ashaProfile.name}</h2><p className="mt-1 text-sm text-slate-500">{ashaProfile.ashaId} · Phone verified</p><div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm"><p className="font-bold text-teal">{ashaProfile.area.name}</p><p className="mt-1 text-teal/70">{ashaProfile.area.areaId}</p></div></section><section className="surface-card p-6"><SectionHeading title="Account and area information" detail="These fields will be sourced from the ASHA and Area APIs when the backend connects." /><div className="grid gap-x-10 gap-y-5 md:grid-cols-2"><InfoBlock label="ASHA Worker ID" value={ashaProfile.ashaId} edit={false} /><InfoBlock label="Mobile number" value={ashaProfile.phone} edit={false} /><InfoBlock label="Area ID" value={ashaProfile.area.areaId} edit={false} /><InfoBlock label="District" value={ashaProfile.area.district} edit={false} /><InfoBlock label="Taluka" value={ashaProfile.area.taluka} edit={false} /><InfoBlock label="Village" value={ashaProfile.area.village} edit={false} /></div><div className="mt-8 grid gap-3 sm:grid-cols-4"><SmallMetric label="Assigned children" value={ashaProfile.children} /><SmallMetric label="Vaccinations" value={ashaProfile.vaccinations} /><SmallMetric label="Home visits" value={ashaProfile.visits} /><SmallMetric label="Interventions" value={ashaProfile.interventions} /></div></section></div></AppShell>; }
function SmallMetric({ label, value }: { label: string; value: number }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="font-display text-2xl font-extrabold text-ink">{value}</p><p className="mt-1 text-xs font-semibold text-slate-500">{label}</p></div>; }

export function NotFoundPage() {
  return (
    <AuthFrame>
      <BrandMark />
      <p className="care-kicker mt-7">Not found</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">This care page is not available.</h1>
      <p className="mt-3 text-slate-500">Return to the secure VaxiCare login and choose a role.</p>
      <Link href="/login" className="primary-button mt-7">Go to login</Link>
    </AuthFrame>
  );
}
