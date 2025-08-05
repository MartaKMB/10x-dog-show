import { z } from "zod";

// Boolean validation schema
const booleanSchema = z
  .string()
  .optional()
  .transform((val) => {
    if (val === undefined) return undefined;
    if (val === "true") return true;
    if (val === "false") return false;
    throw new Error("Invalid boolean value");
  });

// Region validation schema (sanitized for SQL injection prevention)
const regionSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      // Allow alphanumeric characters, spaces, Polish characters, and common punctuation
      return /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s\-.]+$/.test(val);
    },
    {
      message: "Region contains invalid characters",
    },
  );

// Pagination validation schemas
const pageSchema = z
  .string()
  .optional()
  .transform((val) => {
    const page = val ? parseInt(val, 10) : 1;
    if (isNaN(page) || page < 1) {
      throw new Error("Page must be a positive integer");
    }
    return page;
  });

const limitSchema = z
  .string()
  .optional()
  .transform((val) => {
    const limit = val ? parseInt(val, 10) : 20;
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }
    return limit;
  });

// Schema for branch query parameters
export const branchQuerySchema = z.object({
  region: regionSchema,
  is_active: booleanSchema,
  page: pageSchema,
  limit: limitSchema,
});

// Schema for branch response validation
export const branchResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  address: z.string().nullable(),
  city: z.string().max(100).nullable(),
  postal_code: z.string().max(20).nullable(),
  region: z.string().min(1).max(100),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Schema for branches list response validation
export const branchesListResponseSchema = z.object({
  branches: z.array(branchResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

// Type exports
export type BranchQueryInput = z.infer<typeof branchQuerySchema>; 
