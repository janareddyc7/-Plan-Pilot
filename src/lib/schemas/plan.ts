import { z } from "zod";
import {
  centsSchema,
  percentSchema,
  dateSchema,
  sourceSchema,
  classFlagsSchema,
  serviceClassSchema,
} from "./common";

export const waitingPeriodRuleSchema = z
  .object({
    serviceClass: serviceClassSchema,
    eligibleFrom: dateSchema,
  })
  .strict();

/**
 * A frequency rule is intentionally explicit about the measurement window.
 * `usedDates` contains dates already used before the workspace was created;
 * planned procedures are added by the claims engine as it evaluates a schedule.
 */
export const frequencyLimitRuleSchema = z
  .object({
    serviceClass: serviceClassSchema,
    procedureCode: z.string().trim().min(1).max(20).optional(),
    maxUses: z.number().int().positive().max(100),
    periodMonths: z.number().int().positive().max(120),
    usedDates: z.array(dateSchema).max(100),
  })
  .strict();

export const unknownPlanFieldSchema = z
  .object({
    field: z.enum([
      "annualMaximumCents",
      "individualDeductibleCents",
      "coverageByClass.major",
      "coverageByClass.basic",
    ]),
    plausibleValues: z.array(z.number().nonnegative()).min(1),
    whyUnknown: z.string(),
    source: sourceSchema.optional(),
    impactScore: z.number().nonnegative().optional(),
    worstCaseRegretCents: centsSchema.optional(),
    sensitivityCents: centsSchema.optional(),
    question: z.string(),
  })
  .strict();
export const dentalPlanSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid().optional(),
    name: z.string().min(1).max(200),
    planType: z.literal("PPO"),
    benefitYearStartMonth: z.number().int().min(1).max(12),
    benefitYearStartDay: z.number().int().min(1).max(31),
    usageAsOfDate: dateSchema,
    annualMaximumCents: centsSchema,
    alreadyUsedMaximumCents: centsSchema,
    individualDeductibleCents: centsSchema,
    alreadyUsedDeductibleCents: centsSchema,
    deductibleAppliesTo: classFlagsSchema,
    coverageByClass: z
      .object({
        preventive: percentSchema,
        basic: percentSchema,
        major: percentSchema,
      })
      .strict(),
    networkRules: z
      .object({
        outOfNetworkBalanceBilling: z.boolean(),
        allowedAmountPolicy: z.enum([
          "explicit",
          "billed-as-allowed-confirmed",
        ]),
      })
      .strict()
      .optional(),
    waitingPeriods: z.array(waitingPeriodRuleSchema).optional(),
    frequencyLimits: z.array(frequencyLimitRuleSchema).optional(),
    preventiveCountsTowardMax: z.boolean(),
    sourceDocumentId: z.uuid().optional(),
    isConfirmed: z.boolean(),
    fieldProvenance: z.record(z.string(), sourceSchema),
    unknownFields: z.array(unknownPlanFieldSchema),
  })
  .strict()
  .superRefine((plan, ctx) => {
    const date = new Date(
      Date.UTC(2001, plan.benefitYearStartMonth - 1, plan.benefitYearStartDay),
    );
    if (date.getUTCMonth() !== plan.benefitYearStartMonth - 1)
      ctx.addIssue({
        code: "custom",
        path: ["benefitYearStartDay"],
        message: "Use a renewal date that exists every year.",
      });
    if (plan.alreadyUsedMaximumCents > plan.annualMaximumCents)
      ctx.addIssue({
        code: "custom",
        path: ["alreadyUsedMaximumCents"],
        message: "Usage cannot exceed the annual maximum.",
      });
    if (plan.alreadyUsedDeductibleCents > plan.individualDeductibleCents)
      ctx.addIssue({
        code: "custom",
        path: ["alreadyUsedDeductibleCents"],
        message: "Deductible usage exceeds the deductible.",
      });
  });
export type DentalPlan = z.infer<typeof dentalPlanSchema>;
export type UnknownPlanField = z.infer<typeof unknownPlanFieldSchema>;
