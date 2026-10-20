import { Link, useLocation } from "wouter";
import { Bell, ClipboardPlus, HeartPulse, Home, LayoutDashboard, LogOut, ShieldAlert, UserRound, UsersRound, BarChart3 } from "lucide-react";
import type { Role } from "@/types";
import { BrandMark } from "@/components/BrandMark";

const parentNav = [
  { href: "/parent/dashboard", label: "Overview", icon: Home },
  { href: "/parent/child-registration", label: "Register child", icon: ClipboardPlus },
  { href: "/parent/vaccination", label: "Vaccination", icon: HeartPulse },
  { href: "/parent/reminders", label: "Reminders", icon: Bell },
];

const ashaNav = [
  { href: "/asha/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/asha/risk-dashboard", label: "Risk queue", icon: ShieldAlert },
  { href: "/asha/interventions", label: "Actions", icon: UsersRound },
  { href: "/asha/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/asha/profile", label: "Profile", icon: UserRound },
];

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const nav = role === "parent" ? parentNav : ashaNav;
  const portalLabel = role === "parent" ? "Parent care" : "ASHA care";
  const logout = () => setLocation("/login");

  return (
    <div className="min-h-screen bg-mist flex flex-col">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/92 px-3 backdrop-blur-xl sm:h-16 sm:px-4 lg:px-7">
        <div className="flex items-center gap-3">
          <BrandMark />
          <span className="hidden rounded-full bg-teal-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.13em] text-teal sm:block">
            {portalLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="secondary-button text-xs py-1.5 px-3 border-slate-200 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </header>

      <main className="page-pad min-w-0 flex-1 pb-24">{children}</main>

      <nav aria-label={`${portalLabel} navigation`} className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/96 px-1 py-2 backdrop-blur shadow-lg sm:px-2">
        <div className={`mx-auto grid items-center gap-1 ${role === "parent" ? "max-w-xl grid-cols-4" : "max-w-2xl grid-cols-5"}`}>
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[9px] font-bold transition sm:flex-row sm:justify-center sm:gap-2 sm:px-2 sm:text-xs ${
                location === href ? "bg-teal-50 text-teal shadow-xs" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
