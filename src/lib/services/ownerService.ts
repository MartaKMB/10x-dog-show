import type { SupabaseClient } from "@supabase/supabase-js";
import type { OwnerResponseDto, PaginatedResponseDto } from "../../types";
import type {
  CreateOwnerInput,
  UpdateOwnerInput,
  OwnerQueryInput,
} from "../validation/ownerSchemas";

export class OwnerService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create a new owner with GDPR consent tracking
   */
  async create(data: CreateOwnerInput): Promise<OwnerResponseDto> {
    // Check if email already exists
    const { data: existingOwner } = await this.supabase
      .from("dog_shows.owners")
      .select("id")
      .eq("email", data.email)
      .is("deleted_at", null)
      .single();

    if (existingOwner) {
      throw new Error("CONFLICT: Email already exists");
    }

    // Create owner with GDPR consent tracking
    const { data: owner, error: createError } = await this.supabase
      .from("dog_shows.owners")
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postal_code: data.postal_code,
        country: data.country,
        kennel_name: data.kennel_name,
        language: data.language,
        gdpr_consent: data.gdpr_consent,
        gdpr_consent_date: data.gdpr_consent ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (createError) {
      throw new Error(
        `INTERNAL_ERROR: Failed to create owner - ${createError.message}`,
      );
    }

    return owner;
  }

  /**
   * Get owners with pagination and filters
   */
  async getMany(
    query: OwnerQueryInput,
  ): Promise<PaginatedResponseDto<OwnerResponseDto>> {
    const { page, limit, ...filters } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.supabase
      .from("dog_shows.owners")
      .select("*")
      .is("deleted_at", null);

    // Apply filters
    if (filters.email) {
      queryBuilder = queryBuilder.eq("email", filters.email);
    }
    if (filters.city) {
      queryBuilder = queryBuilder.eq("city", filters.city);
    }
    if (filters.country) {
      queryBuilder = queryBuilder.eq("country", filters.country);
    }
    if (filters.gdpr_consent !== undefined) {
      queryBuilder = queryBuilder.eq("gdpr_consent", filters.gdpr_consent);
    }

    // Get total count
    const { data: allOwners, error: countError } = await queryBuilder;
    if (countError) {
      throw new Error(
        `INTERNAL_ERROR: Failed to get count - ${countError.message}`,
      );
    }
    const count = allOwners?.length || 0;

    // Get paginated results
    const { data: owners, error: ownersError } = await queryBuilder
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (ownersError) {
      throw new Error(
        `INTERNAL_ERROR: Failed to get owners - ${ownersError.message}`,
      );
    }

    return {
      data: owners || [],
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get owner by ID
   */
  async getById(id: string): Promise<OwnerResponseDto> {
    const { data: owner, error } = await this.supabase
      .from("dog_shows.owners")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !owner) {
      throw new Error("NOT_FOUND: Owner not found");
    }

    return owner;
  }

  /**
   * Update owner information
   */
  async update(id: string, data: UpdateOwnerInput): Promise<OwnerResponseDto> {
    // Check if owner exists
    const { data: existingOwner, error: checkError } = await this.supabase
      .from("dog_shows.owners")
      .select("id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (checkError || !existingOwner) {
      throw new Error("NOT_FOUND: Owner not found");
    }

    // Update owner
    const { data: owner, error: updateError } = await this.supabase
      .from("dog_shows.owners")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new Error(
        `INTERNAL_ERROR: Failed to update owner - ${updateError.message}`,
      );
    }

    return owner;
  }

  /**
   * Soft delete owner with check for assigned dogs
   */
  async delete(id: string): Promise<void> {
    // Check if owner exists
    const { data: existingOwner, error: checkError } = await this.supabase
      .from("dog_shows.owners")
      .select("id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (checkError || !existingOwner) {
      throw new Error("NOT_FOUND: Owner not found");
    }

    // Check if owner has assigned dogs
    const { data: assignedDogs, error: dogsError } = await this.supabase
      .from("dog_shows.dog_owners")
      .select("dog_id")
      .eq("owner_id", id);

    if (dogsError) {
      throw new Error(
        `INTERNAL_ERROR: Failed to check assigned dogs - ${dogsError.message}`,
      );
    }

    if (assignedDogs && assignedDogs.length > 0) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot delete owner with assigned dogs",
      );
    }

    // Soft delete
    const { error: deleteError } = await this.supabase
      .from("dog_shows.owners")
      .update({
        deleted_at: new Date().toISOString(),
        scheduled_for_deletion: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (deleteError) {
      throw new Error(
        `INTERNAL_ERROR: Failed to delete owner - ${deleteError.message}`,
      );
    }
  }
}
