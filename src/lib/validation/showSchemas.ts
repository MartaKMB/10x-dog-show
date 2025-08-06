import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

// Date validation schema
const dateSchema = z.string().datetime("Invalid date format");

// Main schema for creating shows (uproszczony dla klubu hovawartów)
export const createShowSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(200, "Name cannot exceed 200 characters"),
    show_date: dateSchema,
    registration_deadline: dateSchema,
    location: z
      .string()
      .min(1, "Location is required")
      .max(500, "Location cannot exceed 500 characters"),
    judge_name: z
      .string()
      .min(1, "Judge name is required")
      .max(200, "Judge name cannot exceed 200 characters"),
    description: z.string().optional(),
    max_participants: z.number().int().positive().optional(),
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
    location: z.string().min(1).max(500).optional(),
    judge_name: z.string().min(1).max(200).optional(),
    max_participants: z.number().int().positive().optional(),
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

// Schema for show query parameters (uproszczony)
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
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Schema for updating show status
export const updateShowStatusSchema = z.object({
  status: z.enum([
    "draft",
    "open_for_registration",
    "registration_closed",
    "in_progress",
    "completed",
    "cancelled",
  ]),
});

// Schema for creating registrations (uproszczony)
export const createRegistrationSchema = z.object({
  dog_id: uuidSchema,
  dog_class: z.enum([
    "baby",
    "puppy",
    "junior",
    "intermediate",
    "open",
    "working",
    "champion",
    "veteran",
  ]),
});

// Schema for updating registrations
export const updateRegistrationSchema = z.object({
  dog_class: z
    .enum([
      "baby",
      "puppy",
      "junior",
      "intermediate",
      "open",
      "working",
      "champion",
      "veteran",
    ])
    .optional(),
});

// Schema for registration query parameters
export const registrationQuerySchema = z.object({
  dog_class: z
    .enum([
      "baby",
      "puppy",
      "junior",
      "intermediate",
      "open",
      "working",
      "champion",
      "veteran",
    ])
    .optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Type exports
export type CreateShowInput = z.infer<typeof createShowSchema>;
export type UpdateShowInput = z.infer<typeof updateShowSchema>;
export type ShowQueryInput = z.infer<typeof showQuerySchema>;
export type UpdateShowStatusInput = z.infer<typeof updateShowStatusSchema>;
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type RegistrationQueryInput = z.infer<typeof registrationQuerySchema>;
