﻿// Shared VaxiCare FastAPI client.
// Page components and services use this file instead of hard-coding backend URLs.

import type { DashboardResponse as AppDashboardResponse } from "@/types";
import { getSupabaseClient } from "@/lib/supabase";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");
export const AUTH_API_BASE_URL = (
  import.meta.env.VITE_AUTH_API_BASE_URL || API_BASE_URL
).replace(/\/+$/, "");

export type RiskLevel = "Normal" | "Low" | "Medium" | "High";

export type BackendHealth = {
  status: string;
  service?: string;
  version?: string;
};

export type SendRegistrationEmailResponse = {
  sent: boolean;
};

export type PredictionRequest = {
  gender: "Female" | "Male";
  vaccine_name:
    | "MR-1"
    | "MR-2"
    | "OPV-1"
    | "OPV-2"
    | "OPV-3"
    | "Penta-1"
    | "Penta-2"
    | "Penta-3";
  dose_number: number;
  age_months: number;
  previous_doses_received: number;
  missed_dose_count: number;
  previous_delay_days: number;
  average_delay_days: number;
  days_since_last_dose: number;
  days_until_next_dose: number;
  vaccination_completion_rate: number;
  dose_sequence_completion_rate: number;
  district_vaccination_coverage: number;
  district_full_immunisation_rate: number;
  district_dpt_coverage: number;
  district_polio_coverage: number;
  district_bcg_coverage: number;
  days_overdue?: number;
};

export type PredictionResponse = {
  dropout_probability: number;
  dropout_probability_percent: number;
  predicted_miss_next_dose: number;
  risk_level: RiskLevel;
  priority_score: number;
  recommended_action: string;
  risk_reasons?: string[];
};

export type ReminderPlanRequest = {
  child_id?: string;
  child_name?: string;
  next_vaccine: string;
  missed_dose_count: number;
  dropout_probability?: number;
  next_dose_due_date: string;
  preferred_language?: "Marathi" | "Hindi" | "English";
};

export type ReminderPlanEvent = {
  child_id: string | null;
  child_name: string | null;
  next_vaccine: string;
  preferred_language: "Marathi" | "Hindi" | "English";
  reminder_number: number;
  days_before_vaccine: number;
  reminder_date: string;
  vaccine_due_date: string;
  channel: string;
  status: string;
  asha_action: string;
};

export type ReminderPlanResponse = {
  risk_level: RiskLevel;
  number_of_reminders: number;
  immediate_action: boolean;
  asha_action: string;
  reminders: ReminderPlanEvent[];
};

export type CapacityQueueItem = {
  child_id: string;
  child_name: string;
  parent_name?: string;
  parent_email?: string;
  village: string;
  next_vaccine: string;
  next_due_date?: string;
  missed_doses: number;
  days_overdue: number;
  dropout_probability: number;
  risk_level: RiskLevel;
  priority_score: number;
  risk_reasons: string[];
  recommended_action?: string;
};

export type VillageCapacityGroup = {
  village: string;
  capacity_allocated: number;
  total_children: number;
  children: CapacityQueueItem[];
};

export type AshaCapacityQueueResponse = {
  asha_id: string;
  daily_capacity: number;
  total_children: number;
  villages: VillageCapacityGroup[];
  items?: CapacityQueueItem[];
};

