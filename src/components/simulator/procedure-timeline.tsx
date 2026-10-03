"use client";
import type { ClaimReceipt, Procedure, Schedule } from "@/lib/schemas";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProcedureCard } from "./procedure-card";
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
