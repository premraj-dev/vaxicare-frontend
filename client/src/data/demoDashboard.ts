import type { DashboardChild, DashboardIntervention, DashboardResponse } from "@/types";

const FIRST_NAMES = [
  "Aarav", "Anaya", "Vedant", "Gauri", "Atharv", "Sai", "Om", "Saanvi",
  "Vihaan", "Isha", "Shaurya", "Mukta", "Samarth", "Janhavi", "Yash", "Prajakta",
  "Tanvi", "Rohan", "Kavya", "Aditya", "Mrunal", "Swara", "Neel", "Radhika",
  "Arnav", "Shruti", "Abhijeet", "Deepali", "Ojas", "Madhuri", "Siddharth",
  "Aarya", "Nikhil", "Sayali", "Pranav", "Revati", "Chaitanya",
] as const;

const SURNAMES = [
  "Umap", "Pawar", "Ingawale", "Khaldakar", "More", "Jadhav",
  "Shinde", "Gaikwad", "Kale", "Bhosale",
] as const;

const AGE_MONTHS = [
  60, 48, 42, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12,
  13, 15, 16, 17, 18, 19, 20, 0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11,
] as const;

const VACCINE_SCHEDULE = [
  ["BCG", 0],
  ["OPV-0", 0],
  ["Hepatitis B (birth dose)", 0],
  ["OPV-1", 42],
  ["Pentavalent-1", 42],
  ["Rotavirus-1", 42],
  ["fIPV-1", 42],
  ["PCV-1", 42],
  ["OPV-2", 70],
  ["Pentavalent-2", 70],
  ["Rotavirus-2", 70],
  ["OPV-3", 98],
  ["Pentavalent-3", 98],
  ["Rotavirus-3", 98],
  ["fIPV-2", 98],
  ["PCV-2", 98],
  ["MR-1", 270],
  ["PCV booster", 270],
  ["MR-2", 480],
  ["DPT booster-1", 480],
  ["OPV booster", 480],
  ["DPT booster-2", 1825],
] as const;

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function subtractMonths(months: number): string {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - months);
  return dateOnly(date);
}

function datePlusDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return dateOnly(result);
}

function makeChild(index: number): DashboardChild {
  const ageMonths = AGE_MONTHS[index];
  const dateOfBirth = subtractMonths(ageMonths);
  const missedDoses = index < 3 ? 3 : index < 7 ? 2 : index < 30 ? 1 : 0;
  const riskLevel = index < 8 ? "High" : index < 20 ? "Medium" : "Low";
  const nextDose = VACCINE_SCHEDULE
    .map(([vaccine, ageDays]) => ({ vaccine, ageDays, dueDate: datePlusDays(dateOfBirth, ageDays) }))
    .find((dose) => dose.dueDate >= dateOnly(new Date()));

  return {
    id: `demo-child-${String(index + 1).padStart(2, "0")}`,
    childId: `DEMO-CH-${String(index + 1).padStart(3, "0")}`,
    childName: `${FIRST_NAMES[index]} ${SURNAMES[index % SURNAMES.length]}`,
    parentName: `Demo Guardian ${String(index + 1).padStart(2, "0")}`,
    parentEmail: `guardian${String(index + 1).padStart(2, "0")}@example.test`,
    guardianPhone: `90000000${String(index + 11).padStart(2, "0")}`,
    dob: dateOfBirth,
    gender: index % 2 === 0 ? "Male" : "Female",
    village: "Jategaon Bk",
    lastVaccine: VACCINE_SCHEDULE[Math.max(0, Math.min(index % 15, VACCINE_SCHEDULE.length - 1))][0],
    nextVaccine: nextDose?.vaccine ?? "Schedule complete",
    nextDueDate: nextDose?.dueDate ?? null,
    missedDoses,
    daysOverdue: missedDoses ? (index % 12) + 1 : 0,
    dropoutProbability: riskLevel === "High" ? 0.78 - (index % 3) * 0.04 : riskLevel === "Medium" ? 0.48 - (index % 4) * 0.03 : 0.18 - (index % 4) * 0.02,
    riskLevel,
    priorityScore: riskLevel === "High" ? 90 - index : riskLevel === "Medium" ? 65 - index : 35 - index / 2,
    risk_reasons: missedDoses
      ? [`${missedDoses} missed or overdue dose${missedDoses === 1 ? "" : "s"}`, "Follow-up recommended"]
      : ["Vaccination schedule on track"],
    isDemo: true,
    completionRate: Math.max(0, Math.min(100, 100 - missedDoses * 20 - (index % 3) * 5)),
  };
}

const demoChildren = FIRST_NAMES.map((_, index) => makeChild(index));
const now = dateOnly(new Date());

