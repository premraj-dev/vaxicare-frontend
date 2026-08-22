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
  parentId: "PAR-20984",
  name: "Priya Sharma",
  phone: "+91 90000 00000",
  verified: true,
  childName: "Aarav Sharma",
  childId: "CH1004",
  dob: "17 Feb 2025",
  age: "18 months",
  gender: "Male",
  qr: "QR-CH1004-MH",
  address: "Wagholi, Haveli, Pune, Maharashtra · 412207",
};

export const primaryChild: ChildRecord = {
  childId: "CH1004",
  childName: "Aarav Sharma",
  parentName: "Priya Sharma",
  parentPhone: "+91 90000 00000",
  dateOfBirth: "2025-02-17",
  age: "18 months",
  gender: "Male",
  qrCodeId: "QR-CH1004-MH",
  areaId: "AREA-PUN-012",
  ashaId: "ASHA-PUN-08",
  village: "Wagholi",
  taluka: "Haveli",
  district: "Pune",
  pinCode: "412207",
  lastVaccine: "Penta-1",
  nextVaccine: "Penta-2",
  nextDueDate: "29 Sep 2026",
  status: "Pending",
  missedDoses: 1,
  daysOverdue: 0,
  dropoutProbability: 0.052,
  riskLevel: "Low",
  priorityScore: 108.4,
  completionRate: 75,
};

export const vaccinationRecords: VaccinationRecord[] = [
  { id: "VAC-01", vaccine: "BCG", dose: "Dose 1", scheduledDate: "18 Feb 2025", actualDate: "18 Feb 2025", status: "Completed", daysOverdue: 0, delayHistory: 0 },
  { id: "VAC-02", vaccine: "OPV", dose: "Dose 1", scheduledDate: "18 Feb 2025", actualDate: "18 Feb 2025", status: "Completed", daysOverdue: 0, delayHistory: 0 },
  { id: "VAC-03", vaccine: "Penta", dose: "Dose 1", scheduledDate: "19 Apr 2025", actualDate: "21 Apr 2025", status: "Completed", daysOverdue: 0, delayHistory: 2 },
  { id: "VAC-04", vaccine: "Penta", dose: "Dose 2", scheduledDate: "29 Sep 2026", status: "Pending", daysOverdue: 0, delayHistory: 2 },
  { id: "VAC-05", vaccine: "OPV", dose: "Dose 2", scheduledDate: "29 Sep 2026", status: "Pending", daysOverdue: 0, delayHistory: 0 },
  { id: "VAC-06", vaccine: "MR", dose: "Dose 1", scheduledDate: "17 Feb 2027", status: "Pending", daysOverdue: 0, delayHistory: 0 },
];

export const reminders: ReminderRecord[] = [
  { id: "REM-01", childId: "CH1004", vaccine: "Penta-2", dueDate: "29 Sep 2026", reminderDate: "27 Sep 2026", riskLevel: "Low", probability: 0.052, reminderCount: 2, status: "Scheduled", message: "Aarav's Penta-2 vaccination is due in 2 days. Please visit the vaccination centre on time." },
  { id: "REM-02", childId: "CH1004", vaccine: "Penta-2", dueDate: "29 Sep 2026", reminderDate: "28 Sep 2026", riskLevel: "Low", probability: 0.052, reminderCount: 2, status: "Scheduled", message: "Aarav's Penta-2 vaccination is due tomorrow. Keep the vaccination card ready." },
  { id: "REM-03", childId: "CH1021", vaccine: "OPV-3", dueDate: "21 Aug 2026", reminderDate: "22 Aug 2026", riskLevel: "High", probability: 0.89, reminderCount: 4, status: "Immediate action", message: "Urgent: OPV-3 vaccination is overdue. Please contact your ASHA worker today." },
];

export const areas: AreaRecord[] = [
  { areaId: "AREA-PUN-012", name: "Wagholi Public Health Area", type: "Gram Panchayat", district: "Pune", taluka: "Haveli", village: "Wagholi", pinCode: "412207" },
  { areaId: "AREA-AHM-008", name: "Rahata Care Cluster", type: "Village", district: "Ahmednagar", taluka: "Rahata", village: "Sakuri", pinCode: "423107" },
  { areaId: "AREA-NAS-017", name: "Niphad Immunisation Zone", type: "Taluka", district: "Nashik", taluka: "Niphad", village: "Pimpri", pinCode: "422303" },
];

