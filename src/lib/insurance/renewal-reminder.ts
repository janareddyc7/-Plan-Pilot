import type { DentalPlan } from "@/lib/schemas";
import { benefitYearForDate } from "./benefit-year";

export function renewalReminder(plan: DentalPlan, remainingCents: number, today = new Date()): { daysLeft: number; renewalDate: string } | undefined {
  if (!plan.isConfirmed || remainingCents <= 0 || plan.annualMaximumCents <= 0) return undefined;
  const todayIso = today.toISOString().slice(0, 10);
  if (benefitYearForDate(plan.usageAsOfDate, plan) !== benefitYearForDate(todayIso, plan)) return undefined;
  const start = benefitYearForDate(todayIso, plan);
  const next = `${Number(start.slice(0, 4)) + 1}-${start.slice(5)}`;
  const daysLeft = Math.ceil((Date.parse(`${next}T00:00:00Z`) - Date.parse(`${todayIso}T00:00:00Z`)) / 86400000);
  return daysLeft > 0 && daysLeft <= 60 ? { daysLeft, renewalDate: next } : undefined;
}
