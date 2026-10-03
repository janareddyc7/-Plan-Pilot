import { z } from "zod";
import {
  centsSchema,
  dateSchema,
  percentSchema,
  serviceClassSchema,
} from "./common";
export const procedureSchema = z
  .object({
    id: z.uuid(),
    name: z.string().min(1).max(200),
    code: z.string().optional(),
    serviceClass: serviceClassSchema,
    estimatedBilledFeeCents: centsSchema,
    estimatedAllowedFeeCents: centsSchema.optional(),
    networkStatus: z.enum(["in-network", "out-of-network"]),
    earliestDate: dateSchema,
    dentistApprovedLatestDate: dateSchema.optional(),
    fixedDate: dateSchema.optional(),
    urgent: z.boolean(),
    isFlexible: z.boolean(),
    requiresProcedureIds: z.array(z.uuid()),
    serviceDatePolicy: z
      .enum(["completion", "seat", "start", "unknown"])
      .optional(),
    notes: z.string(),
    planRuleOverrides: z
      .object({
        coveragePercent: percentSchema.optional(),
        deductibleApplies: z.boolean().optional(),
        covered: z.boolean().optional(),
        reason: z.string().min(1),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (
      p.dentistApprovedLatestDate &&
      p.dentistApprovedLatestDate < p.earliestDate
    )
      ctx.addIssue({
        code: "custom",
        path: ["dentistApprovedLatestDate"],
        message: "Latest date must follow earliest date.",
      });
    if (
      p.fixedDate &&
      (p.fixedDate < p.earliestDate ||
        (p.dentistApprovedLatestDate &&
          p.fixedDate > p.dentistApprovedLatestDate))
    )
      ctx.addIssue({
        code: "custom",
        path: ["fixedDate"],
        message: "Fixed date must fall inside the approved window.",
      });
    if (p.requiresProcedureIds.includes(p.id))
      ctx.addIssue({
        code: "custom",
        path: ["requiresProcedureIds"],
        message: "A procedure cannot depend on itself.",
      });
    if (
      p.estimatedAllowedFeeCents !== undefined &&
      p.estimatedAllowedFeeCents > p.estimatedBilledFeeCents
    )
      ctx.addIssue({
        code: "custom",
        path: ["estimatedAllowedFeeCents"],
        message: "Allowed estimate must not exceed billed fee.",
      });
  });
export const scheduleSchema = z.record(z.uuid(), dateSchema);
export type Procedure = z.infer<typeof procedureSchema>;
export type Schedule = z.infer<typeof scheduleSchema>;
