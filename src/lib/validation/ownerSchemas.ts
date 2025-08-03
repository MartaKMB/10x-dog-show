import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

// Email validation schema (RFC 5322 compliant)
const emailSchema = z
  .string()
  .email("Invalid email format")
  .max(255, "Email cannot exceed 255 characters");

// Language validation schema
const languageSchema = z.enum(["pl", "en"], {
  errorMap: () => ({ message: "Language must be 'pl' or 'en'" }),
});

// Schema for creating owners
export const createOwnerSchema = z
  .object({
    first_name: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name cannot exceed 100 characters"),
    last_name: z
      .string()
      .min(1, "Last name is required")
      .max(100, "Last name cannot exceed 100 characters"),
    email: emailSchema,
    phone: z.string().max(20).optional(),
    address: z
      .string()
      .min(1, "Address is required")
      .max(255, "Address cannot exceed 255 characters"),
    city: z
      .string()
      .min(1, "City is required")
      .max(100, "City cannot exceed 100 characters"),
    postal_code: z.string().max(20).optional(),
    country: z
      .string()
      .min(1, "Country is required")
      .max(100, "Country cannot exceed 100 characters"),
    kennel_name: z.string().max(100).optional(),
    language: languageSchema,
    gdpr_consent: z.boolean(),
  })
  .refine(
    (data) => {
      // Validate that GDPR consent is given
      return data.gdpr_consent === true;
    },
    {
      message: "GDPR consent is required",
      path: ["gdpr_consent"],
    },
  );

// Schema for updating owners
export const updateOwnerSchema = z.object({
  phone: z.string().max(20).optional(),
  address: z.string().min(1).max(255).optional(),
  city: z.string().min(1).max(100).optional(),
  postal_code: z.string().max(20).optional(),
});

// Schema for owner query parameters
export const ownerQuerySchema = z.object({
  email: emailSchema.optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  gdpr_consent: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Schema for owner ID validation
export const ownerIdSchema = uuidSchema;

// Type exports
export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;
export type UpdateOwnerInput = z.infer<typeof updateOwnerSchema>;
export type OwnerQueryInput = z.infer<typeof ownerQuerySchema>;
