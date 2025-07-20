import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

// Main schema for creating descriptions
export const createDescriptionSchema = z
  .object({
    show_id: uuidSchema,
    dog_id: uuidSchema,
    judge_id: uuidSchema,
    content_pl: z.string().optional(),
    content_en: z.string().optional(),
  })
  .refine((data) => data.content_pl || data.content_en, {
    message: "At least one content (pl or en) is required",
    path: ["content"],
  });

// Schema for updating descriptions
export const updateDescriptionSchema = z
  .object({
    content_pl: z.string().optional(),
    content_en: z.string().optional(),
  })
  .refine((data) => data.content_pl || data.content_en, {
    message: "At least one content (pl or en) is required",
    path: ["content"],
  });

// Type inference for validated data
export type CreateDescriptionInput = z.infer<typeof createDescriptionSchema>;
export type UpdateDescriptionInput = z.infer<typeof updateDescriptionSchema>;