export const ashaProfile = {
  ashaId: "ASHA-PUN-08",
  name: "Savitri Patil",
  phone: "+91 90000 10008",
  verified: true,
  area: areas[0],
  children: 38,
  vaccinations: 26,
  visits: 11,
  interventions: 34,
};

export const children: ChildRecord[] = [
  primaryChild,
  { childId: "CH1057", childName: "Meera Kale", parentName: "Sunita Kale", parentPhone: "+91 90000 01057", dateOfBirth: "2024-03-12", age: "29 months", gender: "Female", qrCodeId: "QR-CH1057-MH", areaId: "AREA-AHM-008", ashaId: "ASHA-AHM-01", village: "Sakuri", taluka: "Rahata", district: "Ahmednagar", pinCode: "423107", lastVaccine: "Penta-2", nextVaccine: "Penta-3", nextDueDate: "18 Jul 2026", status: "Overdue", missedDoses: 3, daysOverdue: 33, dropoutProbability: 0.881, riskLevel: "High", priorityScore: 389.8, completionRate: 42 },
  { childId: "CH1002", childName: "Ishaan Jadhav", parentName: "Rohit Jadhav", parentPhone: "+91 90000 01002", dateOfBirth: "2024-06-08", age: "26 months", gender: "Male", qrCodeId: "QR-CH1002-MH", areaId: "AREA-PUN-012", ashaId: "ASHA-PUN-08", village: "Wagholi", taluka: "Haveli", district: "Pune", pinCode: "412207", lastVaccine: "Penta-1", nextVaccine: "Penta-2", nextDueDate: "14 Aug 2026", status: "Overdue", missedDoses: 5, daysOverdue: 10, dropoutProbability: 0.997, riskLevel: "High", priorityScore: 355, completionRate: 31 },
  { childId: "CH1084", childName: "Kabir Shinde", parentName: "Kavita Shinde", parentPhone: "+91 90000 01084", dateOfBirth: "2024-01-14", age: "31 months", gender: "Male", qrCodeId: "QR-CH1084-MH", areaId: "AREA-SOL-002", ashaId: "ASHA-SOL-01", village: "Akluj", taluka: "Malshiras", district: "Solapur", pinCode: "413101", lastVaccine: "OPV-2", nextVaccine: "OPV-3", nextDueDate: "23 Aug 2026", status: "Overdue", missedDoses: 5, daysOverdue: 1, dropoutProbability: 0.964, riskLevel: "High", priorityScore: 336.6, completionRate: 38 },
  { childId: "CH1061", childName: "Anaya More", parentName: "Madhuri More", parentPhone: "+91 90000 01061", dateOfBirth: "2024-11-04", age: "21 months", gender: "Female", qrCodeId: "QR-CH1061-MH", areaId: "AREA-AHM-019", ashaId: "ASHA-AHM-02", village: "Rahuri", taluka: "Rahuri", district: "Ahmednagar", pinCode: "413705", lastVaccine: "Penta-1", nextVaccine: "Penta-2", nextDueDate: "19 Jul 2026", status: "Overdue", missedDoses: 2, daysOverdue: 35, dropoutProbability: 0.797, riskLevel: "Medium", priorityScore: 288, completionRate: 54 },
  { childId: "CH1087", childName: "Vihaan Pawar", parentName: "Nisha Pawar", parentPhone: "+91 90000 01087", dateOfBirth: "2024-05-24", age: "27 months", gender: "Male", qrCodeId: "QR-CH1087-MH", areaId: "AREA-PUN-016", ashaId: "ASHA-PUN-04", village: "Kharadi", taluka: "Haveli", district: "Pune", pinCode: "411014", lastVaccine: "Penta-1", nextVaccine: "Penta-2", nextDueDate: "29 Jul 2026", status: "Overdue", missedDoses: 2, daysOverdue: 25, dropoutProbability: 0.892, riskLevel: "Medium", priorityScore: 268.9, completionRate: 57 },
  { childId: "CH1010", childName: "Dev Kulkarni", parentName: "Asha Kulkarni", parentPhone: "+91 90000 01010", dateOfBirth: "2025-03-05", age: "17 months", gender: "Male", qrCodeId: "QR-CH1010-MH", areaId: "AREA-AHM-001", ashaId: "ASHA-AHM-03", village: "Kopargaon", taluka: "Kopargaon", district: "Ahmednagar", pinCode: "423601", lastVaccine: "OPV-1", nextVaccine: "Penta-2", nextDueDate: "15 Oct 2026", status: "Pending", missedDoses: 0, daysOverdue: 0, dropoutProbability: 0.062, riskLevel: "Normal", priorityScore: 0.6, completionRate: 88 },
  { childId: "CH1038", childName: "Sia Patil", parentName: "Sheetal Patil", parentPhone: "+91 90000 01038", dateOfBirth: "2024-09-20", age: "23 months", gender: "Female", qrCodeId: "QR-CH1038-MH", areaId: "AREA-SAT-002", ashaId: "ASHA-SAT-08", village: "Wai", taluka: "Wai", district: "Satara", pinCode: "412803", lastVaccine: "Penta-2", nextVaccine: "Penta-3", nextDueDate: "12 Oct 2026", status: "Missed", missedDoses: 2, daysOverdue: 0, dropoutProbability: 0.301, riskLevel: "Medium", priorityScore: 213, completionRate: 62 },
  { childId: "CH1094", childName: "Arjun Shah", parentName: "Pooja Shah", parentPhone: "+91 90000 01094", dateOfBirth: "2024-02-19", age: "30 months", gender: "Male", qrCodeId: "QR-CH1094-MH", areaId: "AREA-AHM-016", ashaId: "ASHA-AHM-08", village: "Nevasa", taluka: "Nevasa", district: "Ahmednagar", pinCode: "414603", lastVaccine: "OPV-2", nextVaccine: "OPV-3", nextDueDate: "06 Oct 2026", status: "Missed", missedDoses: 2, daysOverdue: 0, dropoutProbability: 0.441, riskLevel: "Medium", priorityScore: 214.4, completionRate: 58 },
  { childId: "CH1041", childName: "Riya Bhosale", parentName: "Ritu Bhosale", parentPhone: "+91 90000 01041", dateOfBirth: "2024-07-21", age: "25 months", gender: "Female", qrCodeId: "QR-CH1041-MH", areaId: "AREA-PUN-012", ashaId: "ASHA-PUN-02", village: "Wagholi", taluka: "Haveli", district: "Pune", pinCode: "412207", lastVaccine: "Penta-2", nextVaccine: "Penta-3", nextDueDate: "10 Oct 2026", status: "Missed", missedDoses: 2, daysOverdue: 0, dropoutProbability: 0.481, riskLevel: "Medium", priorityScore: 214.8, completionRate: 60 },
];

