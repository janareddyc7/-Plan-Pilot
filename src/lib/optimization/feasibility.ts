import type { DentalPlan, Procedure, Schedule } from "@/lib/schemas";
import { planRuleViolations } from "@/lib/insurance/coverage-rules";

export type FeasibilityReason = "fixed-date" | "outside-window" | "dependency" | "urgent" | "benefit-rule" | "valid";
export interface FeasibilityResult { feasible: boolean; reasons: string[]; reasonCodes: FeasibilityReason[] }

export function evaluateSchedule(procedures: Procedure[], schedule: Schedule, plan?: DentalPlan): FeasibilityResult {
  const byId = new Map(procedures.map((procedure) => [procedure.id, procedure]));
  const reasons: string[] = [];
  const reasonCodes: FeasibilityReason[] = [];
  for (const procedure of procedures) {
    const date = schedule[procedure.id];
    if (!date) { reasons.push(`${procedure.name} is missing a scheduled date.`); reasonCodes.push("outside-window"); continue; }
    if (procedure.fixedDate && date !== procedure.fixedDate) { reasons.push(`${procedure.name} is fixed on ${procedure.fixedDate}.`); reasonCodes.push("fixed-date"); }
    if (date < procedure.earliestDate || (procedure.dentistApprovedLatestDate !== undefined && date > procedure.dentistApprovedLatestDate)) { reasons.push(`${procedure.name} must be scheduled between ${procedure.earliestDate} and ${procedure.dentistApprovedLatestDate ?? "the approved date"}.`); reasonCodes.push("outside-window"); }
    if (procedure.urgent && date > procedure.earliestDate) { reasons.push(`${procedure.name} is urgent and should remain at its earliest approved date.`); reasonCodes.push("urgent"); }
    for (const dependencyId of procedure.requiresProcedureIds) {
      const dependencyDate = schedule[dependencyId];
      if (dependencyDate && dependencyDate > date) { reasons.push(`${procedure.name} must follow ${byId.get(dependencyId)?.name ?? "its prerequisite"}.`); reasonCodes.push("dependency"); }
    }
  }
  if (plan) {
    const ruleReasons = planRuleViolations(plan, procedures, schedule);
    reasons.push(...ruleReasons);
    if (ruleReasons.length) reasonCodes.push("benefit-rule");
  }
  return { feasible: reasons.length === 0, reasons, reasonCodes: reasons.length === 0 ? ["valid"] : [...new Set(reasonCodes)] };
}
