import type { DentalPlan } from "@/lib/schemas";

export function benefitYearForDate(date: string, plan: Pick<DentalPlan, "benefitYearStartMonth" | "benefitYearStartDay">): string {
  const current = new Date(`${date}T00:00:00Z`);
  let year = current.getUTCFullYear();
  const start = new Date(Date.UTC(year, plan.benefitYearStartMonth - 1, plan.benefitYearStartDay));
  if (current < start) year -= 1;
  return `${year.toString().padStart(4, "0")}-${plan.benefitYearStartMonth.toString().padStart(2, "0")}-${plan.benefitYearStartDay.toString().padStart(2, "0")}`;
}

export function isInBenefitYear(date: string, benefitYear: string, plan: Pick<DentalPlan, "benefitYearStartMonth" | "benefitYearStartDay">): boolean {
  return benefitYearForDate(date, plan) === benefitYear;
}
