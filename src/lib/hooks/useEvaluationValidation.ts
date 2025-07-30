import { useMemo } from "react";
import type {
  DogClass,
  EvaluationGrade,
  BabyPuppyGrade,
  TitleType,
  Placement,
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
            "very_promising",
            "promising",
            "quite_promising",
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
            "excellent",
            "very_good",
            "good",
            "satisfactory",
            "disqualified",
            "absent",
          ],
          allowedBabyPuppyGrades: [],
          canHaveTitle: true,
          canHavePlacement: true,
          maxPoints: 4,
        };
      case "veteran":
        return {
          allowedGrades: [
            "excellent",
            "very_good",
            "good",
            "satisfactory",
            "disqualified",
            "absent",
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

    if (!validationRules.canHaveTitle && evaluation.title) {
      errors.push(`Klasa ${dogClass} nie może otrzymać tytułu`);
    }

    if (validationRules.canHaveTitle && evaluation.title) {
      // Sprawdzenie czy ocena pozwala na tytuł
      const titleGrades: EvaluationGrade[] = ["excellent", "very_good"];
      if (evaluation.grade && !titleGrades.includes(evaluation.grade)) {
        errors.push(
          `Tytuł może być przyznany tylko dla ocen: ${titleGrades.join(", ")}`,
        );
      }
    }

    return errors;
  }, [
    evaluation.title,
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

    if (evaluation.placement && evaluation.points === undefined) {
      errors.push("Lokata wymaga podania punktów");
    }

    if (
      evaluation.points !== undefined &&
      evaluation.points > validationRules.maxPoints
    ) {
      errors.push(
        `Maksymalna liczba punktów dla klasy ${dogClass} to ${validationRules.maxPoints}`,
      );
    }

    return errors;
  }, [evaluation.placement, evaluation.points, dogClass, validationRules]);

  // Walidacja punktów
  const validatePoints = useMemo((): string[] => {
    const errors: string[] = [];

    if (evaluation.points !== undefined) {
      if (evaluation.points < 0) {
        errors.push("Punkty nie mogą być ujemne");
      }
      if (evaluation.points > validationRules.maxPoints) {
        errors.push(
          `Maksymalna liczba punktów to ${validationRules.maxPoints}`,
        );
      }
      if (evaluation.points > 0 && !evaluation.placement) {
        errors.push("Punkty wymagają podania lokaty");
      }
    }

    return errors;
  }, [evaluation.points, validationRules.maxPoints, evaluation.placement]);

  // Walidacja best in group/show
  const validateBestAwards = useMemo((): string[] => {
    const errors: string[] = [];

    if (evaluation.is_best_in_show && !evaluation.is_best_in_group) {
      errors.push("Best in Show wymaga Best in Group");
    }

    if (
      (evaluation.is_best_in_group || evaluation.is_best_in_show) &&
      evaluation.grade !== "excellent"
    ) {
      errors.push(
        "Best in Group/Show może być przyznane tylko dla oceny Excellent",
      );
    }

    return errors;
  }, [
    evaluation.is_best_in_group,
    evaluation.is_best_in_show,
    evaluation.grade,
  ]);

  // Kompletna walidacja
  const validationResult = useMemo((): ValidationResult => {
    const allErrors = [
      ...validateGrade,
      ...validateTitle,
      ...validatePlacement,
      ...validatePoints,
      ...validateBestAwards,
    ];

    const warnings: string[] = [];

    // Ostrzeżenia
    if (
      evaluation.grade === "disqualified" &&
      (evaluation.title || evaluation.placement || evaluation.points)
    ) {
      warnings.push(
        "Pies zdyskwalifikowany nie może otrzymać tytułu, lokaty ani punktów",
      );
    }

    if (
      evaluation.grade === "absent" &&
      (evaluation.title || evaluation.placement || evaluation.points)
    ) {
      warnings.push(
        "Nieobecny pies nie może otrzymać tytułu, lokaty ani punktów",
      );
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
    validateBestAwards,
    evaluation,
  ]);

  return {
    validationResult,
    validationRules,
    validateGrade,
    validateTitle,
    validatePlacement,
    validatePoints,
    validateBestAwards,
  };
}