export const interventions: InterventionRecord[] = [
  { id: "INT-01", childId: "CH1057", childName: "Meera Kale", type: "Home visit", date: "22 Aug 2026", status: "Scheduled", note: "High risk, 3 missed doses, vaccine overdue by 33 days." },
  { id: "INT-02", childId: "CH1002", childName: "Ishaan Jadhav", type: "Call parent", date: "22 Aug 2026", status: "Completed", note: "Parent asked for a follow-up tomorrow morning." },
  { id: "INT-03", childId: "CH1004", childName: "Aarav Sharma", type: "Reminder", date: "27 Sep 2026", status: "Scheduled", note: "First Low-risk reminder for Penta-2." },
  { id: "INT-04", childId: "CH1087", childName: "Vihaan Pawar", type: "Follow-up", date: "25 Aug 2026", status: "Resolved", note: "Vaccination slot confirmed with parent." },
];

export const coverageData = [
  { label: "Completed", value: 64, fill: "#0F766E" },
  { label: "Pending", value: 21, fill: "#3B82F6" },
  { label: "Missed", value: 9, fill: "#F59E0B" },
  { label: "Overdue", value: 6, fill: "#DC2626" },
];

export const trendData = [
  { month: "Mar", vaccinations: 14, followUps: 5 },
  { month: "Apr", vaccinations: 18, followUps: 7 },
  { month: "May", vaccinations: 21, followUps: 8 },
  { month: "Jun", vaccinations: 16, followUps: 9 },
  { month: "Jul", vaccinations: 24, followUps: 12 },
  { month: "Aug", vaccinations: 26, followUps: 15 },
];

export const interventionData = [
  { label: "Calls", value: 28 },
  { label: "Reminders", value: 61 },
  { label: "Home visits", value: 11 },
  { label: "Follow-ups", value: 22 },
  { label: "Resolved", value: 34 },
];
