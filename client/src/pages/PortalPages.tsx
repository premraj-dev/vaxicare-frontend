/** Verified Care Console: role-aware pages use a shared, action-first clinical interface. */

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { AreaChart, Area, BarChart, Bar, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowRight, Bell, Calendar, CalendarClock, Check, CheckCircle2, ChevronRight, ClipboardCheck, Download, FileText, HeartPulse, Home, Info, MapPin, MessageCircle, Phone, Play, Plus, QrCode, ScanLine, Search, Send, ShieldAlert, Sparkles, Stethoscope, UserRound, UsersRound, Video, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ActionModal, type ActionType } from "@/components/ActionModal";
import { BrandMark } from "@/components/BrandMark";
import { DashboardNotice, DemoDataBadge } from "@/components/DashboardNotice";
import { DatePicker } from "@/components/DatePicker";
import { EmptyState, ProgressLine, RiskBadge, SectionHeading, StatCard, StatusBadge } from "@/components/Ui";
import { areas, ashaProfile, assets, children, coverageData, interventionData, interventions, parentProfile, primaryChild, reminders, trendData, vaccinationRecords } from "@/data/mockData";
import { createReminderPlan, loginWithEmailOtp, resolveIntervention, sendEmailOtp, type ReminderPlanResponse } from "@/lib/api";
import { useDashboardData } from "@/hooks/useDashboardData";
import { reminderService, vaccinationService } from "@/services/mockApi";
import type { ChildRecord, RiskLevel, Role, VaccinationStatus } from "@/types";

const iconClass = "h-4 w-4";