const demoVaccinationRecords: DashboardResponse["vaccinationRecords"] = demoChildren.flatMap((child, childIndex) => {
  const ageDays = AGE_MONTHS[childIndex] * 30;
  const dueDoses = VACCINE_SCHEDULE
    .map(([vaccine, dueAgeDays], doseIndex) => ({ vaccine, dueAgeDays, doseIndex }))
    .filter((dose) => dose.dueAgeDays <= ageDays);
  const missedCount = child.missedDoses;
  const missedIndexes = new Set(dueDoses.slice(-missedCount).map((dose) => dose.doseIndex));
  return VACCINE_SCHEDULE.map(([vaccine, dueAgeDays], doseIndex) => {
    const dueDate = datePlusDays(child.dob, dueAgeDays);
    const completed = dueDate <= now && !missedIndexes.has(doseIndex);
    return {
      id: `demo-record-${child.id}-${doseIndex}`,
      childId: child.id,
      childName: child.childName,
      vaccine,
      dose: String(doseIndex + 1),
      date: completed ? datePlusDays(dueDate, (childIndex + doseIndex) % 8) : null,
      dueDate,
      givenDate: completed ? datePlusDays(dueDate, (childIndex + doseIndex) % 8) : null,
      status: completed ? "Completed" : dueDate < now ? "Overdue" : "Upcoming",
      isDemo: true,
    };
  });
});

const demoInterventions: DashboardIntervention[] = [
  { id: "demo-intervention-1", childId: demoChildren[0].id, childName: demoChildren[0].childName, type: "call", date: now, note: "Guardian contacted; vaccine visit discussed.", status: "scheduled", resolvedAt: null, isDemo: true },
  { id: "demo-intervention-2", childId: demoChildren[1].id, childName: demoChildren[1].childName, type: "home_visit", date: now, note: "Home visit planned for catch-up vaccination.", status: "scheduled", resolvedAt: null, isDemo: true },
  { id: "demo-intervention-3", childId: demoChildren[2].id, childName: demoChildren[2].childName, type: "reminder", date: now, note: "Reminder shared with guardian.", status: "resolved", resolvedAt: now, isDemo: true },
  { id: "demo-intervention-4", childId: demoChildren[8].id, childName: demoChildren[8].childName, type: "followup", date: now, note: "Routine follow-up completed.", status: "resolved", resolvedAt: now, isDemo: true },
];

const riskDistribution = [
  { label: "High", value: 8 },
  { label: "Medium", value: 12 },
  { label: "Low", value: 17 },
];

export const DEMO_ASHA_DASHBOARD: DashboardResponse = {
  profile: { id: "demo-asha-profile", full_name: "Savita Patil", email: "asha.demo@example.test", role: "asha" },
  summary: {
    totalChildren: 37,
    vaccinatedThisMonth: 14,
    pending: demoVaccinationRecords.filter((record) => record.status === "Upcoming").length,
    overdue: demoVaccinationRecords.filter((record) => record.status === "Overdue").length,
    highRisk: 8,
    completed: demoVaccinationRecords.filter((record) => record.status === "Completed").length,
    resolvedInterventions: demoInterventions.filter((record) => record.status === "resolved").length,
    totalDoses: demoVaccinationRecords.length,
  },
  children: demoChildren,
  vaccinationRecords: demoVaccinationRecords,
  interventions: demoInterventions,
  reminderPlans: [],
  analytics: {
    riskDistribution,
    vaccinationDistribution: [
      { label: "Completed", value: demoVaccinationRecords.filter((record) => record.status === "Completed").length },
      { label: "Pending", value: demoVaccinationRecords.filter((record) => record.status === "Upcoming").length },
      { label: "Missed", value: demoVaccinationRecords.filter((record) => record.status === "Overdue").length },
      { label: "Overdue", value: demoVaccinationRecords.filter((record) => record.status === "Overdue").length },
    ],
    monthlyTrend: [
      { month: "May", vaccinations: 18, followUps: 9 },
      { month: "Jun", vaccinations: 22, followUps: 12 },
      { month: "Jul", vaccinations: 16, followUps: 11 },
      { month: "Aug", vaccinations: 25, followUps: 15 },
      { month: "Sep", vaccinations: 21, followUps: 13 },
      { month: "Oct", vaccinations: 14, followUps: 10 },
    ],
    interventionDistribution: [
      { label: "Calls", value: 12 },
      { label: "Reminders", value: 18 },
      { label: "Home visits", value: 9 },
      { label: "Follow-ups", value: 7 },
      { label: "Resolved", value: 31 },
    ],
  },
  demoDataPresent: true,
};

export const DEMO_PARENT_DASHBOARD: DashboardResponse = {
  ...DEMO_ASHA_DASHBOARD,
  profile: { id: "demo-parent-profile", full_name: "Demo Parent", email: "parent.demo@example.test", role: "parent" },
  summary: {
    totalChildren: 1,
    vaccinatedThisMonth: 0,
    pending: 0,
    overdue: 0,
    highRisk: 0,
    completed: 0,
    resolvedInterventions: 0,
    totalDoses: 0,
  },
  children: [{
    ...demoChildren[13],
    id: "demo-parent-aarav",
    childId: "DEMO-AARAV",
    childName: "Aarav Umap",
    parentName: "Demo Parent",
    parentEmail: "parent.demo@example.test",
    guardianPhone: "9000000000",
    dob: subtractMonths(6),
    gender: "Male",
    village: "Jategaon Bk",
    lastVaccine: "Pentavalent-2",
    nextVaccine: "Pentavalent-3",
    nextDueDate: datePlusDays(subtractMonths(6), 98),
    riskLevel: "Low",
    missedDoses: 0,
    daysOverdue: 0,
    priorityScore: 20,
    risk_reasons: ["Vaccination schedule on track"],
    completionRate: 45,
  }],
  vaccinationRecords: [],
  interventions: [],
  reminderPlans: [],
};

export const DEMO_COMMUNITY_RISK_COUNTS = { high: 8, medium: 12, low: 17 } as const;
