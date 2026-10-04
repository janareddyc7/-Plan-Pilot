import { z } from "zod";

export const careDescriptionSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  code: z.string().trim().max(20).optional(),
  serviceClass: z.enum(["preventive", "basic", "major"]).optional(),
  networkStatus: z.enum(["in-network", "out-of-network"]).optional(),
  billedFee: z.string().optional(),
  allowedFee: z.string().optional(),
}).strict();
export type CareDescription = z.infer<typeof careDescriptionSchema>;

export function statedMoneyToCents(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = value.trim().match(/^\$?\s*((?:\d+|\d{1,3}(?:,\d{3})+))(?:\.(\d{1,2}))?$/);
  if (!match) return undefined;
  const dollars = Number(match[1].replaceAll(",", ""));
  const cents = dollars * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : undefined;
}
