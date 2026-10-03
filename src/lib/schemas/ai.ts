import { z } from "zod";
import {
  centsSchema,
  percentSchema,
  sourceSchema,
  classFlagsSchema,
  dateSchema,
  serviceClassSchema,
} from "./common";
import { receiptFieldSchema } from "./scenario";

const planNetworkRulesSchema = z
  .object({
    outOfNetworkBalanceBilling: z.boolean().optional(),
    allowedAmountPolicy: z
      .enum(["explicit", "billed-as-allowed-confirmed"])
      .optional(),
  })
  .strict();

const waitingPeriodSchema = z
  .object({
    serviceClass: serviceClassSchema,
    eligibleFrom: dateSchema,
  })
  .strict();

/**
 * The model receives monetary values as printed strings. Code converts only
 * an unambiguous dollar string to integer cents; the model never calculates
 * coverage or patient responsibility.
 */
export const aiRawExtractionResultSchema = z
  .object({
    extractedPlanData: z
      .object({
        name: z.string().min(1).max(200).optional(),
        annualMaximum: z.string().min(1).max(80).optional(),
        alreadyUsedMaximum: z.string().min(1).max(80).optional(),
        individualDeductible: z.string().min(1).max(80).optional(),
        alreadyUsedDeductible: z.string().min(1).max(80).optional(),
        coverageByClass: z
          .object({
            preventive: percentSchema.optional(),
            basic: percentSchema.optional(),
            major: percentSchema.optional(),
          })
          .strict()
          .optional(),
        deductibleAppliesTo: classFlagsSchema.optional(),
        networkRules: planNetworkRulesSchema.optional(),
        waitingPeriods: z.array(waitingPeriodSchema).optional(),
        benefitYearStartMonth: z.number().int().min(1).max(12).optional(),
        benefitYearStartDay: z.number().int().min(1).max(31).optional(),
        preventiveCountsTowardMax: z.boolean().optional(),
      })
      .strict(),
    fields: z.array(
      z
        .object({
          field: z.string().min(1).max(120),
          confidence: z.enum(["high", "medium", "low", "unknown"]),
          uncertainty: z.string().max(500).optional(),
          source: sourceSchema.optional(),
        })
        .strict(),
    ),
    unresolvedItems: z.array(z.string().max(500)),
  })
  .strict();

export const aiExtractionResultSchema = z
  .object({
    extractedPlanData: z
      .object({
        name: z.string().optional(),
        annualMaximumCents: centsSchema.optional(),
        alreadyUsedMaximumCents: centsSchema.optional(),
        individualDeductibleCents: centsSchema.optional(),
        alreadyUsedDeductibleCents: centsSchema.optional(),
        coverageByClass: z
          .object({
            preventive: percentSchema.optional(),
            basic: percentSchema.optional(),
            major: percentSchema.optional(),
          })
          .strict()
          .optional(),
        deductibleAppliesTo: classFlagsSchema.optional(),
        networkRules: planNetworkRulesSchema.optional(),
        waitingPeriods: z.array(waitingPeriodSchema).optional(),
        benefitYearStartMonth: z.number().int().min(1).max(12).optional(),
        benefitYearStartDay: z.number().int().min(1).max(31).optional(),
        preventiveCountsTowardMax: z.boolean().optional(),
      })
      .strict(),
    fields: z.array(
      z
        .object({
          field: z.string(),
          confidence: z.enum(["high", "medium", "low", "unknown"]),
          uncertainty: z.string().optional(),
          source: sourceSchema.optional(),
        })
        .strict(),
    ),
    unresolvedItems: z.array(z.string()),
    isConfirmed: z.literal(false),
  })
  .strict();
// Restrict prose to approved semantic templates. Resolve all referenced amounts from receipts.
export const financialExplanationSchema = z
  .object({
    lines: z.array(
      z
        .object({
          template: z.enum([
            "patient-responsibility",
            "insurer-contribution",
            "deductible-applied",
            "annual-maximum-cap",
          ]),
          receiptId: z.uuid(),
          field: receiptFieldSchema,
        })
        .strict(),
    ),
  })
  .strict();
export type AiExtractionResult = z.infer<typeof aiExtractionResultSchema>;
export type AiRawExtractionResult = z.infer<
  typeof aiRawExtractionResultSchema
>;
export type FinancialExplanation = z.infer<typeof financialExplanationSchema>;
