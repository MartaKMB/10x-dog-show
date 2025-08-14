import { z } from "zod";

// Identifier schema
export const ownerIdSchema = z.string().uuid("Invalid owner ID format");

// Email validation schema
const emailSchema = z
  .string()
  .email("Invalid email format")
  .max(255, "Email cannot exceed 255 characters");

// Main schema for creating owners (uproszczony dla klubu hovawartów)
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
    phone: z.string().max(20).nullable().optional(),
    address: z
      .string()
      .max(500, "Address cannot exceed 500 characters")
      .nullable()
      .optional(),
    city: z
      .string()
      .max(100, "City cannot exceed 100 characters")
      .nullable()
      .optional(),
    postal_code: z.string().max(20).nullable().optional(),
    kennel_name: z.string().max(200).nullable().optional(),
    gdpr_consent: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.gdpr_consent) {
        return true;
      }
      return false;
    },
    {
      message: "GDPR consent is required",
      path: ["gdpr_consent"],
    },
  );

// Schema for updating owners
export const updateOwnerSchema = z.object({
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  kennel_name: z.string().max(200).optional(),
});

// Schema for owner query parameters
export const ownerQuerySchema = z.object({
  email: z.string().optional(),
  city: z.string().optional(),
  kennel_name: z.string().optional(),
  gdpr_consent: z.boolean().optional(),
  search: z.string().max(100).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Schema for GDPR consent
export const gdprConsentSchema = z.object({
  consent_given: z.boolean(),
});

// Type exports
export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;
export type UpdateOwnerInput = z.infer<typeof updateOwnerSchema>;
export type OwnerQueryInput = z.infer<typeof ownerQuerySchema>;
export type GdprConsentInput = z.infer<typeof gdprConsentSchema>;
