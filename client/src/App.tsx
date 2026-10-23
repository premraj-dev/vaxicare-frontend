/** Verified Care Console: role-gated route map for parent and ASHA workflows. */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AshaAreaRegistration, AshaRegister, AshaVaccinationEntry, AshaVaccinationHistory, LoginPage, NotFoundPage } from "./pages/PortalPages";
import { AshaAnalytics, AshaInterventions, AshaRiskDashboard } from "./pages/LiveDashboardPages";
import { AshaDashboard, AshaProfile, ParentDashboard, ParentProfile, ParentReminders, ParentVaccination } from "./pages/PortalDashboardPages";

function getStoredUserProfile(): { role?: string } | null {
  if (typeof window === "undefined") return null;
  const profileJson = window.localStorage.getItem("user_profile");
  if (!profileJson) return null;

  try {
    return JSON.parse(profileJson) as { role?: string };
  } catch {
    return null;
  }
}

function getResolvedRole(role?: string): "parent" | "asha" | null {
  const normalizedRole = role === "asha worker" ? "asha" : role;
  if (normalizedRole === "parent") return "parent";
  if (normalizedRole === "asha") return "asha";
  return null;
}

function getRouteForRole(role?: string | null): string {
  const resolvedRole = getResolvedRole(role ?? undefined);
  if (resolvedRole === "parent") return "/parent/dashboard";
  if (resolvedRole === "asha") return "/asha/dashboard";
  return "/login";
}

function ProtectedRoute({ role, component: Component }: { role: "parent" | "asha"; component: React.ComponentType }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const accessToken = typeof window !== "undefined" ? window.localStorage.getItem("access_token") : null;
    const profile = getStoredUserProfile();
    const resolvedRole = getResolvedRole(profile?.role);

    if (!accessToken || !profile || resolvedRole !== role) {
      setLocation(getRouteForRole(resolvedRole));
    }
  }, [role, setLocation]);

  const profile = getStoredUserProfile();
  const resolvedRole = getResolvedRole(profile?.role);

  if (!profile || !profile.role || resolvedRole !== role) {
    return null;
  }

  return <Component />;
}

function RedirectToLogin() {
  const [, setLocation] = useLocation();
  useEffect(() => setLocation("/login"), [setLocation]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RedirectToLogin} />
      <Route path="/login" component={LoginPage} />
      <Route path="/parent/dashboard" component={() => <ProtectedRoute role="parent" component={ParentDashboard} />} />
      <Route path="/parent/profile" component={() => <ProtectedRoute role="parent" component={ParentProfile} />} />
      <Route path="/parent/vaccination" component={() => <ProtectedRoute role="parent" component={ParentVaccination} />} />
      <Route path="/parent/reminders" component={() => <ProtectedRoute role="parent" component={ParentReminders} />} />
      <Route path="/asha/dashboard" component={() => <ProtectedRoute role="asha" component={AshaDashboard} />} />
      <Route path="/asha/area-registration" component={() => <ProtectedRoute role="asha" component={AshaAreaRegistration} />} />
      <Route path="/asha/register" component={() => <ProtectedRoute role="asha" component={AshaRegister} />} />
      <Route path="/asha/vaccination-entry" component={() => <ProtectedRoute role="asha" component={AshaVaccinationEntry} />} />
      <Route path="/asha/vaccination-history" component={() => <ProtectedRoute role="asha" component={AshaVaccinationHistory} />} />
      <Route path="/asha/risk-dashboard" component={() => <ProtectedRoute role="asha" component={AshaRiskDashboard} />} />
      <Route path="/asha/interventions" component={() => <ProtectedRoute role="asha" component={AshaInterventions} />} />
      <Route path="/asha/analytics" component={() => <ProtectedRoute role="asha" component={AshaAnalytics} />} />
      <Route path="/asha/profile" component={() => <ProtectedRoute role="asha" component={AshaProfile} />} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
