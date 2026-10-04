import type { ClaimReceipt, DentalPlan, Procedure } from "@/lib/schemas";

type ServiceClass = Procedure["serviceClass"];

export interface BenefitTypeBreakdown {
  serviceClass: ServiceClass;
  procedureCount: number;
  billedFeeCents: number;
  insurerPaymentCents: number;
  patientPaymentCents: number;
  coveragePercent: number;
}

const serviceClasses: ServiceClass[] = ["preventive", "basic", "major"];

/**
 * Summarizes modeled care by service class without creating category-specific
 * annual maximums that the plan did not provide.
 */
export function summarizeBenefitsByType(
  plan: DentalPlan,
  procedures: Procedure[],
  receipts: ClaimReceipt[],
): BenefitTypeBreakdown[] {
  const procedureById = new Map(procedures.map((procedure) => [procedure.id, procedure]));
  return serviceClasses.map((serviceClass) => {
    const classReceipts = receipts.filter(
      (receipt) => procedureById.get(receipt.procedureId)?.serviceClass === serviceClass,
    );
    return {
      serviceClass,
      procedureCount: classReceipts.length,
      billedFeeCents: classReceipts.reduce((sum, receipt) => sum + receipt.billedFee, 0),
      insurerPaymentCents: classReceipts.reduce((sum, receipt) => sum + receipt.finalInsurerPayment, 0),
      patientPaymentCents: classReceipts.reduce((sum, receipt) => sum + receipt.patientPayment, 0),
      coveragePercent: plan.coverageByClass[serviceClass],
    };
  });
}
