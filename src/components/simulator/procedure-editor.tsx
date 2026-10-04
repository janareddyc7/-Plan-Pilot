"use client";
import { useState } from "react";
import type { Procedure } from "@/lib/schemas";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSimulatorStore } from "@/store/simulator-store";
export function ProcedureEditor({ procedure, planId }: { procedure: Procedure; planId: string }) {
  const update = useSimulatorStore((state) => state.updateProcedure);
  const procedures = useSimulatorStore((state) => state.procedures);
  const error = useSimulatorStore((state) => state.validationError);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();
  const dependencies = procedures.filter((item) => item.id !== procedure.id);
  async function saveToAccount() {
    setSaving(true);
    setMessage(undefined);
    try {
      const response = await fetch("/api/procedures", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planId, procedure }),
      });
      const payload = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Procedure could not be saved.");
      setMessage("Saved to your account.");
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : "Procedure could not be saved.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">{procedure.name}</h2>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {procedure.code} · {procedure.serviceClass}
          </p>
        </div>
        <span className="text-[10px] text-muted-foreground">
          Editable treatment rule
        </span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          label="Procedure name"
          value={procedure.name}
          onChange={(value) => update(procedure.id, { name: value })}
        />
        <Field
          label="Billed fee ($)"
          type="number"
          value={(procedure.estimatedBilledFeeCents / 100).toFixed(2)}
          onChange={(value) =>
            update(procedure.id, {
              estimatedBilledFeeCents: Math.round(Number(value) * 100),
            })
          }
        />
        <Field
          label="Allowed fee ($)"
          type="number"
          value={
            procedure.estimatedAllowedFeeCents === undefined
              ? ""
              : (procedure.estimatedAllowedFeeCents / 100).toFixed(2)
          }
          onChange={(value) =>
            update(procedure.id, {
              estimatedAllowedFeeCents: value
                ? Math.round(Number(value) * 100)
                : undefined,
            })
          }
        />
        <SelectField
          label="Network"
          value={procedure.networkStatus}
          options={[
            ["in-network", "In-network"],
            ["out-of-network", "Out-of-network"],
          ]}
          onChange={(value) =>
            update(procedure.id, {
              networkStatus: value as Procedure["networkStatus"],
            })
          }
        />
        <Field
          label="Earliest approved date"
          type="date"
          value={procedure.earliestDate}
          onChange={(value) => update(procedure.id, { earliestDate: value })}
        />
        <Field
          label="Latest approved date"
          type="date"
          value={procedure.dentistApprovedLatestDate ?? ""}
          onChange={(value) =>
            update(procedure.id, {
              dentistApprovedLatestDate: value || undefined,
            })
          }
        />
        <Field
          label="Fixed date (optional)"
          type="date"
          value={procedure.fixedDate ?? ""}
          onChange={(value) =>
            update(procedure.id, { fixedDate: value || undefined })
          }
        />
        <label className="text-[11px] text-muted-foreground">
          Prerequisite
          <select
            multiple
            value={procedure.requiresProcedureIds}
            onChange={(event) =>
              update(procedure.id, {
                requiresProcedureIds: Array.from(
                  event.target.selectedOptions,
                  (option) => option.value,
                ),
              })
            }
            className="mt-2 min-h-10 w-full border border-input bg-background px-3 py-2 text-xs text-foreground"
          >
            {dependencies.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-4 text-xs sm:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={procedure.urgent}
              onChange={(event) =>
                update(procedure.id, { urgent: event.target.checked })
              }
            />
            Urgent / earliest date
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={procedure.isFlexible}
              onChange={(event) =>
                update(procedure.id, { isFlexible: event.target.checked })
              }
            />
            Flexible timing
          </label>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-xs text-destructive">
          {error}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-[10px] text-muted-foreground" role="status">{message}</p>
        <button type="button" onClick={saveToAccount} disabled={saving} className="text-[11px] font-medium text-primary hover:underline disabled:opacity-50">
          {saving ? "Saving…" : "Save procedure"}
        </button>
      </div>
    </Card>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-[11px] text-muted-foreground">
      {label}
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[11px] text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full border border-input bg-background px-3 text-xs text-foreground"
      >
        {options.map(([option, label]) => (
          <option key={option} value={option}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
