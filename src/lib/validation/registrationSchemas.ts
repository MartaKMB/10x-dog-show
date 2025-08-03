import { z } from "zod";
import type { DogClass } from "../../types";

// =============================================================================
// ENUM VALUES FOR VALIDATION
// =============================================================================

const DOG_CLASS_VALUES = [
  "baby",
  "puppy",
  "junior",
  "intermediate",
  "open",
  "working",
  "champion",
  "veteran",
] as const;

const DOG_GENDER_VALUES = ["male", "female"] as const;

// =============================================================================
// REGISTRATION SCHEMAS
// =============================================================================

/**
 * Schema dla tworzenia nowej rejestracji
 */
export const createRegistrationSchema = z.object({
  dog_id: z.string().uuid("Nieprawidłowy format ID psa"),
  dog_class: z.enum(DOG_CLASS_VALUES, {
    errorMap: () => ({ message: "Nieprawidłowa klasa psa" }),
  }),
  registration_fee: z
    .number()
    .min(0, "Opłata rejestracyjna nie może być ujemna")
    .optional(),
  notes: z
    .string()
    .max(500, "Notatki nie mogą przekraczać 500 znaków")
    .optional(),
});

/**
 * Schema dla aktualizacji rejestracji
 */
export const updateRegistrationSchema = z.object({
  dog_class: z
    .enum(DOG_CLASS_VALUES, {
      errorMap: () => ({ message: "Nieprawidłowa klasa psa" }),
    })
    .optional(),
  registration_fee: z
    .number()
    .min(0, "Opłata rejestracyjna nie może być ujemna")
    .optional(),
  notes: z
    .string()
    .max(500, "Notatki nie mogą przekraczać 500 znaków")
    .optional(),
});

/**
 * Schema dla aktualizacji statusu płatności
 */
export const updatePaymentStatusSchema = z.object({
  is_paid: z.boolean({
    required_error: "Status płatności jest wymagany",
  }),
  payment_date: z
    .string()
    .datetime("Nieprawidłowy format daty płatności")
    .optional(),
  payment_method: z
    .string()
    .max(50, "Metoda płatności nie może przekraczać 50 znaków")
    .optional(),
});

/**
 * Schema dla parametrów zapytania rejestracji
 */
export const registrationQuerySchema = z.object({
  dog_class: z
    .enum(DOG_CLASS_VALUES, {
      errorMap: () => ({ message: "Nieprawidłowa klasa psa" }),
    })
    .optional(),
  is_paid: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  breed_id: z.string().uuid("Nieprawidłowy format ID rasy").optional(),
  gender: z
    .enum(DOG_GENDER_VALUES, {
      errorMap: () => ({ message: "Nieprawidłowa płeć" }),
    })
    .optional(),
  search: z
    .string()
    .max(100, "Wyszukiwanie nie może przekraczać 100 znaków")
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Numer strony musi być większy od 0")
    .optional()
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "Limit musi być między 1 a 100")
    .optional()
    .default("20"),
});

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Walidacja wieku psa dla klasy
 */
export const validateDogClassByAge = (
  birthDate: string,
  dogClass: DogClass,
  showDate: string,
): boolean => {
  const birth = new Date(birthDate);
  const show = new Date(showDate);
  const ageInMonths =
    (show.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

  const classAgeRequirements: Record<DogClass, { min: number; max: number }> = {
    baby: { min: 3, max: 6 },
    puppy: { min: 6, max: 9 },
    junior: { min: 9, max: 18 },
    intermediate: { min: 15, max: 24 },
    open: { min: 15, max: 999 },
    working: { min: 15, max: 999 },
    champion: { min: 15, max: 999 },
    veteran: { min: 84, max: 999 },
  };

  const requirements = classAgeRequirements[dogClass];
  return ageInMonths >= requirements.min && ageInMonths <= requirements.max;
};

/**
 * Walidacja statusu wystawy dla rejestracji
 */
export const validateShowAcceptsRegistrations = (status: string): boolean => {
  return status === "draft" || status === "open_for_registration";
};

/**
 * Walidacja możliwości edycji wystawy
 */
export const validateShowEditable = (status: string): boolean => {
  return status !== "in_progress" && status !== "completed";
};

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const REGISTRATION_ERROR_MESSAGES = {
  SHOW_NOT_FOUND: "Wystawa nie została znaleziona",
  DOG_NOT_FOUND: "Pies nie został znaleziony",
  ALREADY_REGISTERED: "Pies jest już zarejestrowany na tę wystawę",
  SHOW_NOT_ACCEPTING: "Wystawa nie przyjmuje rejestracji",
  SHOW_STARTED: "Nie można edytować rejestracji dla rozpoczętej wystawy",
  LIMIT_EXCEEDED: "Przekroczono limit uczestników wystawy",
  INVALID_DOG_CLASS: "Klasa psa nie odpowiada jego wiekowi",
  INVALID_PAYMENT_STATUS: "Nieprawidłowy status płatności",
  REGISTRATION_NOT_FOUND: "Rejestracja nie została znaleziona",
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type UpdatePaymentStatusInput = z.infer<
  typeof updatePaymentStatusSchema
>;
export type RegistrationQueryInput = z.infer<typeof registrationQuerySchema>;
