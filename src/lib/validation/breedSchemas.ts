import { z } from "zod";

// FCI Group validation schema
const fciGroupSchema = z.enum(
  ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"],
  {
    errorMap: () => ({ message: "Invalid FCI group value" }),
  },
);

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

// Search validation schema (sanitized for SQL injection prevention)
const searchSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      // Allow only alphanumeric characters, spaces, and common punctuation
      return /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s\-.]+$/.test(val);
    },
    {
      message: "Search term contains invalid characters",
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
    const limit = val ? parseInt(val, 10) : 50;
    if (isNaN(limit) || limit < 1 || limit > 200) {
      throw new Error("Limit must be between 1 and 200");
    }
    return limit;
  });

// Schema for breed query parameters
export const breedQuerySchema = z.object({
  fci_group: fciGroupSchema.optional(),
  is_active: booleanSchema,
  search: searchSchema,
  page: pageSchema,
  limit: limitSchema,
});

// Schema for breed ID validation
export const breedIdSchema = z.string().uuid("Invalid breed ID format");

// Type exports
export type BreedQueryInput = z.infer<typeof breedQuerySchema>;