export type DailyScoringResponse = {
  status: string;
  total_scored: number;
  high_risk_count: number;
  timestamp?: string;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export type NewbornInput = {
  name: string;
  date_of_birth: string;
  gender?: "Female" | "Male";
};

export type RegisteredNewborn = {
  id: string;
  parent_id: string;
  name: string;
  date_of_birth: string;
  gender: "Female" | "Male" | null;
  created_at: string;
};

export type Child = RegisteredNewborn;

export type Vaccine = {
  id: string;
  name: string;
  recommended_age_days: number;
  description: string | null;
};

export type ImmunizationRecord = {
  id: string;
  child_id: string;
  vaccine_id: string;
  status: "pending" | "completed";
  administered_by: string | null;
  administered_date: string | null;
};

export async function registerNewborn(
  childData: NewbornInput,
): Promise<RegisteredNewborn> {
  const supabase = getSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const user = authData.user;
  if (!user) throw new Error("Sign in as a parent before registering a child.");

  const payload = {
    parent_id: user.id,
    name: childData.name.trim(),
    date_of_birth: childData.date_of_birth,
    gender: childData.gender ?? null,
  };

  const { data, error } = await supabase
    .from("children")
    .insert(payload)
    .select("id, parent_id, name, date_of_birth, gender, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function getChildren(signal?: AbortSignal): Promise<Child[]> {
  console.log("Starting Supabase fetch...");
  const { data, error } = await getSupabaseClient()
    .from("children")
    .select("id, parent_id, name, date_of_birth, gender, created_at")
    .order("created_at", { ascending: false })
    .abortSignal(signal ?? new AbortController().signal);

  if (error) throw error;
  return data;
}

export async function getVaccines(signal?: AbortSignal): Promise<Vaccine[]> {
  const { data, error } = await getSupabaseClient()
    .from("vaccines")
    .select("id, name, recommended_age_days, description")
    .order("recommended_age_days")
    .abortSignal(signal ?? new AbortController().signal);

  if (error) throw error;
  return data;
}

export async function getImmunizationRecords(
  childId: string,
  signal?: AbortSignal,
): Promise<ImmunizationRecord[]> {
  console.log("Starting Supabase fetch...");
  const { data, error } = await getSupabaseClient()
    .from("immunization_records")
    .select("id, child_id, vaccine_id, status, administered_by, administered_date")
    .eq("child_id", childId)
    .abortSignal(signal ?? new AbortController().signal);

  if (error) throw error;
  return data;
}

export async function completeImmunizationRecord(
  recordId: string,
  administeredDate = new Date().toISOString().slice(0, 10),
): Promise<ImmunizationRecord> {
  const supabase = getSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("Sign in as an ASHA worker to record vaccination.");

  const { data, error } = await supabase
    .from("immunization_records")
    .update({
      status: "completed",
      administered_by: authData.user.id,
      administered_date: administeredDate,
    })
    .eq("id", recordId)
    .select("id, child_id, vaccine_id, status, administered_by, administered_date")
    .single();

  if (error) throw error;
  return data;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  baseUrl?: string,
): Promise<T> {
  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let targetUrl: string;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    targetUrl = path;
  } else if (baseUrl !== undefined) {
    targetUrl = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  } else if (path.startsWith("/api/auth/")) {
    targetUrl = `${AUTH_API_BASE_URL}${path}`;
  } else {
    targetUrl = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  }

  const headers: Record<string, string> = { ...authHeaders };
  new Headers(options.headers).forEach((value, key) => {
    headers[key] = value;
  });

  const accessToken =
    typeof window !== "undefined" && !path.startsWith("/api/auth/")
      ? window.localStorage.getItem("access_token")
      : null;

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(targetUrl, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }

    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      details,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function sendRegistrationEmail(
  payload: { email: string },
): Promise<SendRegistrationEmailResponse> {
  return apiRequest<SendRegistrationEmailResponse>("/api/send-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createReminderPlan(payload: ReminderPlanRequest): Promise<ReminderPlanResponse> {
  return apiRequest<ReminderPlanResponse>("/api/v1/reminder-plan", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function predictDropoutRisk(payload: PredictionRequest): Promise<PredictionResponse> {
  return apiRequest<PredictionResponse>("/api/v1/predict", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getParentDashboard(signal?: AbortSignal): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>("/api/dashboard/parent", { signal });
}

export async function getAshaDashboard(signal?: AbortSignal): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>("/api/dashboard/asha", { signal });
}

export type InterventionRequest = {
  child_id: string;
  type: "call" | "reminder" | "home_visit" | "followup";
  note: string;
};

export async function createIntervention(
  payload: InterventionRequest,
): Promise<{ id?: string; child_id?: string; status?: string }> {
  return apiRequest<{ id?: string; child_id?: string; status?: string }>("/api/dashboard/interventions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resolveIntervention(
  interventionId: string,
): Promise<{ id?: string; status?: string; resolved_at?: string | null }> {
  return apiRequest<{ id?: string; status?: string; resolved_at?: string | null }>(
    `/api/dashboard/interventions/${interventionId}/resolve`,
    { method: "PATCH" },
  );
}

export type DashboardResponse = AppDashboardResponse;

export async function getAshaCapacityQueue(ashaId?: string, dailyCapacity = 5): Promise<AshaCapacityQueueResponse> {
  const params = new URLSearchParams();
  if (ashaId) params.set("asha_id", ashaId);
  params.set("daily_capacity", String(dailyCapacity));
  return apiRequest<AshaCapacityQueueResponse>(`/api/v1/asha/capacity-queue?${params.toString()}`);
}

export async function triggerBatchDailyScoring(
  district?: string,
): Promise<{ status?: string; total_scored?: number; evaluated_children?: number; high_risk_flagged?: number; reminders_triggered?: number }> {
  const params = district ? `?district=${encodeURIComponent(district)}` : "";
  return apiRequest<{ status?: string; total_scored?: number; evaluated_children?: number; high_risk_flagged?: number; reminders_triggered?: number }>(`/api/v1/batch/daily-scoring${params}`);
}
