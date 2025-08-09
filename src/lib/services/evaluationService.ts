/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateEvaluationInput,
  UpdateEvaluationInput,
  EvaluationQueryInput,
} from "../validation/evaluationSchemas";
import type { EvaluationResponseDto, PaginatedResponseDto } from "../../types";

export class EvaluationService {
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * Get evaluations for a specific show
   */
  async getEvaluations(
    showId: string,
    params?: EvaluationQueryInput,
  ): Promise<PaginatedResponseDto<EvaluationResponseDto>> {
    try {
      // Build query
      let query = this.supabase
        .from("evaluations")
        .select(
          `
          id,
          dog_class,
          grade,
          baby_puppy_grade,
          club_title,
          placement,
          created_at,
          updated_at,
          dogs (
            id,
            name,
            gender,
            birth_date
          )
        `,
        )
        .eq("show_id", showId);

      // Apply filters
      if (params?.dog_class) {
        query = query.eq("dog_class", params.dog_class);
      }
      if (params?.grade) {
        query = query.eq("grade", params.grade);
      }
      if (params?.club_title) {
        query = query.eq("club_title", params.club_title);
      }

      // Get total count for pagination
      const { count } = await this.supabase
        .from("evaluations")
        .select("*", { count: "exact", head: true })
        .eq("show_id", showId);

      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);
      query = query.order("created_at", { ascending: false });

      const { data: evaluations, error } = await query;

      if (error) {
        throw new Error(`DATABASE_ERROR: ${error.message}`);
      }

      // Format response
      const formattedEvaluations = evaluations.map((evaluation: any) => ({
        id: evaluation.id,
        dog: {
          id: evaluation.dogs.id,
          name: evaluation.dogs.name,
          gender: evaluation.dogs.gender,
          birth_date: evaluation.dogs.birth_date,
        },
        dog_class: evaluation.dog_class,
        grade: evaluation.grade,
        baby_puppy_grade: evaluation.baby_puppy_grade,
        club_title: evaluation.club_title,
        placement: evaluation.placement,
        created_at: evaluation.created_at,
      }));

      return {
        data: formattedEvaluations,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("INTERNAL_ERROR: Failed to get evaluations");
    }
  }

  /**
   * Create evaluation for a dog at a specific show
   */
  async create(
    showId: string,
    data: CreateEvaluationInput,
  ): Promise<EvaluationResponseDto> {
    try {
      // 1. Validate business rules
      await this.validateBusinessRules(showId, data);

      // 2. Check if evaluation already exists
      await this.checkEvaluationExists(showId, data.dog_id);

      // 3. Create evaluation
      const { data: evaluation, error } = await this.supabase
        .from("evaluations")
        .insert({
          show_id: showId,
          dog_id: data.dog_id,
          dog_class: data.dog_class,
          grade: data.grade,
          baby_puppy_grade: data.baby_puppy_grade,
          club_title: data.club_title,
          placement: data.placement,
        })
        .select(
          `
          id,
          dog_class,
          grade,
          baby_puppy_grade,
          club_title,
          placement,
          created_at,
          dogs (
            id,
            name,
            gender,
            birth_date
          )
        `,
        )
        .single();

      if (error) {
        throw new Error(`DATABASE_ERROR: ${error.message}`);
      }

      // 4. Return formatted response
      return this.formatResponse(evaluation);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("INTERNAL_ERROR: Failed to create evaluation");
    }
  }

  /**
   * Update evaluation
   */
  async update(
    showId: string,
    evaluationId: string,
    data: UpdateEvaluationInput,
  ): Promise<EvaluationResponseDto> {
    try {
      // 1. Check if evaluation exists
      const existingEvaluation = await this.getEvaluationById(evaluationId);
      if (!existingEvaluation) {
        throw new Error("NOT_FOUND: Evaluation not found");
      }

      // 2. Validate business rules
      await this.validateUpdateBusinessRules(showId, evaluationId, data);

      // 3. Update evaluation
      const { data: evaluation, error } = await this.supabase
        .from("evaluations")
        .update({
          grade: data.grade,
          baby_puppy_grade: data.baby_puppy_grade,
          club_title: data.club_title,
          placement: data.placement,
          updated_at: new Date().toISOString(),
        })
        .eq("id", evaluationId)
        .eq("show_id", showId)
        .select(
          `
          id,
          dog_class,
          grade,
          baby_puppy_grade,
          club_title,
          placement,
          created_at,
          updated_at,
          dogs (
            id,
            name,
            gender,
            birth_date
          )
        `,
        )
        .single();

      if (error) {
        throw new Error(`DATABASE_ERROR: ${error.message}`);
      }

      // 4. Return formatted response
      return this.formatResponse(evaluation);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("INTERNAL_ERROR: Failed to update evaluation");
    }
  }

