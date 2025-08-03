import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

// Date validation schema
const dateSchema = z.string().datetime("Invalid date format");

// Microchip validation schema (exactly 15 digits)
const microchipSchema = z
  .string()
  .regex(/^\d{15}$/, "Microchip number must be exactly 15 digits");

// Dog gender validation
const dogGenderSchema = z.enum(["male", "female"], {
  errorMap: () => ({ message: "Gender must be 'male' or 'female'" }),
});

// Owner relationship schema
const ownerRelationshipSchema = z.object({
  id: uuidSchema,
  is_primary: z.boolean(),
});

// Schema for creating dogs
export const createDogSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name cannot exceed 100 characters"),
    breed_id: uuidSchema,
    gender: dogGenderSchema,
    birth_date: dateSchema,
    microchip_number: microchipSchema,
    kennel_club_number: z.string().optional(),
    kennel_name: z.string().max(100).optional(),
    father_name: z.string().max(100).optional(),
    mother_name: z.string().max(100).optional(),
    owners: z
      .array(ownerRelationshipSchema)
      .min(1, "At least one owner is required")
      .refine((owners) => owners.some((owner) => owner.is_primary), {
        message: "At least one primary owner is required",
        path: ["owners"],
      }),
  })
  .refine(
    (data) => {
      const birthDate = new Date(data.birth_date);
      const now = new Date();
      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 20);

      return birthDate <= now && birthDate >= maxAge;
    },
    {
      message: "Birth date must be in the past and not more than 20 years ago",
      path: ["birth_date"],
    },
  );

// Schema for updating dogs
export const updateDogSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  kennel_name: z.string().max(100).optional(),
  father_name: z.string().max(100).optional(),
  mother_name: z.string().max(100).optional(),
});

// Schema for dog query parameters
export const dogQuerySchema = z.object({
  breed_id: uuidSchema.optional(),
  gender: dogGenderSchema.optional(),
  owner_id: uuidSchema.optional(),
  microchip_number: microchipSchema.optional(),
  kennel_club_number: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Schema for dog ID validation
export const dogIdSchema = uuidSchema;

// Type exports
export type CreateDogInput = z.infer<typeof createDogSchema>;
export type UpdateDogInput = z.infer<typeof updateDogSchema>;
export type DogQueryInput = z.infer<typeof dogQuerySchema>;
