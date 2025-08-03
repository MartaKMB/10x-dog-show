/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateEvaluationInput,
  UpdateEvaluationInput,
} from "../validation/evaluationSchemas";
import type { EvaluationResponseDto } from "../../types";

// Mock data dla testów
const MOCK_DATA = {
  evaluations: [] as any[],
  descriptions: [
    {
      id: "0aeac6bc-425a-477e-ae5e-f92790c96eda",
      is_final: false,
      show_id: "550e8400-e29b-41d4-a716-446655440001",
    },
  ],
};

export class EvaluationService {
  constructor(private supabase: SupabaseClient<any>) {}

  async create(
    descriptionId: string,
    data: CreateEvaluationInput,
  ): Promise<EvaluationResponseDto> {
    // 1. Validate business rules
    await this.validateBusinessRules(descriptionId, data);

    // 2. Check if evaluation already exists
    await this.checkEvaluationExists(descriptionId);

    // 3. Create evaluation in transaction
    const evaluation = await this.createEvaluationTransaction(
      descriptionId,
      data,
    );

    // 4. Return formatted response
    return this.formatResponse(evaluation);
  }

  async update(
    descriptionId: string,
    data: UpdateEvaluationInput,
  ): Promise<EvaluationResponseDto> {
    // 1. Check if evaluation exists
    const existingEvaluation = MOCK_DATA.evaluations.find(
      (e) => e.description_id === descriptionId,
    );

    if (!existingEvaluation) {
      throw new Error("NOT_FOUND: Evaluation not found");
    }

    // 2. Validate business rules
    await this.validateUpdateBusinessRules(descriptionId, data);

    // 3. Update evaluation in transaction
    const evaluation = await this.updateEvaluationTransaction(
      descriptionId,
      data,
    );

    // 4. Return formatted response
    return this.formatResponse(evaluation);
  }

  private async validateBusinessRules(
    descriptionId: string,
    data: CreateEvaluationInput,
  ): Promise<void> {
    // Check if description exists and is not finalized
    const description = MOCK_DATA.descriptions.find(
      (d) => d.id === descriptionId,
    );

    if (!description) {
      throw new Error("NOT_FOUND: Description not found");
    }

    if (description.is_final) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot create evaluations for finalized descriptions",
      );
    }

    // Validate grade system based on dog class
    if (data.dog_class === "baby" || data.dog_class === "puppy") {
      if (data.grade) {
        throw new Error(
          "BUSINESS_RULE_ERROR: Baby/puppy classes use baby_puppy_grade, not grade",
        );
      }
      if (!data.baby_puppy_grade) {
        throw new Error(
          "BUSINESS_RULE_ERROR: Baby/puppy classes require baby_puppy_grade",
        );
      }
    } else {
      if (data.baby_puppy_grade) {
        throw new Error(
          "BUSINESS_RULE_ERROR: Regular classes use grade, not baby_puppy_grade",
        );
      }
      if (!data.grade) {
        throw new Error("BUSINESS_RULE_ERROR: Regular classes require grade");
      }
    }

    // Validate business rules for titles and placements
    if (data.title && !data.placement) {
      throw new Error("BUSINESS_RULE_ERROR: Title requires placement");
    }

    if (data.placement && !data.title) {
      throw new Error("BUSINESS_RULE_ERROR: Placement requires title");
    }

    // Validate points range
    if (data.points !== undefined && (data.points < 0 || data.points > 100)) {
      throw new Error("BUSINESS_RULE_ERROR: Points must be between 0 and 100");
    }
  }

  private async validateUpdateBusinessRules(
    descriptionId: string,
    data: UpdateEvaluationInput,
  ): Promise<void> {
    // Check if description is finalized
    const description = MOCK_DATA.descriptions.find(
      (d) => d.id === descriptionId,
    );

    if (description?.is_final) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot update evaluations for finalized descriptions",
      );
    }

    // Validate that we don't have both grade and baby_puppy_grade
    if (data.grade && data.baby_puppy_grade) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot have both grade and baby_puppy_grade",
      );
    }
  }

  private async checkEvaluationExists(descriptionId: string): Promise<void> {
    const existingEvaluation = MOCK_DATA.evaluations.find(
      (e) => e.description_id === descriptionId,
    );

    if (existingEvaluation) {
      throw new Error(
        "CONFLICT: Evaluation already exists for this description",
      );
    }
  }

  private async createEvaluationTransaction(
    descriptionId: string,
    data: CreateEvaluationInput,
  ): Promise<Record<string, any>> {
    // Mock: Create new evaluation
    const newEvaluation = {
      id: crypto.randomUUID(),
      description_id: descriptionId,
      dog_class: data.dog_class,
      grade: data.grade || null,
      baby_puppy_grade: data.baby_puppy_grade || null,
      title: data.title || null,
      placement: data.placement || null,
      points: data.points || null,
      is_best_in_group: data.is_best_in_group || false,
      is_best_in_show: data.is_best_in_show || false,
      judge_signature: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to mock data
    MOCK_DATA.evaluations.push(newEvaluation);

    return newEvaluation;
  }

  private async updateEvaluationTransaction(
    descriptionId: string,
    data: UpdateEvaluationInput,
  ): Promise<Record<string, any>> {
    // Mock: Find existing evaluation
    const existingIndex = MOCK_DATA.evaluations.findIndex(
      (e) => e.description_id === descriptionId,
    );

    if (existingIndex === -1) {
      throw new Error("NOT_FOUND: Evaluation not found");
    }

    const existingEvaluation = MOCK_DATA.evaluations[existingIndex];

    // Update evaluation
    const updatedEvaluation = {
      ...existingEvaluation,
      grade: data.grade ?? existingEvaluation.grade,
      baby_puppy_grade:
        data.baby_puppy_grade ?? existingEvaluation.baby_puppy_grade,
      title: data.title ?? existingEvaluation.title,
      placement: data.placement ?? existingEvaluation.placement,
      points: data.points ?? existingEvaluation.points,
      is_best_in_group:
        data.is_best_in_group ?? existingEvaluation.is_best_in_group,
      is_best_in_show:
        data.is_best_in_show ?? existingEvaluation.is_best_in_show,
      updated_at: new Date().toISOString(),
    };

    // Update in mock data
    MOCK_DATA.evaluations[existingIndex] = updatedEvaluation;

    return updatedEvaluation;
  }

  private formatResponse(
    evaluation: Record<string, any>,
  ): EvaluationResponseDto {
    return {
      id: evaluation.id,
      description_id: evaluation.description_id,
      dog_class: evaluation.dog_class,
      grade: evaluation.grade,
      baby_puppy_grade: evaluation.baby_puppy_grade,
      title: evaluation.title,
      placement: evaluation.placement,
      points: evaluation.points,
      is_best_in_group: evaluation.is_best_in_group,
      is_best_in_show: evaluation.is_best_in_show,
      judge_signature: evaluation.judge_signature,
      created_at: evaluation.created_at,
      updated_at: evaluation.updated_at,
    };
  }
}
