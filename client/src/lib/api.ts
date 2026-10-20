// Shared VaxiCare FastAPI client.
// Page components and services use this file instead of hard-coding backend URLs.

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://vaxicare-ml-api.onrender.com"
).replace(/\/+$/, "");
export const AUTH_API_BASE_URL = (
  import.meta.env.VITE_AUTH_API_BASE_URL !== undefined
    ? import.meta.env.VITE_AUTH_API_BASE_URL
    : import.meta.env.DEV
      ? ""
      : API_BASE_URL
).replace(/\/+$/, "");

export const API_KEY = import.meta.env.VITE_API_KEY || "vaxicare-secret-key";

export type RiskLevel = "Normal" | "Low" | "Medium" | "High";

export type BackendHealth = {
  status: string;
  service?: string;
  version?: string;
};

export type EmailOtpRequest = {
  email: string;
};

export type AuthLoginRequest = {
  email: string;
  otp: string;
};

export type AuthLoginResponse = {
  access_token: string;
  user?: Record<string, unknown>;
  user_profile?: Record<string, unknown>;
  profile?: Record<string, unknown>;
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

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  baseUrl?: string,
): Promise<T> {
  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
    "Authorization": `Bearer ${API_KEY}`,
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

  const response = await fetch(targetUrl, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "detail" in data
        ? String(data.detail)
        : `API request failed with status ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export function sendEmailOtp(payload: EmailOtpRequest) {
  return apiRequest<{ sent: boolean; code?: string; note?: string }>("/api/auth/otp/send", {
    method: "POST",
    body: JSON.stringify(payload),
  }, AUTH_API_BASE_URL);
}

export function loginWithEmailOtp(payload: AuthLoginRequest) {
  return apiRequest<AuthLoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  }, AUTH_API_BASE_URL);
}

export function checkBackendHealth() {
  return apiRequest<BackendHealth>("/health");
}

export function predictDropoutRisk(payload: PredictionRequest) {
  return apiRequest<PredictionResponse>("/api/v1/predict", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createReminderPlan(payload: ReminderPlanRequest) {
  return apiRequest<ReminderPlanResponse>("/api/v1/reminder-plan", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAshaCapacityQueue(ashaId = "ASHA-PUN-08", dailyCapacity = 15) {
  return apiRequest<AshaCapacityQueueResponse>(
    `/api/v1/asha/capacity-queue?asha_id=${encodeURIComponent(ashaId)}&daily_capacity=${dailyCapacity}`,
    {
      method: "GET",
    },
  ).catch(async () => {
    // Fallback to POST if GET is unsupported by backend routing
    return apiRequest<AshaCapacityQueueResponse>("/api/v1/asha/capacity-queue", {
      method: "POST",
      body: JSON.stringify({ asha_id: ashaId, daily_capacity: dailyCapacity }),
    });
  });
}

export function triggerBatchDailyScoring(district = "Pune") {
  return apiRequest<DailyScoringResponse>("/api/v1/batch/daily-scoring", {
    method: "POST",
    body: JSON.stringify({ district }),
  });
}
