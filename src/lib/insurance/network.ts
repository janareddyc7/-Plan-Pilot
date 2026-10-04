import type { Procedure } from "@/lib/schemas";

export interface NetworkAmounts {
  billedFee: number;
  allowedAmount: number;
  networkWriteOff: number;
  outOfNetworkGap: number;
  warnings: string[];
}

export function resolveNetworkAmounts(procedure: Pick<Procedure, "estimatedBilledFeeCents" | "estimatedAllowedFeeCents" | "networkStatus">, outOfNetworkBalanceBilling = true): NetworkAmounts {
  const billedFee = procedure.estimatedBilledFeeCents;
  const allowedAmount = procedure.estimatedAllowedFeeCents ?? billedFee;
  const difference = Math.max(0, billedFee - allowedAmount);
  if (procedure.networkStatus === "in-network") {
    return { billedFee, allowedAmount, networkWriteOff: difference, outOfNetworkGap: 0, warnings: procedure.estimatedAllowedFeeCents === undefined ? ["Allowed fee was not supplied; billed fee is being used as a provisional allowed amount."] : [] };
  }
  return { billedFee, allowedAmount, networkWriteOff: outOfNetworkBalanceBilling ? 0 : difference, outOfNetworkGap: outOfNetworkBalanceBilling ? difference : 0, warnings: [
    ...(procedure.estimatedAllowedFeeCents === undefined ? ["Out-of-network allowed fee is unknown; billed fee is being used as a provisional allowed amount."] : []),
    ...(!outOfNetworkBalanceBilling && difference > 0 ? ["Assumes the out-of-network dentist will not bill above the allowed amount; verify this with the practice and insurer."] : []),
  ] };
}
