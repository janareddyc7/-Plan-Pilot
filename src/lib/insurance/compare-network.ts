import { z } from "zod";
import { calculateClaims } from "./claims";
import type { DentalPlan, Procedure, Schedule } from "@/lib/schemas";

export const providerQuoteSchema = z.object({
  billedFeeCents: z.number().int().nonnegative().safe(),
  allowedFeeCents: z.number().int().nonnegative().safe(),
}).refine((quote) => quote.allowedFeeCents <= quote.billedFeeCents, { message: "The allowed amount cannot exceed the billed fee." });
export type ProviderQuote = z.infer<typeof providerQuoteSchema>;

export function compareNetworkQuotes(input: {
  plan: DentalPlan;
  procedures: Procedure[];
  schedule: Schedule;
  procedureId: string;
  inNetwork: ProviderQuote;
  outOfNetwork: ProviderQuote;
}) {
  const selected = input.procedures.find((item) => item.id === input.procedureId);
  if (!selected) throw new Error("Choose a procedure from your plan.");
  const inside = providerQuoteSchema.parse(input.inNetwork);
  const outside = providerQuoteSchema.parse(input.outOfNetwork);
  const calculate = (networkStatus: Procedure["networkStatus"], quote: ProviderQuote) => {
    const procedures = input.procedures.map((item) => item.id === selected.id ? {
      ...item,
      networkStatus,
      estimatedBilledFeeCents: quote.billedFeeCents,
      estimatedAllowedFeeCents: quote.allowedFeeCents,
    } : item);
    const result = calculateClaims({ plan: input.plan, procedures, schedule: input.schedule });
    const receipt = result.receipts.find((item) => item.procedureId === selected.id)!;
    return { receipt, totals: result.totals, warnings: result.warnings };
  };
  const inNetwork = calculate("in-network", inside);
  const outOfNetwork = calculate("out-of-network", outside);
  return {
    inNetwork,
    outOfNetwork,
    patientDifferenceCents: outOfNetwork.totals.patientPaymentCents - inNetwork.totals.patientPaymentCents,
  };
}
