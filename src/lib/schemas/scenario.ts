import { z } from "zod";
import { centsSchema, dateSchema, percentSchema, sourceSchema } from "./common";
import { dentalPlanSchema } from "./plan";
import { procedureSchema, scheduleSchema } from "./procedure";
export const receiptMoneyFields = [
  "billedFee",
  "allowedAmount",
  "networkWriteOff",
  "outOfNetworkGap",
  "deductibleRemainingBefore",
  "deductibleApplied",
  "deductibleRemainingAfter",
  "coveredBase",
  "tentativeInsurerPayment",
  "annualMaximumRemainingBefore",
  "annualMaxCapReduction",
  "finalInsurerPayment",
  "patientPayment",
  "annualMaximumRemainingAfter",
] as const;
export const receiptFieldSchema = z.enum(receiptMoneyFields);
export const claimReceiptSchema = z
  .object({
    id: z.uuid(),
    procedureId: z.uuid(),
    date: dateSchema,
    benefitYear: dateSchema,
    billedFee: centsSchema,
    allowedAmount: centsSchema,
    networkWriteOff: centsSchema,
    outOfNetworkGap: centsSchema,
    deductibleRemainingBefore: centsSchema,
    deductibleApplied: centsSchema,
    deductibleRemainingAfter: centsSchema,
    coveredBase: centsSchema,
    coveragePercent: percentSchema,
    tentativeInsurerPayment: centsSchema,
    annualMaximumRemainingBefore: centsSchema,
    annualMaxCapReduction: centsSchema,
    finalInsurerPayment: centsSchema,
    patientPayment: centsSchema,
    annualMaximumRemainingAfter: centsSchema,
    figureIds: z.record(receiptFieldSchema, z.string().min(1)),
    provenance: z.record(z.string(), sourceSchema),
    assumptions: z.array(z.string()),
  })
  .strict();
export const scenarioSchema = z
  .object({
    id: z.uuid(),
    planSnapshot: dentalPlanSchema,
    procedureSnapshots: z.array(procedureSchema),
    originalSchedule: scheduleSchema,
    currentSchedule: scheduleSchema,
    optimizedSchedule: scheduleSchema.optional(),
    claimReceipts: z.array(claimReceiptSchema),
    summary: z
      .object({
        patientPaymentCents: centsSchema,
        insurerPaymentCents: centsSchema,
        billedFeeCents: centsSchema,
        networkWriteOffCents: centsSchema,
      })
      .strict(),
    potentialSavingsCents: z.number().int().optional(),
    timestamp: z.iso.datetime(),
    provenance: z.array(sourceSchema),
    validationWarnings: z.array(z.string()),
  })
  .strict();
export type ClaimReceipt = z.infer<typeof claimReceiptSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
