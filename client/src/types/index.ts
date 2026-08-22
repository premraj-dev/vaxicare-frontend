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
