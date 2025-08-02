import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

// Date validation schema
const dateSchema = z.string().datetime("Invalid date format");

// Main schema for creating shows
export const createShowSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(200, "Name cannot exceed 200 characters"),
    show_type: z.enum(["national", "international"], {
      errorMap: () => ({
        message: "Show type must be 'national' or 'international'",
      }),
    }),
    show_date: dateSchema,
    registration_deadline: dateSchema,
    venue_id: uuidSchema,
    language: z.enum(["pl", "en"], {
      errorMap: () => ({ message: "Language must be 'pl' or 'en'" }),
    }),
    max_participants: z.number().int().positive().optional(),
    entry_fee: z.number().positive().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      const showDate = new Date(data.show_date);
      const registrationDeadline = new Date(data.registration_deadline);
      return registrationDeadline <= showDate;
    },
    {
      message: "Registration deadline must be before or equal to show date",
      path: ["registration_deadline"],
    },
  );

// Schema for updating shows
export const updateShowSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    show_date: dateSchema.optional(),
    registration_deadline: dateSchema.optional(),
    max_participants: z.number().int().positive().optional(),
    entry_fee: z.number().positive().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.show_date && data.registration_deadline) {
        const showDate = new Date(data.show_date);
        const registrationDeadline = new Date(data.registration_deadline);
        return registrationDeadline <= showDate;
      }
      return true;
    },
    {
      message: "Registration deadline must be before or equal to show date",
      path: ["registration_deadline"],
    },
  );

// Schema for show query parameters
export const showQuerySchema = z.object({
  status: z
    .enum([
      "draft",
      "open_for_registration",
      "registration_closed",
      "in_progress",
      "completed",
      "cancelled",
    ])
    .optional(),
  show_type: z.enum(["national", "international"]).optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  organizer_id: z.string().uuid().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Type inference for validated data
export type CreateShowInput = z.infer<typeof createShowSchema>;
export type UpdateShowInput = z.infer<typeof updateShowSchema>;
export type ShowQueryInput = z.infer<typeof showQuerySchema>;
