import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

// Date validation schema
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD");

// Main schema for creating dogs (uproszczony dla hovawartów)
export const createDogSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name cannot exceed 100 characters"),
    gender: z.enum(["male", "female"], {
      errorMap: () => ({
        message: "Gender must be 'male' or 'female'",
      }),
    }),
    birth_date: dateSchema,
    coat: z
      .enum(["czarny", "czarny_podpalany", "blond"], {
        errorMap: () => ({
          message: "Coat must be 'czarny', 'czarny_podpalany', or 'blond'",
        }),
      })
      .optional(),
    microchip_number: z
      .string()
      .regex(/^[0-9]{15}$/, "Microchip number must be exactly 15 digits")
      .nullable()
      .optional(),
    kennel_name: z
      .string()
      .min(1, "Kennel name is required")
      .max(200, "Kennel name cannot exceed 200 characters"),
    father_name: z.string().max(100).nullable().optional(),
    mother_name: z.string().max(100).nullable().optional(),
    owners: z
      .array(
        z.object({
          id: uuidSchema,
          is_primary: z.boolean(),
        }),
      )
      .min(1, "At least one owner is required"),
  })
  .refine(
    (data) => {
      const birthDate = new Date(data.birth_date);
      const now = new Date();
      return birthDate <= now;
    },
    {
      message: "Birth date must be in the past",
      path: ["birth_date"],
    },
  );

// Schema for updating dogs
export const updateDogSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  coat: z
    .enum(["czarny", "czarny_podpalany", "blond"], {
      errorMap: () => ({
        message: "Coat must be 'czarny', 'czarny_podpalany', or 'blond'",
      }),
    })
    .optional(),
  kennel_name: z
    .string()
    .min(1, "Kennel name is required")
    .max(200, "Kennel name cannot exceed 200 characters")
    .optional(),
  father_name: z.string().max(100).nullable().optional(),
  mother_name: z.string().max(100).nullable().optional(),
});

// Schema for dog query parameters
export const dogQuerySchema = z.object({
  gender: z.enum(["male", "female"]).optional(),
  coat: z.enum(["czarny", "czarny_podpalany", "blond"]).optional(),
  owner_id: uuidSchema.optional(),
  microchip_number: z.string().optional(),
  kennel_name: z.string().optional(),
  search: z.string().max(100).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Type exports
export type CreateDogInput = z.infer<typeof createDogSchema>;
export type UpdateDogInput = z.infer<typeof updateDogSchema>;
export type DogQueryInput = z.infer<typeof dogQuerySchema>;
