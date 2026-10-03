import { z } from "zod";
import { centsSchema, percentSchema, sourceSchema } from "./common";
import { receiptFieldSchema } from "./scenario";
export const aiExtractionResultSchema = z
  .object({
    extractedPlanData: z
      .object({
        name: z.string().optional(),
        annualMaximumCents: centsSchema.optional(),
        individualDeductibleCents: centsSchema.optional(),
        coverageByClass: z
          .object({
            preventive: percentSchema.optional(),
            basic: percentSchema.optional(),
            major: percentSchema.optional(),
          })
          .strict()
          .optional(),
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
export type FinancialExplanation = z.infer<typeof financialExplanationSchema>;
