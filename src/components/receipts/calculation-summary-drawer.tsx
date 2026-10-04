"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Procedure } from "@/lib/schemas";
import type { ClaimsCalculation } from "@/lib/insurance/claims";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export function CalculationSummaryDrawer({
  calculation,
  procedures,
  onClose,
}: {
  calculation?: ClaimsCalculation;
  procedures: Procedure[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (calculation) dialog.current?.showModal();
    else dialog.current?.close();
  }, [calculation]);
  const procedureById = new Map(procedures.map((procedure) => [procedure.id, procedure]));
  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="calculation-summary-title"
      className="fixed inset-y-0 left-auto right-0 m-0 h-svh max-h-svh w-full max-w-sm border-l border-border bg-card p-0 text-foreground shadow-preview backdrop:bg-foreground/20"
    >
      {calculation && (
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary">Aggregate estimate</p>
              <h2 id="calculation-summary-title" className="mt-2 font-serif text-2xl">The whole picture.</h2>
            </div>
            <button autoFocus aria-label="Close calculation summary" onClick={onClose} className="rounded-md p-2 hover:bg-muted"><X size={16} /></button>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">These totals are recalculated from your confirmed plan, saved care details, and selected dates. Select a procedure on the timeline for its full line-item receipt.</p>
          <div className="mt-5 divide-y divide-border border-y border-border">
            {[
              ["Billed fees", calculation.totals.billedFeeCents],
              ["Network adjustment", calculation.totals.networkWriteOffCents],
              ["Plan contribution", calculation.totals.insurerPaymentCents],
              ["Your share", calculation.totals.patientPaymentCents],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3 text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium tabular-nums">{label === "Network adjustment" ? `− ${money(Number(value))}` : money(Number(value))}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-widest text-primary">Receipt index</p>
            <div className="mt-3 divide-y divide-border border-y border-border">
              {calculation.receipts.map((receipt) => (
                <div key={receipt.id} className="py-3">
                  <div className="flex justify-between gap-3 text-xs">
                    <span>{procedureById.get(receipt.procedureId)?.name ?? "Procedure"}</span>
                    <span className="font-medium tabular-nums">{money(receipt.patientPayment)}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">{receipt.date} · {receipt.coveragePercent}% coverage · plan pays {money(receipt.finalInsurerPayment)}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-5 text-[10px] leading-5 text-muted-foreground">Planning estimate only. Confirm benefits, allowed amounts, and treatment timing with your insurer and dentist.</p>
        </div>
      )}
    </dialog>
  );
}
