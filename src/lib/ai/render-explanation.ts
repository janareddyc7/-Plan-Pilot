import type { ClaimReceipt, FinancialExplanation } from "@/lib/schemas";

export interface RenderedExplanationLine {
  receiptId: string;
  template: FinancialExplanation["lines"][number]["template"];
  field: FinancialExplanation["lines"][number]["field"];
  text: string;
}

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export function renderFinancialExplanation(
  explanation: FinancialExplanation,
  receipts: ClaimReceipt[],
): RenderedExplanationLine[] {
  const byId = new Map(receipts.map((receipt) => [receipt.id, receipt]));
  return explanation.lines.flatMap((line) => {
    const receipt = byId.get(line.receiptId);
    if (!receipt) return [];
    const amount = receipt[line.field];
    const text = {
      "patient-responsibility": `The estimated patient responsibility is ${money(amount)} after the plan rules in this receipt.`,
      "insurer-contribution": `The plan contribution shown by the engine is ${money(amount)}.`,
      "deductible-applied": `The claim applies ${money(amount)} toward the remaining deductible.`,
      "annual-maximum-cap": `The annual maximum reduces the tentative plan payment by ${money(amount)}.`,
    }[line.template];
    return [{ ...line, text }];
  });
}

export function fallbackFinancialExplanation(receipts: ClaimReceipt[]): RenderedExplanationLine[] {
  const first = receipts[0];
  if (!first) return [];
  return renderFinancialExplanation(
    {
      lines: [
        { template: "patient-responsibility", receiptId: first.id, field: "patientPayment" },
        { template: "insurer-contribution", receiptId: first.id, field: "finalInsurerPayment" },
      ],
    },
    receipts,
  );
}

