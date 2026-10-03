import type { OptimizationResult } from "@/lib/optimization/optimizer";
import { Card } from "@/components/ui/card";
const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export function CostComparison({
  optimization,
}: {
  optimization?: OptimizationResult;
}) {
  return (
    <Card className="p-5">
      <h2 className="text-xs font-medium">Schedule comparison</h2>
      {optimization ? (
        <>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              [
                "Before",
                optimization.baseline.calculation!.totals.patientPaymentCents,
              ],
              [
                "Recommended",
                optimization.optimized.calculation!.totals.patientPaymentCents,
              ],
              ["Potential savings", optimization.savingsCents],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="mt-2 text-xl font-medium tabular-nums">
                  {money(Number(value))}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
            {optimization.savingsCents === 0
              ? "Your current schedule is already as cost-effective as the alternatives checked."
              : "Review the recommended dates before applying the schedule."}
          </p>
        </>
      ) : (
        <p className="mt-4 text-xs leading-6 text-muted-foreground">
          Compare approved treatment dates to see whether a different schedule
          changes your estimated cost.
        </p>
      )}
    </Card>
  );
}
