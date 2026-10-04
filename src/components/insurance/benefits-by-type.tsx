import { CheckCircle2, CircleHelp, Layers3 } from "lucide-react";
import type { ClaimReceipt, DentalPlan, Procedure } from "@/lib/schemas";
import { summarizeBenefitsByType } from "@/lib/insurance/benefit-breakdown";
import { Card } from "@/components/ui/card";

type ServiceClass = Procedure["serviceClass"];

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

const labels: Record<ServiceClass, { title: string; description: string }> = {
  preventive: { title: "Preventive", description: "Exams, cleanings, and routine X-rays" },
  basic: { title: "Basic", description: "Fillings and common restorative care" },
  major: { title: "Major", description: "Crowns, bridges, and complex care" },
};

export function BenefitsByType({
  plan,
  procedures,
  receipts,
}: {
  plan: DentalPlan;
  procedures: Procedure[];
  receipts: ClaimReceipt[];
}) {
  const breakdown = summarizeBenefitsByType(plan, procedures, receipts);
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary">
              <Layers3 size={13} /> Benefits by type
            </p>
            <h2 className="mt-2 font-serif text-xl">See what each category is doing.</h2>
            <p className="mt-2 max-w-2xl text-[11px] leading-5 text-muted-foreground">
              Coverage rules and modeled care are grouped by service class. Your annual maximum remains one shared plan balance.
            </p>
          </div>
          <CircleHelp className="hidden shrink-0 text-muted-foreground sm:block" size={16} />
        </div>
      </div>
      <div className="divide-y divide-border">
        {breakdown.map((item) => {
          const copy = labels[item.serviceClass];
          return (
            <div key={item.serviceClass} className="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className={item.procedureCount ? "text-primary" : "text-muted-foreground/50"} />
                  <p className="text-xs font-medium">{copy.title}</p>
                  <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                    {item.coveragePercent}% coverage
                  </span>
                </div>
                <p className="mt-1 pl-6 text-[10px] text-muted-foreground">{copy.description}</p>
                <div className="mt-2 pl-6" aria-label={`${copy.title} coverage ${item.coveragePercent}%`}>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${item.coveragePercent}%` }} />
                  </div>
                </div>
                <div className="mt-2 pl-6 text-[10px] text-muted-foreground">
                  {item.procedureCount ? `${item.procedureCount} modeled ${item.procedureCount === 1 ? "procedure" : "procedures"} · ${money(item.billedFeeCents)} billed` : "No modeled care yet"}
                </div>
              </div>
              <div className="pl-6 sm:pl-0 sm:text-right">
                <p className="text-[10px] text-muted-foreground">Plan pays</p>
                <p className="mt-1 text-sm font-medium tabular-nums">{money(item.insurerPaymentCents)}</p>
              </div>
              <div className="pl-6 sm:pl-0 sm:text-right">
                <p className="text-[10px] text-muted-foreground">You pay</p>
                <p className="mt-1 text-sm font-medium tabular-nums">{money(item.patientPaymentCents)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 border-t border-border bg-muted/30 px-5 py-3 text-[10px] leading-5 text-muted-foreground">
        <CircleHelp size={13} className="mt-0.5 shrink-0" />
        <p>Unused benefits are tracked against the shared annual maximum above; this panel does not invent separate preventive, basic, or major caps.</p>
      </div>
    </Card>
  );
}
