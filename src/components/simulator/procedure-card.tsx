"use client";
import type { Procedure, ClaimReceipt } from "@/lib/schemas";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export function ProcedureCard({
  procedure,
  date,
  receipt,
  onDate,
  onInspect,
}: {
  procedure: Procedure;
  date: string;
  receipt?: ClaimReceipt;
  onDate: (date: string) => void;
  onInspect: (receipt: ClaimReceipt) => void;
}) {
  const locked =
    !!procedure.fixedDate || procedure.urgent || !procedure.isFlexible;
  return (
    <div className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(160px,1fr)_140px_100px] md:items-center">
      <div>
        <h3 className="flex items-center gap-2 text-xs font-medium">
          {procedure.name}
          {locked && <LockKeyhole size={12} />}
        </h3>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          {procedure.code} <span className="px-1.5">·</span>
          {procedure.serviceClass}
          <span className="px-1.5">·</span>
          {procedure.networkStatus}
        </p>
      </div>
      <label className="text-[10px] text-muted-foreground">
        <span className="md:hidden">Service date</span>
        <input
          aria-label={`${procedure.name} service date`}
          type="date"
          disabled={locked}
          min={procedure.earliestDate}
          max={procedure.dentistApprovedLatestDate}
          value={date}
          onChange={(event) => onDate(event.target.value)}
          className="!m-0 !h-9 !px-2 !py-1 !text-xs"
        />
      </label>
      <button
        type="button"
        onClick={() => receipt && onInspect(receipt)}
        disabled={!receipt}
        className="flex items-center gap-1.5 text-sm tabular-nums underline decoration-border underline-offset-4 hover:text-primary md:justify-end"
        aria-label={`Inspect ${procedure.name} estimate`}
      >
        {receipt ? money(receipt.patientPayment) : "—"}
        <ArrowUpRight size={12} />
      </button>
    </div>
  );
}
