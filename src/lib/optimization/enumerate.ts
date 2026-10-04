import type { DentalPlan, Procedure, Schedule } from "@/lib/schemas";

function addDays(date: string, days: number) { const value = new Date(`${date}T00:00:00Z`); value.setUTCDate(value.getUTCDate() + days); return value.toISOString().slice(0, 10); }
function unique(values: string[]) { return [...new Set(values)].sort(); }

export function candidateDates(procedure: Procedure, plan?: DentalPlan): string[] {
  if (procedure.fixedDate || !procedure.isFlexible || procedure.urgent) return [procedure.fixedDate ?? procedure.earliestDate];
  const latest = procedure.dentistApprovedLatestDate ?? addDays(procedure.earliestDate, 90);
  const eligibleFrom = plan?.waitingPeriods?.find((rule) => rule.serviceClass === procedure.serviceClass)?.eligibleFrom;
  return unique([procedure.earliestDate, eligibleFrom, addDays(procedure.earliestDate, 14), addDays(procedure.earliestDate, 30), latest].filter((date): date is string => Boolean(date && date >= procedure.earliestDate && date <= latest)));
}

export function enumerateSchedules(procedures: Procedure[], base: Schedule, maxCandidates = 256, plan?: DentalPlan): Schedule[] {
  const results: Schedule[] = [];
  function walk(index: number, schedule: Schedule) {
    if (results.length >= maxCandidates) return;
    if (index === procedures.length) { results.push({ ...schedule }); return; }
    const procedure = procedures[index];
    for (const date of candidateDates(procedure, plan)) walk(index + 1, { ...schedule, [procedure.id]: date });
  }
  walk(0, base);
  return results;
}
