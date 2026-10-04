import type { DentalPlan, Procedure, Schedule } from "@/lib/schemas";

export function datesInFrequencyWindow(previousDate: string, currentDate: string, periodMonths: number) {
  const current = new Date(`${currentDate}T00:00:00Z`);
  current.setUTCMonth(current.getUTCMonth() - periodMonths);
  const start = current.toISOString().slice(0, 10);
  return previousDate >= start && previousDate <= currentDate;
}

export function frequencyRuleMatches(rule: NonNullable<DentalPlan["frequencyLimits"]>[number], procedure: Procedure) {
  return rule.serviceClass === procedure.serviceClass && (!rule.procedureCode || rule.procedureCode.toUpperCase() === procedure.code?.toUpperCase());
}

export function frequencyViolationForProcedure(
  plan: DentalPlan,
  procedure: Procedure,
  date: string,
  priorDatesByRule: Map<number, string[]>,
) {
  const violations: string[] = [];
  for (const [index, rule] of (plan.frequencyLimits ?? []).entries()) {
    if (!frequencyRuleMatches(rule, procedure)) continue;
    const prior = (priorDatesByRule.get(index) ?? []).filter((value) => datesInFrequencyWindow(value, date, rule.periodMonths));
    if (prior.length >= rule.maxUses) {
      const service = rule.procedureCode ? `${procedure.name} (${rule.procedureCode})` : `${procedure.serviceClass} care`;
      violations.push(`${service}: the plan allows ${rule.maxUses} use${rule.maxUses === 1 ? "" : "s"} every ${rule.periodMonths} month${rule.periodMonths === 1 ? "" : "s"}; this date would exceed that limit.`);
    }
  }
  return violations;
}

export function planRuleViolations(plan: DentalPlan, procedures: Procedure[], schedule: Schedule) {
  const violations: string[] = [];
  const ordered = procedures
    .map((procedure) => ({ procedure, date: schedule[procedure.id] ?? procedure.fixedDate ?? procedure.earliestDate }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.procedure.id.localeCompare(b.procedure.id));
  const priorDatesByRule = new Map<number, string[]>();
  for (const date of plan.frequencyLimits?.flatMap((rule, index) => rule.usedDates.map((value) => [index, value] as const)) ?? []) {
    const values = priorDatesByRule.get(date[0]) ?? [];
    values.push(date[1]);
    priorDatesByRule.set(date[0], values);
  }
  for (const { procedure, date } of ordered) {
    const waitingPeriod = plan.waitingPeriods?.find((rule) => rule.serviceClass === procedure.serviceClass);
    if (waitingPeriod && date < waitingPeriod.eligibleFrom) {
      violations.push(`${procedure.name} is before the ${procedure.serviceClass} waiting period ends on ${waitingPeriod.eligibleFrom}.`);
    }
    violations.push(...frequencyViolationForProcedure(plan, procedure, date, priorDatesByRule));
    for (const [index, rule] of (plan.frequencyLimits ?? []).entries()) {
      if (frequencyRuleMatches(rule, procedure)) {
        const values = priorDatesByRule.get(index) ?? [];
        values.push(date);
        priorDatesByRule.set(index, values);
      }
    }
  }
  return [...new Set(violations)];
}
