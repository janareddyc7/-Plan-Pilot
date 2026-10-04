"use client";
import { useState } from "react";
import type { DentalPlan, Procedure } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSimulatorStore } from "@/store/simulator-store";
import { dentalPlanSchema } from "@/lib/schemas";
const dollars = (cents: number) => (cents / 100).toFixed(2);
type ServiceClass = Procedure["serviceClass"];
type FrequencyDraft = Record<ServiceClass, { procedureCode: string; maxUses: string; periodMonths: string; usedDates: string }>;
const serviceClasses: ServiceClass[] = ["preventive", "basic", "major"];
const serviceLabels: Record<ServiceClass, string> = { preventive: "Preventive", basic: "Basic", major: "Major" };

function initialFrequencyDraft(plan: DentalPlan): FrequencyDraft {
  return Object.fromEntries(serviceClasses.map((serviceClass) => {
    const rule = plan.frequencyLimits?.find((item) => item.serviceClass === serviceClass);
    return [serviceClass, {
      procedureCode: rule?.procedureCode ?? "",
      maxUses: rule ? String(rule.maxUses) : "",
      periodMonths: rule ? String(rule.periodMonths) : "12",
      usedDates: rule?.usedDates.join(", ") ?? "",
    }];
  })) as FrequencyDraft;
}

