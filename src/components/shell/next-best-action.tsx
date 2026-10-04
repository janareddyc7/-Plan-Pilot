"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { OptimizationResult } from "@/lib/optimization/optimizer";

export function NextBestAction({
  procedureCount,
  optimization,
  onOptimize,
  onReview,
}: {
  procedureCount: number;
  optimization?: OptimizationResult;
  onOptimize: () => void;
  onReview: () => void;
}) {
  if (procedureCount === 0) {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-4 border-primary/25 bg-secondary/25 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><Sparkles size={15} /></div>
          <div><p className="text-xs font-medium">Next: add the care you are considering</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Add a dentist quote and approved dates to unlock receipts and schedule comparisons.</p></div>
        </div>
        <Button asChild variant="outline"><Link href="/app/plans">Add a procedure <ArrowRight size={13} /></Link></Button>
      </Card>
    );
  }
  if (!optimization) {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-4 border-primary/25 bg-secondary/25 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><Sparkles size={15} /></div>
          <div><p className="text-xs font-medium">Next: compare approved dates</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">PlanPilot will test your dentist-approved windows against the current schedule.</p></div>
        </div>
        <Button onClick={onOptimize}>Compare schedules <ArrowRight size={13} /></Button>
      </Card>
    );
  }
  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 border-primary/25 bg-secondary/25 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><Check size={15} /></div>
        <div><p className="text-xs font-medium">Next: review the recommended schedule</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Check the dates and receipt details before applying or saving the recommendation.</p></div>
      </div>
      <Button variant="outline" onClick={onReview}>Review recommendation <ArrowRight size={13} /></Button>
    </Card>
  );
}
