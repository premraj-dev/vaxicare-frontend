/** Verified Care Console: fictional, dashboard-ready mock data. */

import type { AreaRecord, ChildRecord, InterventionRecord, ReminderRecord, VaccinationRecord } from "@/types";

export const assets = {
  logo: "/manus-storage/vaxicare-mark_f01e3183.png",
  authCare: "/manus-storage/auth-care-panel_2c1a7de6.png",
  parentCare: "/manus-storage/parent-vaccination-illustration_f4377bc4.png",
  ashaCare: "/manus-storage/asha-outreach-illustration_5d7a59c4.png",
  texture: "/manus-storage/care-network-texture_d9fdeaf7.png",
};

export const parentProfile = {
  parentId: "",
  name: "",
  phone: "",
  verified: false,
  childName: "",
  childId: "",
  dob: "",
  age: "",
  gender: "",
  qr: "",
  address: "",
};

export const primaryChild: ChildRecord = {
  childId: "",
  childName: "",
  parentName: "",
  parentPhone: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  qrCodeId: "",
  areaId: "",
  ashaId: "",
  village: "",
  taluka: "",
  district: "",
  pinCode: "",
  lastVaccine: "",
  nextVaccine: "",
  nextDueDate: "",
  status: "Pending",
  missedDoses: 0,
  daysOverdue: 0,
  dropoutProbability: 0,
  riskLevel: "Normal",
  priorityScore: 0,
  completionRate: 0,
  risk_reasons: [],
};

export const vaccinationRecords: VaccinationRecord[] = [];

export const reminders: ReminderRecord[] = [];

export const areas: AreaRecord[] = [];

export const ashaProfile = {
  ashaId: "",
  name: "",
  phone: "",
  verified: false,
  area: { areaId: "", name: "", type: "", district: "", taluka: "", village: "", pinCode: "" },
  children: 0,
  vaccinations: 0,
  visits: 0,
  interventions: 0,
};

export const children: ChildRecord[] = [];

export const interventions: InterventionRecord[] = [];

export const coverageData = [
  { label: "Completed", value: 0, fill: "#0F766E" },
  { label: "Pending", value: 0, fill: "#3B82F6" },
  { label: "Missed", value: 0, fill: "#F59E0B" },
  { label: "Overdue", value: 0, fill: "#DC2626" },
];

export const trendData: { month: string; vaccinations: number; followUps: number }[] = [];

export const interventionData = [
  { label: "Calls", value: 0 },
  { label: "Reminders", value: 0 },
  { label: "Home visits", value: 0 },
  { label: "Follow-ups", value: 0 },
  { label: "Resolved", value: 0 },
];
