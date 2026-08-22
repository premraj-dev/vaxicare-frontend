/**
 * VaxiCare service layer.
 * Authentication and unimplemented records remain local for the prototype.
 * ML risk prediction and reminder planning call the live FastAPI backend.
 */

import {
  createReminderPlan,
  predictDropoutRisk,
  type PredictionRequest,
  type ReminderPlanRequest,
} from "@/lib/api";

const wait = (ms = 450) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const authService = {
  async login(role: string) {
    await wait();
    return { role, token: "mock-session-token" };
  },
  async sendOtp() {
    await wait(300);
    return { sent: true };
  },
  async verifyOtp(code: string) {
    await wait(300);
    return { verified: code.length >= 4 };
  },
};

export const vaccinationService = {
  async submitVaccination() {
    await wait(600);
    return { success: true, message: "Vaccination record successfully updated." };
  },
};

export const reminderService = {
  async sendReminder() {
    await wait(420);
    return { success: true, message: "Reminder sent successfully." };
  },
  async createPlan(payload: ReminderPlanRequest) {
    return createReminderPlan(payload);
  },
};

export const riskService = {
  async predict(payload: PredictionRequest) {
    return predictDropoutRisk(payload);
  },
};

export const interventionService = {
  async recordAction() {
    await wait(420);
    return { success: true };
  },
};
