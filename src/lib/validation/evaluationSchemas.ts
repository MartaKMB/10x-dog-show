import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

// Enums for evaluation - dostosowane do klubu hovawarta
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

// Oceny FCI w języku polskim
const evaluationGradeSchema = z.enum([
  "doskonała",
  "bardzo_dobra",
  "dobra",
  "zadowalająca",
  "zdyskwalifikowana",
  "nieobecna",
]);

// Oceny dla szczeniąt w języku polskim
const babyPuppyGradeSchema = z.enum([
  "bardzo_obiecujący",
  "obiecujący",
  "dość_obiecujący",
]);

// Tytuły klubowe hovawartów
const clubTitleSchema = z.enum([
  "młodzieżowy_zwycięzca_klubu",
  "zwycięzca_klubu",
  "zwycięzca_klubu_weteranów",
  "najlepszy_reproduktor",
  "najlepsza_suka_hodowlana",
  "najlepsza_para",
  "najlepsza_hodowla",
  "zwycięzca_rasy",
  "zwycięzca_płci_przeciwnej",
  "najlepszy_junior",
  "najlepszy_weteran",
]);

const placementSchema = z.enum(["1st", "2nd", "3rd", "4th"]);

// Schema for creating evaluations - bezpośrednio powiązane z wystawami
export const createEvaluationSchema = z
  .object({
    dog_id: uuidSchema,
    dog_class: dogClassSchema,
    grade: evaluationGradeSchema.optional(),
    baby_puppy_grade: babyPuppyGradeSchema.optional(),
    club_title: clubTitleSchema.optional(),
    placement: placementSchema.optional(),
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
  )
  .refine(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (data) => {
      // Validate that dog is registered for the show
      // This will be checked in the service layer
      return true;
    },
    {
      message: "Dog must be registered for the show before evaluation",
      path: ["dog_id"],
    },
  );

// Schema for updating evaluations
export const updateEvaluationSchema = z
  .object({
    grade: evaluationGradeSchema.optional(),
    baby_puppy_grade: babyPuppyGradeSchema.optional(),
    club_title: clubTitleSchema.optional(),
    placement: placementSchema.optional(),
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

// Schema for evaluation query parameters
export const evaluationQuerySchema = z.object({
  dog_class: dogClassSchema.optional(),
  grade: evaluationGradeSchema.optional(),
  club_title: clubTitleSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Type inference for validated data
export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
export type UpdateEvaluationInput = z.infer<typeof updateEvaluationSchema>;
export type EvaluationQueryInput = z.infer<typeof evaluationQuerySchema>;
