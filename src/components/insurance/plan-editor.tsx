"use client";
import { useState } from "react";
import type { DentalPlan } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSimulatorStore } from "@/store/simulator-store";
import { dentalPlanSchema } from "@/lib/schemas";
const dollars = (cents: number) => (cents / 100).toFixed(2);
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
    updatePlan(nextPlan());
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
        <Field label="Plan name" value={name} onChange={setName} />
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
        />
        <Field
          label="Renewal day"
          value={renewalDay}
          onChange={setRenewalDay}
        />
        <div className="sm:col-span-2 flex items-center justify-between border-t border-border pt-5">
          <p className="text-[11px] text-muted-foreground">
            Coverage is applied by service class. Confirm these values against your summary.
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="text-[11px] text-muted-foreground">
      {label}
      <div className="relative">
        <Input
          type="number"
          min="0"
          max={suffix ? "100" : undefined}
          step={suffix ? "1" : "0.01"}
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
