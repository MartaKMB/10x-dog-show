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
    branch_id: uuidSchema,
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
  branch_id: z.string().uuid().optional(),
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

// Schema for creating registrations
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
  registration_fee: z.number().positive().optional(),
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
  is_paid: z.boolean().optional(),
});

// Schema for updating payment status
export const updatePaymentStatusSchema = z.object({
  is_paid: z.boolean(),
  payment_date: z.string().datetime().optional(),
  payment_method: z.string().max(50).optional(),
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
  is_paid: z.boolean().optional(),
  breed_id: z.string().uuid().optional(),
  gender: z.enum(["male", "female"]).optional(),
  search: z.string().max(100).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Type inference for validated data
export type CreateShowInput = z.infer<typeof createShowSchema>;
export type UpdateShowInput = z.infer<typeof updateShowSchema>;
export type ShowQueryInput = z.infer<typeof showQuerySchema>;
export type UpdateShowStatusInput = z.infer<typeof updateShowStatusSchema>;
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type UpdatePaymentStatusInput = z.infer<
  typeof updatePaymentStatusSchema
>;
export type RegistrationQueryInput = z.infer<typeof registrationQuerySchema>;