  /**
   * Delete evaluation
   */
  async delete(showId: string, evaluationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("evaluations")
        .delete()
        .eq("id", evaluationId)
        .eq("show_id", showId);

      if (error) {
        throw new Error(`DATABASE_ERROR: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("INTERNAL_ERROR: Failed to delete evaluation");
    }
  }

  /**
   * Get evaluation by ID
   */
  private async getEvaluationById(evaluationId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from("evaluations")
      .select("*")
      .eq("id", evaluationId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  /**
   * Validate business rules for creating evaluation
   */
  private async validateBusinessRules(
    showId: string,
    data: CreateEvaluationInput,
  ): Promise<void> {
    // Check if show exists and is in progress or completed
    const { data: show, error: showError } = await this.supabase
      .from("shows")
      .select("status, show_date")
      .eq("id", showId)
      .single();

    if (showError || !show) {
      throw new Error("NOT_FOUND: Show not found");
    }

    if (show.status === "draft" || show.status === "open_for_registration") {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot create evaluations for shows that are not in progress or completed",
      );
    }

    // Check if dog is registered for this show
    const { data: registration, error: regError } = await this.supabase
      .from("show_registrations")
      .select("dog_class")
      .eq("show_id", showId)
      .eq("dog_id", data.dog_id)
      .single();

    if (regError || !registration) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Dog must be registered for the show before evaluation",
      );
    }

    // Validate that dog class matches registration
    if (registration.dog_class !== data.dog_class) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Dog class must match the registration class",
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
          "BUSINESS_RULE_ERROR: Non-baby/puppy classes use grade, not baby_puppy_grade",
        );
      }
      if (!data.grade) {
        throw new Error(
          "BUSINESS_RULE_ERROR: Non-baby/puppy classes require grade",
        );
      }
    }

    // Validate club title uniqueness (only one dog can have each club title per show)
    if (data.club_title) {
      const { data: existingTitle, error: titleError } = await this.supabase
        .from("evaluations")
        .select("id")
        .eq("show_id", showId)
        .eq("club_title", data.club_title)
        .single();

      if (!titleError && existingTitle) {
        throw new Error(
          `BUSINESS_RULE_ERROR: Club title '${data.club_title}' is already assigned to another dog in this show`,
        );
      }
    }
  }

  /**
   * Validate business rules for updating evaluation
   */
  private async validateUpdateBusinessRules(
    showId: string,
    evaluationId: string,
    data: UpdateEvaluationInput,
  ): Promise<void> {
    // Check if show is still editable
    const { data: show, error: showError } = await this.supabase
      .from("shows")
      .select("status")
      .eq("id", showId)
      .single();

    if (showError || !show) {
      throw new Error("NOT_FOUND: Show not found");
    }

    if (show.status === "completed") {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot update evaluations for completed shows",
      );
    }

    // Validate grade system consistency
    if (data.grade && data.baby_puppy_grade) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot have both grade and baby_puppy_grade",
      );
    }

    // Validate club title uniqueness for updates
    if (data.club_title) {
      const { data: existingTitle, error: titleError } = await this.supabase
        .from("evaluations")
        .select("id")
        .eq("show_id", showId)
        .eq("club_title", data.club_title)
        .neq("id", evaluationId) // Exclude current evaluation
        .single();

      if (!titleError && existingTitle) {
        throw new Error(
          `BUSINESS_RULE_ERROR: Club title '${data.club_title}' is already assigned to another dog in this show`,
        );
      }
    }
  }

  /**
   * Check if evaluation already exists for this dog at this show
   */
  private async checkEvaluationExists(
    showId: string,
    dogId: string,
  ): Promise<void> {
    const { data: existingEvaluation, error } = await this.supabase
      .from("evaluations")
      .select("id")
      .eq("show_id", showId)
      .eq("dog_id", dogId)
      .single();

    if (!error && existingEvaluation) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Evaluation already exists for this dog at this show",
      );
    }
  }

  /**
   * Format evaluation response
   */
  private formatResponse(evaluation: any): EvaluationResponseDto {
    return {
      id: evaluation.id,
      dog: {
        id: evaluation.dogs.id,
        name: evaluation.dogs.name,
        gender: evaluation.dogs.gender,
        birth_date: evaluation.dogs.birth_date,
      },
      dog_class: evaluation.dog_class,
      grade: evaluation.grade,
      baby_puppy_grade: evaluation.baby_puppy_grade,
      club_title: evaluation.club_title,
      placement: evaluation.placement,
      created_at: evaluation.created_at,
    };
  }
}
