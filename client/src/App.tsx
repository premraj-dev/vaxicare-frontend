/** Verified Care Console: role-gated route map for parent and ASHA workflows. */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AshaAnalytics, AshaAreaRegistration, AshaDashboard, AshaInterventions, AshaProfile, AshaRegister, AshaRiskDashboard, AshaVaccinationEntry, AshaVaccinationHistory, LoginPage, NotFoundPage, ParentDashboard, ParentProfile, ParentRegistration, ParentReminders, ParentVaccination } from "./pages/PortalPages";


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
      <Route path="/parent/dashboard" component={ParentDashboard} />
      <Route path="/parent/child-registration" component={ParentRegistration} />
      <Route path="/parent/profile" component={ParentProfile} />
      <Route path="/parent/vaccination" component={ParentVaccination} />
      <Route path="/parent/reminders" component={ParentReminders} />
      <Route path="/asha/dashboard" component={AshaDashboard} />
      <Route path="/asha/area-registration" component={AshaAreaRegistration} />
      <Route path="/asha/register" component={AshaRegister} />
      <Route path="/asha/vaccination-entry" component={AshaVaccinationEntry} />
      <Route path="/asha/vaccination-history" component={AshaVaccinationHistory} />
      <Route path="/asha/risk-dashboard" component={AshaRiskDashboard} />
      <Route path="/asha/interventions" component={AshaInterventions} />
      <Route path="/asha/analytics" component={AshaAnalytics} />
      <Route path="/asha/profile" component={AshaProfile} />
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