export function PlanEditor({ plan, onSaved }: { plan: DentalPlan; onSaved?: (plan: DentalPlan) => void }) {
  const updatePlan = useSimulatorStore((state) => state.updatePlan);
  const error = useSimulatorStore((state) => state.validationError);
  const [name, setName] = useState(plan.name);
  const [max, setMax] = useState(dollars(plan.annualMaximumCents));
  const [usedMax, setUsedMax] = useState(dollars(plan.alreadyUsedMaximumCents));
  const [deductible, setDeductible] = useState(
    dollars(plan.individualDeductibleCents),
  );
  const [usedDeductible, setUsedDeductible] = useState(
    dollars(plan.alreadyUsedDeductibleCents),
  );
  const [preventive, setPreventive] = useState(String(plan.coverageByClass.preventive));
  const [basic, setBasic] = useState(String(plan.coverageByClass.basic));
  const [major, setMajor] = useState(String(plan.coverageByClass.major));
  const [renewalMonth, setRenewalMonth] = useState(
    String(plan.benefitYearStartMonth),
  );
  const [renewalDay, setRenewalDay] = useState(
    String(plan.benefitYearStartDay),
  );
  const [deductibleAppliesTo, setDeductibleAppliesTo] = useState(plan.deductibleAppliesTo);
  const [preventiveCountsTowardMax, setPreventiveCountsTowardMax] = useState(plan.preventiveCountsTowardMax);
  const [outOfNetworkBalanceBilling, setOutOfNetworkBalanceBilling] = useState(plan.networkRules?.outOfNetworkBalanceBilling ?? true);
  const [waitingEligibleFrom, setWaitingEligibleFrom] = useState<Record<ServiceClass, string>>(() => Object.fromEntries(serviceClasses.map((serviceClass) => [serviceClass, plan.waitingPeriods?.find((rule) => rule.serviceClass === serviceClass)?.eligibleFrom ?? ""])) as Record<ServiceClass, string>);
  const [frequencyDraft, setFrequencyDraft] = useState<FrequencyDraft>(() => initialFrequencyDraft(plan));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>();
  const [saveError, setSaveError] = useState<string>();
  function nextPlan() {
    return {
      ...plan,
      name: name.trim(),
      annualMaximumCents: Math.round(Number(max) * 100),
      alreadyUsedMaximumCents: Math.round(Number(usedMax) * 100),
      individualDeductibleCents: Math.round(Number(deductible) * 100),
      alreadyUsedDeductibleCents: Math.round(Number(usedDeductible) * 100),
      coverageByClass: {
        ...plan.coverageByClass,
        preventive: Number(preventive),
        basic: Number(basic),
        major: Number(major),
      },
      benefitYearStartMonth: Number(renewalMonth),
      benefitYearStartDay: Number(renewalDay),
      deductibleAppliesTo,
      preventiveCountsTowardMax,
      networkRules: { outOfNetworkBalanceBilling, allowedAmountPolicy: plan.networkRules?.allowedAmountPolicy ?? "explicit" as const },
      waitingPeriods: serviceClasses.flatMap((serviceClass) => waitingEligibleFrom[serviceClass] ? [{ serviceClass, eligibleFrom: waitingEligibleFrom[serviceClass] }] : []),
      frequencyLimits: serviceClasses.flatMap((serviceClass) => {
        const draft = frequencyDraft[serviceClass];
        if (!draft.maxUses.trim()) return [];
        return [{ serviceClass, procedureCode: draft.procedureCode.trim() || undefined, maxUses: Number(draft.maxUses), periodMonths: Number(draft.periodMonths), usedDates: draft.usedDates.split(",").map((date) => date.trim()).filter(Boolean) }];
      }),
      isConfirmed: true as const,
    };
  }
  function validateInput() {
    if (!name.trim()) return "Give this plan a name before saving it.";
    if (Number(max) <= 0) return "Enter the annual maximum from your benefits summary.";
    if ([preventive, basic, major].every((value) => Number(value) === 0))
      return "Add at least one coverage percentage from your benefits summary.";
    return undefined;
  }
  function save(event: React.FormEvent) {
    event.preventDefault();
    const inputError = validateInput();
    if (inputError) {
      setSaveError(inputError);
      setSaveMessage(undefined);
      return;
    }
    const parsed = dentalPlanSchema.safeParse(nextPlan());
    if (!parsed.success) {
      setSaveError(parsed.error.issues[0]?.message ?? "Check the plan details.");
      setSaveMessage(undefined);
      return;
    }
    updatePlan(parsed.data);
    setSaveMessage("Rules updated for this session.");
    setSaveError(undefined);
  }
  async function saveToAccount() {
    const inputError = validateInput();
    if (inputError) {
      setSaveError(inputError);
      setSaveMessage(undefined);
      return;
    }
    const parsed = dentalPlanSchema.safeParse(nextPlan());
    if (!parsed.success) {
      setSaveError(parsed.error.issues[0]?.message ?? "Check the plan details.");
      return;
    }
    setSaving(true);
    setSaveMessage(undefined);
    setSaveError(undefined);
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: parsed.data }),
      });
      const payload = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Plan could not be saved.");
      updatePlan(parsed.data);
      onSaved?.(parsed.data);
      setSaveMessage("Plan saved to your account.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Plan could not be saved.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Card>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-primary">
          {plan.isConfirmed ? "Confirmed plan" : "Plan setup"}
        </p>
        <h1 className="mt-2 font-serif text-3xl">{plan.name}</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {plan.isConfirmed
            ? "Edit the confirmed rules used by every estimate."
            : "Enter the rules from your benefits summary. Nothing is calculated until you confirm them."}
        </p>
      </div>
      <form onSubmit={save} className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Plan name" value={name} onChange={setName} type="text" />
        <Field
          label="Annual maximum"
          value={max}
          onChange={setMax}
          prefix="$"
        />
        <Field
          label="Used annual maximum"
          value={usedMax}
          onChange={setUsedMax}
          prefix="$"
        />
        <Field
          label="Individual deductible"
          value={deductible}
          onChange={setDeductible}
          prefix="$"
        />
        <Field
          label="Used deductible"
          value={usedDeductible}
          onChange={setUsedDeductible}
          prefix="$"
        />
        <Field
          label="Preventive coverage"
          value={preventive}
          onChange={setPreventive}
          suffix="%"
        />
        <Field
          label="Basic coverage"
          value={basic}
          onChange={setBasic}
          suffix="%"
        />
        <Field
          label="Major coverage"
          value={major}
          onChange={setMajor}
          suffix="%"
        />
        <Field
          label="Renewal month"
          value={renewalMonth}
          onChange={setRenewalMonth}
          step="1"
        />
        <fieldset className="sm:col-span-2 rounded-md border border-border p-4">
          <legend className="px-1 text-xs font-medium">Waiting periods</legend>
          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">If your summary says a service class is eligible only after a date, enter that date. Leave it blank when there is no waiting period.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {serviceClasses.map((serviceClass) => <label key={serviceClass} className="text-[11px] text-muted-foreground">{serviceLabels[serviceClass]} eligible from<Input type="date" value={waitingEligibleFrom[serviceClass]} onChange={(event) => setWaitingEligibleFrom({ ...waitingEligibleFrom, [serviceClass]: event.target.value })} /></label>)}
          </div>
        </fieldset>
        <fieldset className="sm:col-span-2 rounded-md border border-border p-4">
          <legend className="px-1 text-xs font-medium">Frequency limits</legend>
          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">Add rules such as “2 cleanings every 12 months.” A procedure code narrows the rule; blank code applies it to the whole service class. Include known prior service dates, separated by commas.</p>
          <div className="mt-3 space-y-3">
            {serviceClasses.map((serviceClass) => { const draft = frequencyDraft[serviceClass]; return <div key={serviceClass} className="grid gap-3 rounded-md border border-border/70 p-3 sm:grid-cols-[1.2fr_1fr_1fr_1.8fr] sm:items-end"><label className="text-[11px] text-muted-foreground">Class / CDT code<span className="mt-2 block text-xs text-foreground">{serviceLabels[serviceClass]}</span><Input value={draft.procedureCode} placeholder="e.g. D1110 (optional)" onChange={(event) => setFrequencyDraft({ ...frequencyDraft, [serviceClass]: { ...draft, procedureCode: event.target.value } })} /></label><Field label="Max uses" value={draft.maxUses} onChange={(value) => setFrequencyDraft({ ...frequencyDraft, [serviceClass]: { ...draft, maxUses: value } })} step="1" /><Field label="Every (months)" value={draft.periodMonths} onChange={(value) => setFrequencyDraft({ ...frequencyDraft, [serviceClass]: { ...draft, periodMonths: value } })} step="1" /><label className="text-[11px] text-muted-foreground">Known dates (comma-separated)<Input type="text" value={draft.usedDates} placeholder="2026-03-01, 2026-09-01" onChange={(event) => setFrequencyDraft({ ...frequencyDraft, [serviceClass]: { ...draft, usedDates: event.target.value } })} /></label></div>; })}
          </div>
        </fieldset>
        <Field
          label="Renewal day"
          value={renewalDay}
          onChange={setRenewalDay}
          step="1"
        />
        <fieldset className="sm:col-span-2 rounded-md border border-border p-4"><legend className="px-1 text-xs font-medium">Deductible applies to</legend><div className="mt-2 flex flex-wrap gap-5">{(["preventive", "basic", "major"] as const).map((key) => <label key={key} className="flex items-center gap-2 text-xs capitalize"><input type="checkbox" checked={deductibleAppliesTo[key]} onChange={(event) => setDeductibleAppliesTo({ ...deductibleAppliesTo, [key]: event.target.checked })} className="mt-0 size-4"/>{key}</label>)}</div><p className="mt-3 text-[11px] text-muted-foreground">Check only the service classes named in your plan. An unchecked class does not use your deductible in estimates.</p></fieldset>
        <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2"><label className="flex items-start gap-2 rounded-md border border-border p-3 text-xs"><input type="checkbox" checked={preventiveCountsTowardMax} onChange={(event) => setPreventiveCountsTowardMax(event.target.checked)} className="mt-0 size-4"/><span>Preventive payments count toward annual maximum</span></label><label className="flex items-start gap-2 rounded-md border border-border p-3 text-xs"><input type="checkbox" checked={outOfNetworkBalanceBilling} onChange={(event) => setOutOfNetworkBalanceBilling(event.target.checked)} className="mt-0 size-4"/><span>Out-of-network dentist may bill above allowed amount</span></label></div>
        <div className="sm:col-span-2 flex items-center justify-between border-t border-border pt-5">
          <p className="text-[11px] text-muted-foreground">
            Coverage, waiting periods, and frequency rules are applied exactly as entered. Confirm these values against your summary.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="submit" variant="outline">Update session</Button>
            <Button type="button" onClick={saveToAccount} disabled={saving}>
              {saving ? "Saving…" : "Save to account"}
            </Button>
          </div>
        </div>
        {error && (
          <p role="alert" className="sm:col-span-2 text-xs text-destructive">
            {error}
          </p>
        )}
        {saveMessage && <p role="status" className="sm:col-span-2 text-xs text-primary">{saveMessage}</p>}
        {saveError && <p role="alert" className="sm:col-span-2 text-xs text-destructive">{saveError}</p>}
      </form>
    </Card>
  );
}
function Field({
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  type?: "number" | "text";
  step?: string;
}) {
  return (
    <label className="text-[11px] text-muted-foreground">
      {label}
      <div className="relative">
        <Input
          type={type}
          min={type === "number" ? "0" : undefined}
          max={suffix ? "100" : undefined}
          step={type === "number" ? step ?? (suffix ? "1" : "0.01") : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={prefix ? "pl-7" : suffix ? "pr-8" : ""}
        />
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-3 text-xs">
            {prefix}
          </span>
        )}
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-3 text-xs">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}
