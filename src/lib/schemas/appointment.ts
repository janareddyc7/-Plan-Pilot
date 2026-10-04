import { z } from "zod";

export const appointmentSchema = z.object({
  id: z.uuid(),
  providerName: z.string().trim().min(2).max(160),
  providerAddress: z.string().trim().max(300).default(""),
  providerPhone: z.string().trim().max(40).default(""),
  date: z.iso.date(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  status: z.enum(["planned", "requested", "confirmed"]),
  note: z.string().trim().max(500).default(""),
});

export type Appointment = z.infer<typeof appointmentSchema>;
