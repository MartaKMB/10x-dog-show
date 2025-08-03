import { z } from "zod";

// Enums for evaluation
const dogClassSchema = z.enum([
  "baby",
  "puppy",
  "junior",
  "intermediate",
  "open",
  "working",
  "champion",
  "veteran",
]);

const evaluationGradeSchema = z.enum([
  "excellent",
  "very_good",
  "good",
  "satisfactory",
  "disqualified",
  "absent",
]);

const babyPuppyGradeSchema = z.enum([
  "very_promising",
  "promising",
  "quite_promising",
]);

const titleTypeSchema = z.enum(["CWC", "CACIB", "res_CWC", "res_CACIB"]);

const placementSchema = z.enum(["1st", "2nd", "3rd", "4th"]);

// Schema for creating evaluations
export const createEvaluationSchema = z
  .object({
    dog_class: dogClassSchema,
    grade: evaluationGradeSchema.optional(),
    baby_puppy_grade: babyPuppyGradeSchema.optional(),
    title: titleTypeSchema.optional(),
    placement: placementSchema.optional(),
    points: z.number().min(0).max(100).optional(),
    is_best_in_group: z.boolean().optional(),
    is_best_in_show: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // For baby/puppy classes, use baby_puppy_grade instead of grade
      if (data.dog_class === "baby" || data.dog_class === "puppy") {
        return !data.grade && data.baby_puppy_grade;
      }
      // For other classes, use grade
      return data.grade && !data.baby_puppy_grade;
    },
    {
      message:
        "Baby/puppy classes use baby_puppy_grade, other classes use grade",
      path: ["grade"],
    },
  );

// Schema for updating evaluations
export const updateEvaluationSchema = z
  .object({
    grade: evaluationGradeSchema.optional(),
    baby_puppy_grade: babyPuppyGradeSchema.optional(),
    title: titleTypeSchema.optional(),
    placement: placementSchema.optional(),
    points: z.number().min(0).max(100).optional(),
    is_best_in_group: z.boolean().optional(),
    is_best_in_show: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Cannot have both grade and baby_puppy_grade
      return !(data.grade && data.baby_puppy_grade);
    },
    {
      message: "Cannot have both grade and baby_puppy_grade",
      path: ["grade"],
    },
  );

// Type inference for validated data
export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
export type UpdateEvaluationInput = z.infer<typeof updateEvaluationSchema>;
