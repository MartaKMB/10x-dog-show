import { useMemo } from "react";
import type {
  DogClass,
  EvaluationGrade,
  BabyPuppyGrade,
  CreateEvaluationDto,
} from "../../types";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ValidationRules {
  allowedGrades: EvaluationGrade[];
  allowedBabyPuppyGrades: BabyPuppyGrade[];
  canHaveTitle: boolean;
  canHavePlacement: boolean;
  maxPoints: number;
}

export function useEvaluationValidation(
  evaluation: CreateEvaluationDto,
  dogClass: DogClass,
) {
  // Reguły walidacji dla różnych klas psów
  const validationRules = useMemo((): ValidationRules => {
    switch (dogClass) {
      case "baby":
      case "puppy":
        return {
          allowedGrades: [],
          allowedBabyPuppyGrades: [
            "bardzo_obiecujący",
            "obiecujący",
            "dość_obiecujący",
          ],
          canHaveTitle: false,
          canHavePlacement: false,
          maxPoints: 0,
        };
      case "junior":
      case "intermediate":
      case "open":
      case "working":
      case "champion":
        return {
          allowedGrades: [
            "doskonała",
            "bardzo_dobra",
            "dobra",
            "zadowalająca",
            "zdyskwalifikowana",
            "nieobecna",
          ],
          allowedBabyPuppyGrades: [],
          canHaveTitle: true,
          canHavePlacement: true,
          maxPoints: 4,
        };
      case "veteran":
        return {
          allowedGrades: [
            "doskonała",
            "bardzo_dobra",
            "dobra",
            "zadowalająca",
            "zdyskwalifikowana",
            "nieobecna",
          ],
          allowedBabyPuppyGrades: [],
          canHaveTitle: false,
          canHavePlacement: true,
          maxPoints: 4,
        };
      default:
        return {
          allowedGrades: [],
          allowedBabyPuppyGrades: [],
          canHaveTitle: false,
          canHavePlacement: false,
          maxPoints: 0,
        };
    }
  }, [dogClass]);

  // Walidacja oceny
  const validateGrade = useMemo((): string[] => {
    const errors: string[] = [];

    if (dogClass === "baby" || dogClass === "puppy") {
      if (evaluation.grade) {
        errors.push(
          "Klasy baby i puppy nie mogą mieć oceny, tylko ocenę baby_puppy_grade",
        );
      }
      if (!evaluation.baby_puppy_grade) {
        errors.push("Klasy baby i puppy wymagają oceny baby_puppy_grade");
      }
    } else {
      if (evaluation.baby_puppy_grade) {
        errors.push(
          "Klasy inne niż baby/puppy nie mogą mieć oceny baby_puppy_grade",
        );
      }
      if (!evaluation.grade) {
        errors.push("Wymagana jest ocena");
      } else if (!validationRules.allowedGrades.includes(evaluation.grade)) {
        errors.push(
          `Ocena "${evaluation.grade}" nie jest dozwolona dla klasy ${dogClass}`,
        );
      }
    }

    return errors;
  }, [
    evaluation.grade,
    evaluation.baby_puppy_grade,
    dogClass,
    validationRules.allowedGrades,
  ]);

  // Walidacja tytułu
  const validateTitle = useMemo((): string[] => {
    const errors: string[] = [];

    if (!validationRules.canHaveTitle) {
      errors.push(`Klasa ${dogClass} nie może otrzymać tytułu`);
    } else if (evaluation.club_title) {
      // Sprawdź czy ocena jest wystarczająco dobra dla tytułu
      if (
        evaluation.grade &&
        evaluation.grade !== "doskonała" &&
        evaluation.grade !== "bardzo_dobra"
      ) {
        errors.push(
          "Tytuł może być przyznany tylko dla ocen doskonała lub bardzo dobra",
        );
      }
    }

    return errors;
  }, [
    evaluation.club_title,
    evaluation.grade,
    dogClass,
    validationRules.canHaveTitle,
  ]);

  // Walidacja lokaty
  const validatePlacement = useMemo((): string[] => {
    const errors: string[] = [];

    if (!validationRules.canHavePlacement && evaluation.placement) {
      errors.push(`Klasa ${dogClass} nie może otrzymać lokaty`);
    }

    return errors;
  }, [evaluation.placement, dogClass, validationRules.canHavePlacement]);

  // Walidacja punktów
  const validatePoints = useMemo((): string[] => {
    const errors: string[] = [];

    if (evaluation.placement && evaluation.placement !== "4th") {
      if (evaluation.placement === "1st" && validationRules.maxPoints < 4) {
        errors.push("1. lokata wymaga maksymalnej liczby punktów");
      } else if (
        evaluation.placement === "2nd" &&
        validationRules.maxPoints < 3
      ) {
        errors.push("2. lokata wymaga co najmniej 3 punktów");
      } else if (
        evaluation.placement === "3rd" &&
        validationRules.maxPoints < 2
      ) {
        errors.push("3. lokata wymaga co najmniej 2 punktów");
      }
    }

    return errors;
  }, [evaluation.placement, validationRules.maxPoints]);

  // Walidacja best in group/show
  const validateBestInGroupShow = useMemo((): string[] => {
    const errors: string[] = [];

    // Sprawdź czy best in show wymaga best in group
    if (evaluation.club_title === "zwycięzca_klubu" && !evaluation.club_title) {
      errors.push("Best in Show wymaga Best in Group");
    }

    // Sprawdź czy best in group/show wymaga odpowiedniej oceny
    if (
      (evaluation.club_title === "zwycięzca_klubu" ||
        evaluation.club_title === "zwycięzca_rasy") &&
      evaluation.grade !== "doskonała"
    ) {
      errors.push("Best in Group/Show wymaga oceny doskonała");
    }

    return errors;
  }, [evaluation.club_title, evaluation.grade]);

  // Walidacja oceny dla zdyskwalifikowanych
  const validateDisqualified = useMemo((): string[] => {
    const errors: string[] = [];

    if (
      evaluation.grade === "zdyskwalifikowana" &&
      (evaluation.placement || evaluation.club_title)
    ) {
      errors.push("Zdyskwalifikowane psy nie mogą otrzymać lokaty ani tytułu");
    }

    return errors;
  }, [evaluation.grade, evaluation.placement, evaluation.club_title]);

  // Walidacja oceny dla nieobecnych
  const validateAbsent = useMemo((): string[] => {
    const errors: string[] = [];

    if (
      evaluation.grade === "nieobecna" &&
      (evaluation.placement || evaluation.club_title)
    ) {
      errors.push("Nieobecne psy nie mogą otrzymać lokaty ani tytułu");
    }

    return errors;
  }, [evaluation.grade, evaluation.placement, evaluation.club_title]);

  // Kompletna walidacja
  const validationResult = useMemo((): ValidationResult => {
    const allErrors = [
      ...validateGrade,
      ...validateTitle,
      ...validatePlacement,
      ...validatePoints,
      ...validateBestInGroupShow,
      ...validateDisqualified,
      ...validateAbsent,
    ];

    const warnings: string[] = [];

    // Ostrzeżenia
    if (
      evaluation.grade === "zdyskwalifikowana" &&
      (evaluation.placement || evaluation.club_title)
    ) {
      warnings.push(
        "Pies zdyskwalifikowany nie może otrzymać lokaty ani tytułu",
      );
    }

    if (
      evaluation.grade === "nieobecna" &&
      (evaluation.placement || evaluation.club_title)
    ) {
      warnings.push("Nieobecny pies nie może otrzymać lokaty ani tytułu");
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings,
    };
  }, [
    validateGrade,
    validateTitle,
    validatePlacement,
    validatePoints,
    validateBestInGroupShow,
    validateDisqualified,
    validateAbsent,
    evaluation,
  ]);

  return {
    validationResult,
    validationRules,
    validateGrade,
    validateTitle,
    validatePlacement,
    validatePoints,
    validateBestInGroupShow,
    validateDisqualified,
    validateAbsent,
  };
}
