"use client";
import { useState } from "react";
import type { DentalPlan } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSimulatorStore } from "@/store/simulator-store";
const dollars = (cents: number) => (cents / 100).toFixed(2);
export function PlanEditor({ plan }: { plan: DentalPlan }) {
  const updatePlan = useSimulatorStore((state) => state.updatePlan);
  const error = useSimulatorStore((state) => state.validationError);
  const [max, setMax] = useState(dollars(plan.annualMaximumCents));
  const [deductible, setDeductible] = useState(
    dollars(plan.individualDeductibleCents),
  );
  const [basic, setBasic] = useState(String(plan.coverageByClass.basic));
  const [major, setMajor] = useState(String(plan.coverageByClass.major));
  const [renewalMonth, setRenewalMonth] = useState(
    String(plan.benefitYearStartMonth),
  );
  const [renewalDay, setRenewalDay] = useState(
    String(plan.benefitYearStartDay),
  );
  function save(event: React.FormEvent) {
    event.preventDefault();
    updatePlan({
      annualMaximumCents: Math.round(Number(max) * 100),
      individualDeductibleCents: Math.round(Number(deductible) * 100),
      coverageByClass: {
        ...plan.coverageByClass,
        basic: Number(basic),
        major: Number(major),
      },
      benefitYearStartMonth: Number(renewalMonth),
      benefitYearStartDay: Number(renewalDay),
      isConfirmed: true,
    });
  }
  return (
    <Card>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-primary">
          Confirmed plan
        </p>
        <h1 className="mt-2 font-serif text-3xl">{plan.name}</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Edit the confirmed rules used by every estimate.
        </p>
      </div>
      <form onSubmit={save} className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field
          label="Annual maximum"
          value={max}
          onChange={setMax}
          prefix="$"
        />
        <Field
          label="Individual deductible"
          value={deductible}
          onChange={setDeductible}
          prefix="$"
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
            Preventive coverage: {plan.coverageByClass.preventive}%
          </p>
          <Button type="submit">Save plan rules</Button>
        </div>
        {error && (
          <p role="alert" className="sm:col-span-2 text-xs text-destructive">
            {error}
          </p>
        )}
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
