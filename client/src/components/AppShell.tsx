/** Verified Care Console: simplified role-first shell with brand header, logout, and persistent bottom navigation. */

import { Link, useLocation } from "wouter";
import { Bell, ClipboardPlus, HeartPulse, Home, LayoutDashboard, LogOut, MapPinned, ShieldAlert, UsersRound } from "lucide-react";
import type { Role } from "@/types";
import { BrandMark } from "@/components/BrandMark";

const parentNav = [
  { href: "/parent/dashboard", label: "Overview", icon: Home },
  { href: "/parent/child-registration", label: "Register child", icon: ClipboardPlus },
  { href: "/parent/vaccination", label: "Vaccination", icon: HeartPulse },
  { href: "/parent/reminders", label: "Reminders", icon: Bell },
];

const ashaNav = [
  { href: "/asha/area-registration", label: "Area setup", icon: MapPinned },
  { href: "/asha/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/asha/vaccination-entry", label: "Record dose", icon: ClipboardPlus },
  { href: "/asha/risk-dashboard", label: "Risk queue", icon: ShieldAlert },
  { href: "/asha/interventions", label: "Actions", icon: UsersRound },
];

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const nav = role === "parent" ? parentNav : ashaNav;
  const portalLabel = role === "parent" ? "Parent care" : "ASHA care";
  const logout = () => setLocation("/login");

  return <div className="min-h-screen bg-mist"><header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/92 px-4 backdrop-blur-xl sm:px-7"><div className="flex items-center gap-3"><BrandMark /><span className="hidden rounded-full bg-teal-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.13em] text-teal sm:block">{portalLabel}</span></div><button onClick={logout} className="secondary-button border-slate-200 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"><LogOut className="h-4 w-4" />Log out</button></header><main className="page-pad pb-28">{children}</main><nav aria-label={`${portalLabel} navigation`} className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/96 px-2 py-2 backdrop-blur"><div className={`mx-auto grid items-center gap-1 ${role === "parent" ? "max-w-2xl grid-cols-4" : "max-w-3xl grid-cols-5"}`}>{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition sm:flex-row sm:justify-center sm:gap-2 sm:text-xs ${location === href ? "bg-teal-50 text-teal" : "text-slate-500 hover:bg-slate-50"}`}><Icon className="h-4 w-4" /><span className="max-w-20 truncate">{label}</span></Link>)}</div></nav></div>;
}
