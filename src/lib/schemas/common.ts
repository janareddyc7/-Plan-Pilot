import { z } from "zod";
export const centsSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
export const percentSchema = z.number().int().min(0).max(100);
export const dateSchema = z.iso.date();
export const serviceClassSchema = z.enum(["preventive", "basic", "major"]);
export const sourceSchema = z
  .object({
    source: z.enum(["manual", "document", "synthetic", "assumption"]),
    documentId: z.uuid().optional(),
    page: z.number().int().positive().optional(),
    quote: z.string().optional(),
    note: z.string(),
  })
  .strict();
export const classFlagsSchema = z
  .object({ preventive: z.boolean(), basic: z.boolean(), major: z.boolean() })
  .strict();
