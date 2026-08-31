import { z } from "zod";

export const schedulePayloadSchema = z.object({
  schedules: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      isActive: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      lunchStart: z.string().optional().nullable(),
      lunchEnd: z.string().optional().nullable(),
      gapMinutes: z.coerce.number().min(0).max(120).default(15),
    })
  ),
});

export const blockedTimePayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  startDate: z.union([
    z.string().datetime(),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ]),
  endDate: z.union([
    z.string().datetime(),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ]),
  isAllDay: z.boolean().default(true),
  reason: z.string().optional(),
});
