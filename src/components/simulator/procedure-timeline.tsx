"use client";
import type { ClaimReceipt, Procedure, Schedule } from "@/lib/schemas";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProcedureCard } from "./procedure-card";
import Link from "next/link";
export function ProcedureTimeline({
  procedures,
  schedule,
  receipts,
  onDate,
  onInspect,
}: {
  procedures: Procedure[];
  schedule: Schedule;
  receipts: ClaimReceipt[];
  onDate: (id: string, date: string) => void;
  onInspect: (receipt: ClaimReceipt) => void;
}) {
  if (procedures.length === 0) {
    return (
      <Card className="border-dashed p-6">
        <h2 className="text-sm font-medium">No care details yet</h2>
        <p className="mt-2 max-w-xl text-xs leading-6 text-muted-foreground">
          Add the procedures you are considering, their estimated fees, and dentist-approved timing windows before comparing schedules.
        </p>
        <Link href="/app/plans" className="mt-4 inline-flex text-xs font-medium text-primary underline underline-offset-4">
          Add care details →
        </Link>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-xs font-medium">Treatment plan</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Dates within your approved treatment windows.
          </p>
        </div>
        <Badge>{procedures.length} procedures</Badge>
      </div>
      <div className="hidden grid-cols-[minmax(160px,1fr)_140px_100px] gap-3 border-b border-border bg-muted/30 px-5 py-2 text-[9px] uppercase tracking-wider text-muted-foreground md:grid">
        <span>Procedure</span>
        <span>Service date</span>
        <span className="text-right">Your estimate</span>
      </div>
      <div className="divide-y divide-border">
        {procedures.map((procedure) => (
          <ProcedureCard
            key={procedure.id}
            procedure={procedure}
            date={schedule[procedure.id]}
            receipt={receipts.find((item) => item.procedureId === procedure.id)}
            onDate={(date) => onDate(procedure.id, date)}
            onInspect={onInspect}
          />
        ))}
      </div>
    </Card>
  );
}
