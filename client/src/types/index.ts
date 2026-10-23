/**
 * Shared VaxiCare domain types.
 * Record shapes stay flexible while the prototype data and backend are being connected.
 */

export type Role = "parent" | "asha";

export type RiskLevel = "Normal" | "Low" | "Medium" | "High";

export type VaccinationStatus =
  | "Completed"
  | "Due"
  | "Upcoming"
  | "Overdue"
  | "Missed"
  | "Pending";

export type ChildRecord = Record<string, any>;
export type VaccinationRecord = Record<string, any>;
export type ReminderRecord = Record<string, any>;
export type InterventionRecord = Record<string, any>;
export type AreaRecord = Record<string, any>;

export type DashboardChild = {
  id: string;
  childId: string;
  childName: string;
  parentName: string;
  parentEmail: string;
  guardianPhone: string;
  dob: string;
  gender: "Female" | "Male";
  village: string;
  lastVaccine: string;
  nextVaccine: string;
  nextDueDate: string | null;
  missedDoses: number;
  daysOverdue: number;
  dropoutProbability: number;
  riskLevel: RiskLevel | null;
  priorityScore: number;
  risk_reasons: string[];
  isDemo: boolean;
  completionRate: number;
};

export type DashboardIntervention = {
  id: string;
  childId: string;
  childName: string;
  type: "call" | "reminder" | "home_visit" | "followup";
  date: string;
  note: string;
  status: string;
  resolvedAt: string | null;
  isDemo: boolean;
};

export type DashboardResponse = {
  profile: {
    id: string;
    full_name: string;
    email: string | null;
    role: Role;
  };
  summary: {
    totalChildren: number;
    vaccinatedThisMonth: number;
    pending: number;
    overdue: number;
    highRisk: number;
    completed: number;
    resolvedInterventions: number;
    totalDoses: number;
  };
  children: DashboardChild[];
  vaccinationRecords: Array<{
    id: string;
    childId: string;
    childName: string;
    vaccine: string;
    dose: string;
    date: string | null;
    dueDate: string;
    givenDate: string | null;
    status: string;
    isDemo: boolean;
  }>;
  interventions: DashboardIntervention[];
  reminderPlans: Array<{
    childId: string;
    plan: Record<string, unknown>;
    generatedAt: string;
  }>;
  analytics: {
    riskDistribution: Array<{ label: string; value: number }>;
    vaccinationDistribution: Array<{ label: string; value: number }>;
    monthlyTrend: Array<{ month: string; vaccinations: number; followUps: number }>;
    interventionDistribution: Array<{ label: string; value: number }>;
  };
  demoDataPresent: boolean;
};