function formatDashboardDate(value: string | null | undefined) {
  if (!value) return "No upcoming dose";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const login = async () => {
    setLoading(true);
    try {
      const response = await loginWithEmailOtp({
        email,
        otp,
      });
      if (!response.access_token) {
        throw new Error("The login response did not include an access token.");
      }
      localStorage.setItem("access_token", response.access_token);
      const userProfile = response.user_profile;
      localStorage.setItem("user_profile", JSON.stringify(userProfile));
      setLocation(userProfile.role === "parent" ? "/parent/dashboard" : "/asha/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to verify your login.");
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    if (!email.trim()) {
      toast.error("Enter your email address first.");
      return;
    }
    try {
      const response = await sendEmailOtp({ email: email.trim() });
      if (!response.sent) {
        throw new Error("Supabase did not confirm that the verification code was sent.");
      }
      setOtpSent(true);
      toast.success("Verification code sent to your email.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send the verification code.");
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-slate-50 font-sans overflow-x-hidden">
      {/* Left Side: Dark Green Background (#064E3B) */}
      <div className="relative w-full min-h-[34vh] lg:min-h-[100dvh] lg:w-1/2 bg-[#064E3B] text-white p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-col justify-between overflow-hidden">
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
            <span className="ml-2.5 rounded-full bg-emerald-800/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-700/50">
              No child left behind
            </span>
          </div>
        </div>

        {/* Middle Main Content */}
        <div className="relative z-10 my-auto py-4 max-w-xl">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white">
            Catching a missed dose before it's missed.
          </h1>
          <p className="mt-3.5 text-sm lg:text-base leading-relaxed text-emerald-100/90 font-medium">
            RootCause predicts which children are at risk of falling behind on vaccines, and gives parents and ASHA workers exactly what they need to act — in time.
          </p>
        </div>

        {/* Bottom Footer Quote */}
        <div className="relative z-10 pt-4 border-t border-emerald-800/80">
          <blockquote className="rounded-xl bg-emerald-950/50 p-3.5 border-l-4 border-emerald-400 text-xs lg:text-sm text-emerald-100/90 italic leading-relaxed">
            “The risk list tells me exactly whose door to knock on first.”
            <span className="block mt-1 font-semibold not-italic text-emerald-300">— ASHA worker</span>
          </blockquote>
        </div>
      </div>

      {/* Right Side: Clean White Background (#FFFFFF) */}
      <div className="w-full min-h-[66vh] lg:min-h-[100dvh] lg:w-1/2 bg-white p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-col justify-between">
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
            <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-ink">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">
              Track your child's vaccination journey
            </p>
          </div>

          {/* Role Selector Pills */}
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

          {/* Sub-Mode Navigation Tabs */}
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

          {/* Input Fields */}
          {tab === "login" ? (
            <div className="space-y-3.5">
              <label className="block text-xs font-bold text-slate-700">
                {role === "parent" ? "Parent / mother email" : "Worker email"}
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm font-medium text-ink outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block text-xs font-bold text-slate-700">
                OTP
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-center font-display text-base font-bold tracking-[.45em] text-ink outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                    placeholder="Enter OTP"
                  />
                  <button
                    type="button"
                    onClick={requestOtp}
                    className="h-11 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                  >
                    {otpSent ? "Resend code" : "Send code"}
                  </button>
                </div>
              </label>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={login}
                disabled={loading}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#064E3B] text-sm lg:text-base font-bold text-white shadow-md shadow-emerald-950/20 transition hover:bg-emerald-900 active:scale-[0.99] disabled:opacity-60"
              >
                <span>{loading ? "Verifying..." : "Verify & Continue"}</span>
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
  const fields = role === "parent" ? ["Name", "Child’s date of birth", "Parent email", "Location", "PIN code"] : ["Panchayat name", "Panchayat / Worker ID", "Email address", "Set password"];
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const requestRegistrationOtp = async () => {
    if (!email.trim()) {
      toast.error("Enter your email address before requesting a verification code.");
      return;
    }
    setSendingOtp(true);
    try {
      const response = await sendEmailOtp({ email: email.trim() });
      if (!response.sent) {
        throw new Error("Supabase did not confirm that the verification code was sent.");
      }
      setOtpSent(true);
      setEmailVerified(false);
      toast.success("Verification code sent to your email.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send the verification code.");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyRegistrationOtp = async () => {
    if (!otp.trim()) {
      toast.error("Enter the verification code from your email.");
      return;
    }
    setVerifyingOtp(true);
    try {
      const response = await loginWithEmailOtp({ email: email.trim(), otp: otp.trim() });
      if (!response.access_token) {
        throw new Error("The verification response did not include an access token.");
      }
      setEmailVerified(true);
      localStorage.setItem("access_token", response.access_token);
      const userProfile = response.user_profile;
      localStorage.setItem("user_profile", JSON.stringify(userProfile));
      toast.success("Email verified. You can continue registration.");
    } catch (error) {
      setEmailVerified(false);
      toast.error(error instanceof Error ? error.message : "The verification code is invalid or expired.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const submitRegistration = () => {
    if (!emailVerified) {
      toast.error("Verify your email before continuing registration.");
      return;
    }
    toast.success("Account details saved.");
    onDone();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field, index) => {
          const fullWidth = role === "asha" ? index < 2 : index === 0;
          const isEmailField = field.includes("email") || field.includes("Email");
          const isDateField = field.includes("date") || field.includes("birth");

          if (isDateField) {
            return (
              <div key={field} className={fullWidth ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {field}
                </label>
                <DatePicker
                  value={dob}
                  onChange={setDob}
                  placeholder="Select child's date of birth"
                  isDob={true}
                />
              </div>
            );
          }

          return (
            <label key={field} className={`block text-xs font-bold text-slate-700 ${fullWidth ? "sm:col-span-2" : ""}`}>
              {field}
              <input
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-ink outline-none transition focus:border-emerald-600 focus:bg-white"
                placeholder={index === 0 ? role === "parent" ? "Priya Sharma" : "Wagholi Panchayat" : isEmailField ? "you@example.com" : field.includes("PIN") ? "412207" : "Enter details"}
                type={field.includes("password") ? "password" : isEmailField ? "email" : "text"}
                value={isEmailField ? email : undefined}
                onChange={isEmailField ? (event) => { setEmail(event.target.value); setEmailVerified(false); } : undefined}
              />
            </label>
          );
        })}
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Email verification required</p>
        <p className="mt-1 text-xs text-emerald-900/70">Verify your email before the account registration can continue.</p>
        <div className="mt-3 flex gap-2">
          <input
            className="field-control min-w-0 flex-1 bg-white"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(event) => { setOtp(event.target.value); setEmailVerified(false); }}
            placeholder="Enter email code"
            disabled={!otpSent || verifyingOtp}
          />
          <button type="button" onClick={requestRegistrationOtp} disabled={sendingOtp} className="secondary-button shrink-0">
            {sendingOtp ? "Sending..." : otpSent ? "Resend code" : "Send code"}
          </button>
          <button type="button" onClick={verifyRegistrationOtp} disabled={!otpSent || verifyingOtp || emailVerified} className="primary-button shrink-0">
            {emailVerified ? "Verified" : verifyingOtp ? "Checking..." : "Verify"}
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={submitRegistration}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#064E3B] text-base font-bold text-white shadow-lg transition hover:bg-emerald-900"
      >
        <span>{emailVerified ? "Register & Continue" : "Verify email to continue"}</span>
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

export function PageHero({ eyebrow, title, detail, image, action }: { eyebrow: string; title: string; detail: string; image?: string; action?: React.ReactNode }) {
  return (
    <section className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#064E3B] via-teal-900 to-emerald-950 py-5 px-5 text-white shadow-md sm:py-6 sm:px-7">
      <img src={image ?? assets.texture} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-screen" />
      <div className="relative flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1 w-3.5 rounded-full bg-emerald-400" />
            <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-emerald-200">{eyebrow}</p>
          </div>
          <h1 className="mt-1 max-w-xl font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white">{title}</h1>
          <p className="mt-1 max-w-xl text-xs sm:text-sm leading-relaxed text-emerald-100/90">{detail}</p>
        </div>
        {action && <div className="shrink-0 sm:self-center">{action}</div>}
      </div>
    </section>
  );
}

function SimpleVaccinationTimeline({ rows }: { rows: typeof vaccinationRecords }) {
  return (
    <div className="mt-4 space-y-3">
      {rows.map((record) => {
        const isDone = record.status === "Completed";
        const isOverdue = record.status === "Missed" || (record.daysOverdue && record.daysOverdue > 0);
        
        return (
          <div key={record.id} className="animate-card-in flex items-center justify-between rounded-xl border border-emerald-100/80 bg-slate-50/80 p-3.5 transition hover:bg-slate-50 shadow-xs">
            <div className="flex items-center gap-3.5">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-white shadow-xs ${
                isDone ? "bg-emerald-600 animate-check-pop" : isOverdue ? "bg-amber-500" : "bg-teal"
              }`}>
                {isDone ? <Check className="h-4.5 w-4.5 stroke-[3]" /> : isOverdue ? <AlertTriangle className="h-4.5 w-4.5" /> : <ClockIcon />}
              </span>
              <div>
                <p className="font-display text-sm font-extrabold text-ink">{record.vaccine} <span className="text-xs font-normal text-slate-400">({record.dose})</span></p>
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
  const { data, loading, error } = useDashboardData("parent");
  const dashboardChild = data?.children[0] ?? null;
  const childRecords = data?.vaccinationRecords.filter(
    (record) => record.childId === dashboardChild?.id,
  ) ?? [];
  const completionRate = dashboardChild?.completionRate ?? 0;
  const nextVaccineName = loading ? "Loading…" : error ? "Unavailable" : dashboardChild?.nextVaccine ?? "No upcoming dose";
  const nextDueDate = loading ? "Loading…" : error ? "Unavailable" : formatDashboardDate(dashboardChild?.nextDueDate);
  const activeRisk = dashboardChild?.riskLevel ?? null;
  const storedPlan = data?.reminderPlans.find(
    (item) => item.childId === dashboardChild?.id,
  )?.plan;
  const storedReminderCount =
    typeof storedPlan?.number_of_reminders === "number"
      ? storedPlan.number_of_reminders
      : 0;

  // Reminder State
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [livePlan, setLivePlan] = useState<ReminderPlanResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const alertRisk = livePlan?.risk_level ?? activeRisk;

  // Registration Form State
  const [step, setStep] = useState<1 | 2>(1);
  const [generatedId, setGeneratedId] = useState("");
  const [savingReg, setSavingReg] = useState(false);
  const [regDob, setRegDob] = useState("2025-02-17");

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const createLivePlan = async () => {
    if (!dashboardChild?.nextDueDate || !dashboardChild.nextVaccine) {
      toast.error("There is no upcoming dose to plan a reminder for.");
      return;
    }
    setLoadingPlan(true);
    try {
      const parsedDueDate = new Date(`${dashboardChild.nextDueDate}T00:00:00`);
      const nextDoseDueDate = Number.isNaN(parsedDueDate.getTime())
        ? dashboardChild.nextDueDate
        : parsedDueDate.toISOString().slice(0, 10);

      const plan = await createReminderPlan({
        child_id: dashboardChild.id,
        child_name: dashboardChild.childName,
        next_vaccine: dashboardChild.nextVaccine,
        missed_dose_count: dashboardChild.missedDoses,
        next_dose_due_date: nextDoseDueDate,
        dropout_probability: dashboardChild.dropoutProbability,
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

  const handleSubmitStep1 = (event: React.FormEvent) => {
    event.preventDefault();
    setSavingReg(true);
    setTimeout(() => {
      const newId = `CH${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedId(newId);
      setSavingReg(false);
      setStep(2);
      toast.success("Child registered! Digital Health Card created.");
    }, 400);
  };

  return (
    <AppShell role="parent">
      <div className="min-w-0 space-y-6 sm:space-y-8 lg:space-y-10">
        {/* SECTION 1: HERO BANNER & PROTECTED STATUS */}
        <section>
          <PageHero 
            eyebrow="Parent overview" 
            title={`Good morning, ${data?.profile.full_name?.split(" ")[0] || "Parent"}! 👋`} 
            detail="Keep your baby healthy and protected with easy vaccine tracking." 
            image={assets.parentCare} 
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {data?.demoDataPresent && <DemoDataBadge />}
            <DashboardNotice
              loading={loading}
              error={error}
              empty={!loading && !error && (data?.children.length ?? 0) === 0}
              emptyMessage="No children are linked to this parent account yet."
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-12 mt-5">
            {/* Progress Ring Hero Card */}
            <div className="surface-card min-w-0 animate-card-in p-4 sm:p-5 lg:p-6 text-center flex flex-col items-center justify-center lg:col-span-5 border border-emerald-100/80 bg-white shadow-md shadow-emerald-950/5">
              <div className="relative h-32 w-32 flex items-center justify-center">
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
                  <span className="font-display text-3xl font-extrabold text-ink">{loading ? "…" : error ? "—" : `${completionRate}%`}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Protected</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><ShieldAlert className="h-4 w-4 text-amber-500" /> Risk: <strong className="text-ink">{loading ? "…" : error ? "—" : activeRisk}</strong></span>
                <span className="h-3 w-px bg-slate-200" />
                <span className="flex items-center gap-1.5"><Bell className="h-4 w-4 text-teal" /> Active: <strong className="text-ink">{loading ? "…" : error ? "—" : `${livePlan?.number_of_reminders ?? storedReminderCount} reminders`}</strong></span>
              </div>
            </div>

            {/* "What's Next" Action Card */}
            <section className="surface-card min-w-0 animate-card-in p-4 sm:p-5 lg:p-6 flex flex-col justify-between lg:col-span-7 border border-emerald-100/80 bg-white shadow-md shadow-emerald-950/5">
              <div>
                <p className="care-kicker flex items-center gap-1.5 text-xs text-teal font-bold"><Sparkles className="h-4 w-4 text-teal" /> What's next</p>
                <h3 className="mt-1.5 font-display text-2xl font-extrabold text-ink">{nextVaccineName} Dose</h3>
                <p className="mt-1.5 text-sm text-slate-500 flex items-center gap-2"><Calendar className="h-4 w-4 text-teal" /> Scheduled Due Date: <strong className="text-ink">{nextDueDate}</strong></p>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-600">{dashboardChild?.village ? `Your next immunisation is scheduled in ${dashboardChild.village}.` : "Your vaccination schedule is based on your child's recorded doses."}</p>
              </div>
              <button onClick={() => scrollTo("parent-journey")} className="primary-button bg-[#064E3B] hover:bg-emerald-900 text-sm px-6 py-3 font-extrabold mt-4 w-full sm:w-auto self-start shadow-sm">
                Book Next Vaccine <ArrowRight className={iconClass} />
              </button>
            </section>
          </div>
        </section>

        {/* SECTION 2: COMPLETE VACCINE JOURNEY & TIMELINE */}
        <section id="parent-journey" className="scroll-mt-28 surface-card min-w-0 animate-card-in p-4 sm:p-5 lg:p-8 border border-emerald-100/80 bg-white shadow-md shadow-emerald-950/5">
          <SectionHeading eyebrow="Health Record" title="Complete Vaccine Journey & Timeline" detail="Clear timeline of completed, upcoming, and overdue immunisation doses." />
          
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 my-5">
            <StatCard icon={HeartPulse} label="Total doses" value={loading ? "…" : error ? "—" : childRecords.length} description="Recorded doses for this child" tone="navy" />
            <StatCard icon={CheckCircle2} label="Completed" value={loading ? "…" : error ? "—" : childRecords.filter((record) => record.givenDate).length} description="Recorded as given" tone="teal" />
            <StatCard icon={Calendar} label="Upcoming" value={loading ? "…" : error ? "—" : childRecords.filter((record) => record.status === "Pending").length} description="Due in the future" tone="blue" />
            <StatCard icon={AlertTriangle} label="Action needed" value={loading ? "…" : error ? "—" : childRecords.filter((record) => record.status === "Overdue").length} description="Past due, not yet given" tone="amber" />
          </div>

          <DashboardNotice
            loading={loading}
            error={error}
            empty={!loading && !error && childRecords.length === 0}
            emptyMessage="No vaccination records are available for this child."
          />
          {childRecords.length > 0 && <SimpleVaccinationTimeline rows={childRecords} />}
        </section>

        {/* SECTION 3: ACTIVE ALERTS & REMINDERS */}
        <section className="surface-card min-w-0 animate-card-in border border-amber-200/80 bg-amber-50/50 p-4 sm:p-5 lg:p-8 shadow-md shadow-amber-950/5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-700" />{loading ? <span className="text-sm">Loading risk…</span> : error ? <span className="text-sm">Risk unavailable</span> : alertRisk ? <RiskBadge risk={alertRisk} /> : <span className="text-sm">No risk prediction</span>}</div>
              <h2 className="mt-3 font-display text-2xl font-extrabold text-amber-950">{nextVaccineName} Next Vaccine Reminder</h2>
              <p className="mt-2 text-sm text-amber-900/80 flex items-center gap-1.5"><Info className="h-4 w-4 text-amber-700" /> Reminder timing follows the current vaccination plan.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button type="button" onClick={createLivePlan} disabled={loadingPlan || loading || Boolean(error) || !dashboardChild?.nextDueDate} className="primary-button text-base font-extrabold">
                <Bell className={iconClass} />{loadingPlan ? "Setting up..." : "Get Reminders"}
              </button>

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
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-3.5 text-sm font-bold text-teal shadow-xs animate-card-in">
              <Play className="h-5 w-5 fill-current text-teal animate-pulse" /> Audio reminder playing in Marathi...
            </div>
          )}

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {livePlan ? livePlan.reminders.map((reminder) => (
              <article key={`${reminder.reminder_number}-${reminder.reminder_date}`} className="surface-card p-5 bg-white">
                <div className="flex items-center justify-between"><RiskBadge risk={livePlan.risk_level} /><StatusBadge status={reminder.status === "Immediate Overdue Trigger" ? "Overdue" : "Pending"} /></div>
                <h3 className="mt-4 font-display text-xl font-extrabold text-ink">{reminder.next_vaccine}</h3>
                <p className="mt-1 text-sm text-slate-500 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Due {reminder.vaccine_due_date}</p>
                <p className="mt-4 text-sm text-slate-600 flex items-center gap-1.5"><Bell className="h-4 w-4 text-teal" /> Alert scheduled {reminder.days_before_vaccine} day(s) before via {reminder.channel}.</p>
              </article>
            )) : (
              childRecords.filter((record) => record.status !== "Completed").map((reminder) => (
                <article key={reminder.id} className="surface-card p-5 bg-white">
                  <div className="flex items-center justify-between">{activeRisk ? <RiskBadge risk={activeRisk} /> : <span className="text-xs text-slate-500">No risk prediction</span>}<StatusBadge status={reminder.status} /></div>
                  <h3 className="mt-4 font-display text-xl font-extrabold text-ink">{reminder.vaccine}</h3>
                  <p className="mt-1 text-sm text-slate-500 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Due {formatDashboardDate(reminder.dueDate)}</p>
                  <p className="mt-4 text-sm text-slate-600 flex items-center gap-1.5"><Bell className="h-4 w-4 text-teal" /> {reminder.status === "Overdue" ? "This dose is past due." : "This dose is scheduled for a future date."}</p>
                </article>
              ))
            )}
            {!livePlan && childRecords.every((record) => record.status === "Completed") && (
              <p className="text-sm text-slate-500">No pending or overdue doses for this child.</p>
            )}
          </div>
        </section>

        {/* SECTION 4: CHILD REGISTRATION & DIGITAL CARD QR */}
        <section className="surface-card min-w-0 animate-card-in p-4 sm:p-5 lg:p-8 border border-emerald-100/80 bg-white shadow-md shadow-emerald-950/5">
          <SectionHeading eyebrow="Digital Health Card" title="Child Registration & Pass" detail="Quick registration and verified QR pass for frontline ASHA check-in." />

          <div className="grid gap-8 lg:grid-cols-12 mt-6">
            {/* Form Column */}
            <div className="lg:col-span-7">
              {step === 1 ? (
                <form onSubmit={handleSubmitStep1} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="field-label">Full Name<input required className="field-control" defaultValue="Aarav Sharma" /></label>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                      <DatePicker value={regDob} onChange={setRegDob} isDob={true} />
                    </div>
                    <label className="field-label">Gender<select className="field-control" defaultValue="Male"><option>Male</option><option>Female</option></select></label>
                    <label className="field-label">Mother's Name<input required className="field-control" defaultValue="Priya Sharma" /></label>
                    <label className="field-label">Email Address<input required type="email" className="field-control" defaultValue="priya@example.com" /></label>
                    <label className="field-label">Village / City<input required className="field-control" defaultValue="Wagholi" /></label>
                  </div>
                  <button disabled={savingReg} className="primary-button bg-[#064E3B] hover:bg-emerald-900 mt-4 text-sm py-3 font-extrabold w-full sm:w-auto">
                    {savingReg ? "Updating Pass..." : "Register / Update Profile"} <ArrowRight className={iconClass} />
                  </button>
                </form>
              ) : (
                <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <h3 className="font-display text-xl font-extrabold text-emerald-950">Registration Complete!</h3>
                  <p className="mt-1 text-sm text-emerald-900/80">Assigned ID: <strong className="font-mono text-base">{generatedId || "CH1004"}</strong></p>
                  <button onClick={() => setStep(1)} className="secondary-button mt-4 text-xs py-1.5 px-3">Edit Details</button>
                </div>
              )}
            </div>

            {/* QR Card Column */}
            <div className="min-w-0 lg:col-span-5 rounded-2xl border border-dashed border-teal-300 bg-teal-50/60 p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center text-center">
              <QrCode className="h-32 w-32 text-teal mb-3" />
              <p className="font-display text-lg font-extrabold text-ink">Digital Health Card Pass</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">ID: {generatedId || "CH1004"} · QR-{generatedId || "CH1004"}-MH</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Present this QR code to your ASHA worker for instant check-in and vaccine entry.</p>
              <div className="mt-5 flex gap-2 w-full">
                <button type="button" onClick={() => toast.info(`Pass Code: QR-${generatedId || "CH1004"}-MH`)} className="secondary-button text-xs flex-1 py-2 font-bold">
                  <QrCode className={iconClass} /> Show Card
                </button>
                <button type="button" onClick={() => toast.success("Health Card downloaded as PDF!")} className="primary-button text-xs flex-1 py-2 font-bold">
                  Download Pass
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export function ParentRegistration() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [generatedId, setGeneratedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [babyDob, setBabyDob] = useState("");

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
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
              <DatePicker value={babyDob} onChange={setBabyDob} placeholder="Select date of birth" isDob={true} />
            </div>
            <label className="field-label">Gender<select className="field-control" defaultValue="Male"><option>Male</option><option>Female</option><option>Other</option></select></label>
            <label className="field-label">Mother's Name<input required className="field-control" placeholder="e.g. Priya Sharma" /></label>
            <label className="field-label">Email Address<input required type="email" className="field-control" placeholder="e.g. priya@example.com" /></label>
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
            <p className="flex items-center justify-between"><span className="text-slate-500">Email Status</span> <span className="inline-flex items-center gap-1 font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4 text-emerald-600 animate-check-pop" /> Verified</span></p>
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
            <InfoBlock label="Email Address" value={parentProfile.email || "priya@example.com"} edit={editing} />
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
        <SectionHeading title="Reminder History" detail="Past notification logs sent to your email address." />
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-4 w-4 stroke-[3]" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">Email Reminder: Penta-1 Visit</p>
                <p className="text-xs text-slate-400">Sent 2 days ago via email (priya@example.com)</p>
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
  const { data, loading, error, reload } = useDashboardData("asha");
  const [activeChild, setActiveChild] = useState<ChildRecord | null>(null);
  const [action, setAction] = useState<ActionType>("call");
  const [filter, setFilter] = useState("All");
  const metricValue = (value: number) => loading ? "…" : error ? "—" : value;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const urgent = (data?.children ?? [])
    .filter((child) => child.riskLevel === "High" || child.daysOverdue > 0)
    .slice(0, 5);
  const filteredInterventions = (data?.interventions ?? []).filter(
    (record) => filter === "All" || record.status.toLowerCase() === filter.toLowerCase(),
  );

  const begin = (child: ChildRecord, type: ActionType) => { setAction(type); setActiveChild(child); };
  const beginGeneric = (type: ActionType) => {
    if (!data?.children[0]) {
      toast.error("No child is assigned to your account yet.");
      return;
    }
    setAction(type);
    setActiveChild(data.children[0]);
  };
  const resolveAction = async (interventionId: string, childName: string) => {
    try {
      await resolveIntervention(interventionId);
      toast.success(`${childName}'s intervention was resolved.`);
      await reload();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Unable to resolve the intervention.");
    }
  };

  return (
    <AppShell role="asha">
      <div className="min-w-0 space-y-6 sm:space-y-8 lg:space-y-10">
        {/* SECTION 1: ASHA HERO & QUICK METRICS ROW */}
        <section>
          <PageHero 
            eyebrow="ASHA dashboard" 
            title="Your follow-up plan is ready." 
            detail="Start with the children who need a call, a reminder, or a home visit today." 
            image={assets.ashaCare} 
            action={
              <div className="flex flex-wrap items-center gap-2.5">
                <button type="button" onClick={() => scrollTo("asha-queue")} className="secondary-button border-white/20 bg-white/10 text-white text-xs py-2 px-3.5 hover:bg-white/20">
                  Review risk queue <ChevronRight className={iconClass} />
                </button>
              </div>
            } 
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {data?.demoDataPresent && <DemoDataBadge />}
            <DashboardNotice
              loading={loading}
              error={error}
              empty={!loading && !error && (data?.children.length ?? 0) === 0}
              emptyMessage="No children are assigned to this ASHA account yet."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 mt-5">
            <StatCard icon={UsersRound} label="Total children" value={metricValue(data?.summary.totalChildren ?? 0)} description="Assigned to your account" tone="navy" />
            <StatCard icon={CheckCircle2} label="Vaccinated this month" value={metricValue(data?.summary.vaccinatedThisMonth ?? 0)} description="Doses recorded this month" tone="teal" />
            <StatCard icon={Calendar} label="Pending" value={metricValue(data?.summary.pending ?? 0)} description="Upcoming doses" tone="blue" />
            <StatCard icon={AlertTriangle} label="Overdue" value={metricValue(data?.summary.overdue ?? 0)} description="Past due, not yet given" tone="red" />
            <StatCard icon={ShieldAlert} label="High risk" value={metricValue(data?.summary.highRisk ?? 0)} description="Latest stored prediction" tone="amber" />
          </div>
        </section>

        {/* SECTION 2: ONBOARDING & DAILY CHECKLISTS */}
        <section className="surface-card min-w-0 p-4 sm:p-5 lg:p-8 border border-emerald-100/80 bg-white shadow-md shadow-emerald-950/5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <SectionHeading eyebrow="First-time setup" title="Frontline Onboarding & Daily Checklists" detail="Quick links for area setup, risk review, and vaccine recording." />
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-extrabold text-emerald-800 self-start sm:self-auto">Setup checklist</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-teal-100 bg-teal-50/60 p-4 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <MapPin className="h-5 w-5 text-teal" />
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </div>
              <h3 className="mt-3 font-display text-lg font-extrabold text-ink">Set up area</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Confirm Area ID, district, taluka, and village.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/asha/area-registration" className="secondary-button text-xs flex-1 py-2 px-3">Review area</Link>
              </div>
            </article>
            <article className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </div>
              <h3 className="mt-3 font-display text-lg font-extrabold text-ink">Review high risk</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Open risk queue to prioritize overdue children.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => scrollTo("asha-queue")} className="secondary-button text-xs flex-1 py-2 px-3">Review queue</button>
              </div>
            </article>
            <article className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <ClipboardCheck className="h-5 w-5 text-blue-700" />
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </div>
              <h3 className="mt-3 font-display text-lg font-extrabold text-ink">Record vaccine</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Find child ID and record completed dose.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/asha/vaccination-entry" className="secondary-button text-xs flex-1 py-2 px-3">Record dose</Link>
              </div>
            </article>
          </div>
        </section>

        {/* SECTION 3: HIGH-RISK QUEUE & VILLAGE CAPACITY TABLE */}
        <section id="asha-queue" className="scroll-mt-28 surface-card min-w-0 p-4 sm:p-5 lg:p-8 border border-emerald-100/80 bg-white shadow-md shadow-emerald-950/5">
          <SectionHeading 
            eyebrow="Today’s Priority Queue" 
            title="High-Risk Queue & Village Capacity" 
            detail="Sorted by the stored ML priority score for your assigned children."
            action={<Link href="/asha/risk-dashboard" className="secondary-button text-xs py-2 px-3.5">Review full queue</Link>} 
          />
          <div className="table-wrap mt-4">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Child</th>
                    <th>Next dose</th>
                    <th>Risk</th>
                    <th>Overdue</th>
                    <th>Priority</th>
                    <th>Key Risk Reasons</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && urgent.length === 0 && (
                    <tr><td colSpan={7} className="py-6 text-center text-slate-500">No high-risk or overdue children in your assigned queue.</td></tr>
                  )}
                  {urgent.map((child) => (
                    <tr key={child.childId}>
                      <td>
                        <p className="font-bold text-ink">{child.childName}</p>
                        <p className="text-xs text-slate-400">{child.childId} · {child.village || "—"}</p>
                      </td>
                      <td>
                        {child.nextVaccine}
                        <p className="text-xs text-slate-400">{child.nextDueDate}</p>
                      </td>
                      <td><RiskBadge risk={child.riskLevel ?? "Normal"} /></td>
                      <td>
                        {child.daysOverdue ? (
                          <span className="font-bold text-red-700">{child.daysOverdue} days</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span className="font-display font-extrabold text-ink">{child.priorityScore.toFixed(1)}</span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {child.risk_reasons.slice(0, 2).map((reason: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                              {reason}
                            </span>
                          ))}
                          {child.risk_reasons.length === 0 && <span className="text-xs text-slate-500">No risk reasons returned by the prediction.</span>}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => begin(child, "call")} className="secondary-button min-h-9 px-3 py-1.5 text-xs" title="Call Parent">
                            <Phone className={iconClass} />
                          </button>
                          <button 
                            onClick={() => begin(child, child.riskLevel === "High" ? "reminder" : "followup")} 
                            className={child.riskLevel === "High" ? "danger-button min-h-9 px-3 py-1.5 text-xs" : "primary-button min-h-9 px-3 py-1.5 text-xs"}
                            title="Take Action"
                          >
                            {child.riskLevel === "High" ? <Send className={iconClass} /> : <Calendar className={iconClass} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 4: ACTION & INTERVENTION LOGS */}
        <section className="surface-card min-w-0 p-4 sm:p-5 lg:p-8 border border-emerald-100/80 bg-white shadow-md shadow-emerald-950/5">
          <SectionHeading 
            eyebrow="Frontline Operations" 
            title="Action & Intervention Logs" 
            detail="Record and manage calls, reminders, home visits, and follow-ups." 
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 my-5">
            {[
              { type: "call", label: "Call parent", icon: Phone },
              { type: "reminder", label: "Record reminder", icon: Send },
              { type: "visit", label: "Home visit", icon: Home },
              { type: "followup", label: "Schedule follow-up", icon: CalendarClock },
            ].map(({ type, label, icon: Icon }) => (
              <button key={type} onClick={() => beginGeneric(type as ActionType)} className="card-lift surface-card flex items-center gap-4 p-5 text-left transition hover:border-teal">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-display text-base font-extrabold text-ink">{label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Record frontline action</span>
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 mt-8">
            <h3 className="font-display text-lg font-extrabold text-ink">Intervention History</h3>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="field-control max-w-44 text-xs">
              <option>All</option>
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Resolved</option>
            </select>
          </div>

          <div className="table-wrap">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Child</th>
                    <th>Intervention</th>
                    <th>Date</th>
                    <th>Note</th>
                    <th>Status</th>
                    <th>Resolve</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && filteredInterventions.length === 0 && (
                    <tr><td colSpan={6} className="py-6 text-center text-slate-500">No intervention records match this filter.</td></tr>
                  )}
                  {filteredInterventions.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <p className="font-bold text-ink">{record.childName}</p>
                        <p className="text-xs text-slate-400">{record.childId}</p>
                      </td>
                      <td className="capitalize">{record.type.replace("_", " ")}</td>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td className="max-w-80">{record.note}</td>
                      <td><StatusBadge status={record.status} /></td>
                      <td>
                        {record.status.toLowerCase() === "resolved" ? (
                          <span className="text-xs text-slate-400">Resolved</span>
                        ) : (
                          <button onClick={() => void resolveAction(record.id, record.childName)} className="secondary-button min-h-8 px-3 py-1 text-xs">
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {activeChild && <ActionModal child={activeChild} type={action} onClose={() => setActiveChild(null)} onSaved={reload} />}
    </AppShell>
  );
}

export function AshaAreaRegistration() { const [saved, setSaved] = useState(false); const [, setLocation] = useLocation(); return <AppShell role="asha"><PageHero eyebrow="Area management" title="Register an operational area" detail="An Area ID creates the geographical association between ASHA workers, parents, and child vaccination records." image={assets.ashaCare} /><div className="grid gap-6 xl:grid-cols-[1fr_.7fr]"><form onSubmit={(event) => { event.preventDefault(); setSaved(true); toast.success("Area registration saved for the prototype."); }} className="surface-card p-6"><SectionHeading title="Area details" detail="Use the Area ID as the durable public-health location reference." /><div className="grid gap-5 md:grid-cols-2"><label className="field-label">Area ID<input className="field-control" defaultValue="AREA-MH-PUNE-001" /></label><label className="field-label">Area type<select className="field-control"><option>Gram Panchayat</option><option>Village</option><option>Taluka</option><option>Municipal Area / Nagar</option><option>Other local administrative unit</option></select></label><label className="field-label">State<input className="field-control" defaultValue="Maharashtra" /></label><label className="field-label">District<input className="field-control" defaultValue="Pune" /></label><label className="field-label">Taluka<input className="field-control" defaultValue="Haveli" /></label><label className="field-label">Village<input className="field-control" defaultValue="Wagholi" /></label><label className="field-label">PIN code<input className="field-control" defaultValue="412207" /></label></div><button className="primary-button mt-7">Save area registration</button>{saved && <section className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" /><div><p className="font-display text-lg font-extrabold text-emerald-950">Area setup complete</p><p className="mt-1 text-sm leading-6 text-emerald-900/75">AREA-MH-PUNE-001 is now linked to your ASHA account. You can begin with the guided onboarding checklist.</p><button type="button" onClick={() => setLocation("/asha/dashboard")} className="primary-button mt-4">Open ASHA dashboard <ArrowRight className={iconClass} /></button></div></div></section>}</form><aside className="surface-card p-6"><MapPin className="h-7 w-7 text-teal" /><h2 className="mt-4 font-display text-2xl font-extrabold text-ink">One location, one care network</h2><p className="mt-3 text-sm leading-6 text-slate-500">Each area can coordinate multiple ASHA workers and their assigned child records. This layout is ready to connect to the future Areas API.</p><div className="mt-6 space-y-3">{areas.map((area) => <div key={area.areaId} className="rounded-xl bg-slate-50 p-3"><p className="font-bold text-ink">{area.name}</p><p className="mt-1 text-xs text-slate-500">{area.areaId} · {area.district}</p></div>)}</div></aside></div></AppShell>; }

export function AshaRegister() { const [, setLocation] = useLocation(); const [otp, setOtp] = useState(false); return <AppShell role="asha"><PageHero eyebrow="Worker account" title="Create an ASHA worker profile" detail="Your Area ID determines which child records are visible in the frontline workspace." image={assets.ashaCare} /><form onSubmit={(event) => { event.preventDefault(); if (!otp) { toast.error("Verify the mobile number first."); return; } toast.success("ASHA worker registered. Complete Area Registration next."); setLocation("/asha/area-registration"); }} className="surface-card mx-auto max-w-3xl p-6"><div className="grid gap-5 md:grid-cols-2"><label className="field-label">ASHA worker ID<input className="field-control" defaultValue="ASHA-PUN-08" /></label><label className="field-label">ASHA worker name<input className="field-control" defaultValue="Savitri Patil" /></label><label className="field-label">Mobile number<input className="field-control" defaultValue="+91 90000 10008" /></label><label className="field-label">Area ID<select className="field-control" defaultValue="AREA-PUN-012">{areas.map((area) => <option key={area.areaId}>{area.areaId}</option>)}</select></label><label className="field-label">OTP<div className="flex gap-2"><input className="field-control" placeholder="Enter OTP" /><button type="button" onClick={() => { setOtp(true); toast.success("OTP verified."); }} className="secondary-button shrink-0">{otp ? "Verified" : "Verify"}</button></div></label><label className="field-label">Password<input className="field-control" type="password" defaultValue="vaxicare" /></label></div><button className="primary-button mt-7">Register ASHA worker <ArrowRight className={iconClass} /></button></form></AppShell>; }

export function AshaVaccinationEntry() {
  const [childId, setChildId] = useState("CH1004");
  const [found, setFound] = useState<ChildRecord | null>(primaryChild);
  const [saving, setSaving] = useState(false);
  const [vaccinationDate, setVaccinationDate] = useState("2026-08-22");
  const [nextDueDate, setNextDueDate] = useState("2026-09-29");

  const fetchChild = () => {
    const match = children.find((child) => child.childId.toLowerCase() === childId.toLowerCase());
    setFound(match ?? null);
    if (match) toast.success(`${match.childName}'s profile is ready.`);
    else toast.error("No child record found in the database.");
  };

  const submit = async () => {
    setSaving(true);
    const result = await vaccinationService.submitVaccination();
    setSaving(false);
    toast.success(result.message);
  };

  return (
    <AppShell role="asha">
      <PageHero eyebrow="Vaccination entry" title="Record a completed dose" detail="Search by Child ID, confirm profile, and submit completed vaccination details." image={assets.ashaCare} />
      <div className="grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
        <section className="surface-card p-6">
          <SectionHeading title="1. Find the child" detail="Child ID is the primary record key." />
          <div className="flex gap-2">
            <input value={childId} onChange={(event) => setChildId(event.target.value)} className="field-control" placeholder="e.g. CH1004" />
            <button onClick={fetchChild} className="primary-button"><Search className={iconClass} />Fetch</button>
          </div>
          {found ? (
            <div className="mt-6 rounded-2xl bg-teal-50 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal text-white"><UserRound className={iconClass} /></div>
                <div>
                  <p className="font-bold text-ink">{found.childName}</p>
                  <p className="text-xs text-slate-500">{found.childId} · {found.age}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <p><span className="text-slate-500">Last dose</span><br /><strong>{found.lastVaccine || "None"}</strong></p>
                <p><span className="text-slate-500">Current risk</span><br /><RiskBadge risk={found.riskLevel} /></p>
              </div>
            </div>
          ) : (
            <EmptyState title="No child loaded" detail="Enter a valid Child ID to fetch the child profile." />
          )}
        </section>

        <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="surface-card p-6">
          <SectionHeading title="2. Enter vaccination details" detail="Directly connected to the backend vaccination service." />
          <div className="grid gap-5 md:grid-cols-2">
            <label className="field-label">Child name<input className="field-control" value={found?.childName ?? ""} readOnly /></label>
            <label className="field-label">ASHA ID<input className="field-control" value={ashaProfile.ashaId || "ASHA-PUN-08"} readOnly /></label>
            <label className="field-label">Vaccine name<select className="field-control"><option>Penta-2</option><option>OPV-3</option><option>MR-1</option></select></label>
            <label className="field-label">Dose number<select className="field-control"><option>Dose 2</option><option>Dose 3</option><option>Dose 1</option></select></label>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vaccination date</label>
              <DatePicker value={vaccinationDate} onChange={setVaccinationDate} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Next vaccination due date</label>
              <DatePicker value={nextDueDate} onChange={setNextDueDate} />
            </div>
            <label className="field-label">Vaccination status<select className="field-control"><option>Completed</option><option>Pending</option><option>Missed</option></select></label>
            <label className="field-label">Remarks<input className="field-control" placeholder="Optional notes" /></label>
          </div>
          <button disabled={!found || saving} className="primary-button mt-7">
            {saving ? "Saving vaccination..." : "Submit vaccination"}
            <Check className={iconClass} />
          </button>
        </form>
      </div>
    </AppShell>
  );
}

function MiniVaccinationTable({ rows }: { rows: any[] }) {
  return (
    <div className="table-wrap">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vaccine</th>
              <th>Dose</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  No vaccination entries found.
                </td>
              </tr>
            ) : (
              rows.map((record, index) => (
                <tr key={record.id || index}>
                  <td className="font-bold text-ink">{record.vaccine}</td>
                  <td>{record.dose}</td>
                  <td>{record.date || record.recordedAt || "—"}</td>
                  <td>
                    <StatusBadge status={record.status || "Completed"} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AshaVaccinationHistory() {
  const [query, setQuery] = useState("");
  const rows = vaccinationRecords.filter((record) =>
    `${record.vaccine} ${record.dose}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <AppShell role="asha">
      <PageHero
        eyebrow="Vaccination history"
        title="Recorded doses in your area"
        detail="Search and review immunisation logs."
        image={assets.ashaCare}
      />
      <section className="surface-card p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            title="Recent vaccination entries"
            detail="Historical vaccination records."
          />
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="field-control pl-9"
              placeholder="Search vaccine or dose"
            />
          </div>
        </div>
        <MiniVaccinationTable rows={rows} />
      </section>
    </AppShell>
  );
}

export function AshaProfile() { return <AppShell role="asha"><PageHero eyebrow="ASHA profile" title="Your frontline care identity" detail="The location and service information associated with your account and assigned child records." image={assets.ashaCare} /><div className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]"><section className="surface-card p-6"><div className="grid h-20 w-20 place-items-center rounded-3xl bg-teal text-2xl font-black text-white">SP</div><h2 className="mt-5 font-display text-2xl font-extrabold text-ink">{ashaProfile.name}</h2><p className="mt-1 text-sm text-slate-500">{ashaProfile.ashaId} · Email verified</p><div className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm"><p className="font-bold text-teal">{ashaProfile.area.name}</p><p className="mt-1 text-teal/70">{ashaProfile.area.areaId}</p></div></section><section className="surface-card p-6"><SectionHeading title="Account and area information" detail="These fields will be sourced from the ASHA and Area APIs when the backend connects." /><div className="grid gap-x-10 gap-y-5 md:grid-cols-2"><InfoBlock label="ASHA Worker ID" value={ashaProfile.ashaId} edit={false} /><InfoBlock label="Email address" value={ashaProfile.email} edit={false} /><InfoBlock label="Area ID" value={ashaProfile.area.areaId} edit={false} /><InfoBlock label="District" value={ashaProfile.area.district} edit={false} /><InfoBlock label="Taluka" value={ashaProfile.area.taluka} edit={false} /><InfoBlock label="Village" value={ashaProfile.area.village} edit={false} /></div><div className="mt-8 grid gap-3 sm:grid-cols-4"><SmallMetric label="Assigned children" value={ashaProfile.children} /><SmallMetric label="Vaccinations" value={ashaProfile.vaccinations} /><SmallMetric label="Home visits" value={ashaProfile.visits} /><SmallMetric label="Interventions" value={ashaProfile.interventions} /></div></section></div></AppShell>; }
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
