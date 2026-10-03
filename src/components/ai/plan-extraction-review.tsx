"use client";

import { Check, CircleAlert, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AiExtractionResult } from "@/lib/schemas";

const labels: Record<string, string> = {
  name: "Plan name",
  annualMaximumCents: "Annual maximum",
  alreadyUsedMaximumCents: "Maximum already used",
  individualDeductibleCents: "Individual deductible",
  alreadyUsedDeductibleCents: "Deductible already used",
  "coverageByClass.preventive": "Preventive coverage",
  "coverageByClass.basic": "Basic coverage",
  "coverageByClass.major": "Major coverage",
  deductibleAppliesTo: "Deductible applies to",
  networkRules: "Network rules",
  waitingPeriods: "Waiting periods",
  benefitYearStartMonth: "Benefit year month",
  benefitYearStartDay: "Benefit year day",
  preventiveCountsTowardMax: "Preventive counts toward maximum",
};

export function PlanExtractionReview({
  extraction,
  documentId,
  onConfirm,
}: {
  extraction: AiExtractionResult;
  documentId: string;
  onConfirm: (extraction: AiExtractionResult, documentId: string) => void;
}) {
  const fields = flattenFields(extraction);
  const sourceByField = new Map(extraction.fields.map((field) => [field.field, field]));
  return (
    <Card className="border-primary/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary">
            <FileText size={13} /> Review extraction
          </p>
          <h2 className="mt-2 font-serif text-2xl">A draft, not a decision.</h2>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">
            Confirm or correct each candidate. The calculation engine will continue using your
            existing confirmed rules until you accept this draft.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-primary/30 bg-secondary px-2 py-1 text-[10px] text-primary">
          Unconfirmed
        </span>
      </div>

      <div className="mt-5 divide-y divide-border border-y border-border">
        {fields.length ? (
          fields.map(({ key, value }) => {
            const source = sourceByField.get(key) ?? sourceByField.get(sourceKey(key));
            return (
              <div key={key} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {labels[key] ?? key}
                  </p>
                  <p className="mt-1 text-sm">{formatValue(key, value)}</p>
                  {source?.source?.quote && (
                    <p className="mt-1 max-w-xl text-[10px] leading-4 text-muted-foreground">
                      Page {source.source.page}: “{source.source.quote}”
                    </p>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {source?.confidence ?? "not rated"}
                </span>
              </div>
            );
          })
        ) : (
          <p className="py-4 text-xs text-muted-foreground">No plan fields were confidently extracted.</p>
        )}
      </div>

      {extraction.unresolvedItems.length > 0 && (
        <div className="mt-4 border border-destructive/25 bg-destructive/5 p-3">
          <p className="flex items-center gap-2 text-xs font-medium text-destructive">
            <CircleAlert size={14} /> Verify these items manually
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-5 text-muted-foreground">
            {extraction.unresolvedItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-[10px] leading-4 text-muted-foreground">
          AI proposes. You verify. PlanPilot computes only after confirmation.
        </p>
        <Button type="button" onClick={() => onConfirm(extraction, documentId)}>
          <Check size={14} /> Confirm plan fields
        </Button>
      </div>
    </Card>
  );
}

function flattenFields(extraction: AiExtractionResult) {
  const result: { key: string; value: unknown }[] = [];
  for (const [key, value] of Object.entries(extraction.extractedPlanData)) {
    if (value === undefined) continue;
    if (key === "coverageByClass" && value) {
      for (const [className, coverage] of Object.entries(value))
        if (coverage !== undefined) result.push({ key: `coverageByClass.${className}`, value: coverage });
    } else result.push({ key, value });
  }
  return result;
}

function formatValue(key: string, value: unknown) {
  if (key.endsWith("Cents") && typeof value === "number")
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100);
  if (key.includes("coverage") && typeof value === "number") return `${value}%`;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function sourceKey(key: string) {
  const aliases: Record<string, string> = {
    annualMaximumCents: "annualMaximum",
    alreadyUsedMaximumCents: "alreadyUsedMaximum",
    individualDeductibleCents: "individualDeductible",
    alreadyUsedDeductibleCents: "alreadyUsedDeductible",
  };
  return aliases[key] ?? key;
}
