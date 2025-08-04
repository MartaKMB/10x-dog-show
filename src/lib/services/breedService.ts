import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BreedResponseDto,
  PaginatedResponseDto,
  FCIGroup,
} from "../../types";
import type { BreedQueryInput } from "../validation/breedSchemas";

export class BreedService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get paginated list of breeds with filtering and search capabilities
   */
  async getMany(
    query: BreedQueryInput,
  ): Promise<PaginatedResponseDto<BreedResponseDto>> {
    const { fci_group, is_active, search, page, limit } = query;

    // Build query using Supabase
    let queryBuilder = this.supabase
      .from("breeds")
      .select("*", { count: "exact" });

    // Apply filters
    if (fci_group) {
      queryBuilder = queryBuilder.eq("fci_group", fci_group);
    }

    if (is_active !== undefined) {
      queryBuilder = queryBuilder.eq("is_active", is_active);
    } else {
      // Default to active breeds only
      queryBuilder = queryBuilder.eq("is_active", true);
    }

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.trim();
      queryBuilder = queryBuilder.or(
        `name_pl.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%`,
      );
    }

    // Add ordering by name_pl for consistent results
    queryBuilder = queryBuilder.order("name_pl", { ascending: true });

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await queryBuilder;

    if (error) {
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return {
      data: (data as BreedResponseDto[]) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Get a single breed by ID
   */
  async getById(id: string): Promise<BreedResponseDto> {
    const { data, error } = await this.supabase
      .from("breeds")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("NOT_FOUND: Breed not found");
      }
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data as BreedResponseDto;
  }

  /**
   * Get breeds by FCI group
   */
  async getByFciGroup(fciGroup: FCIGroup): Promise<BreedResponseDto[]> {
    const { data, error } = await this.supabase
      .from("breeds")
      .select("*")
      .eq("fci_group", fciGroup)
      .eq("is_active", true)
      .order("name_pl", { ascending: true });

    if (error) {
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return (data as BreedResponseDto[]) || [];
  }

  /**
   * Search breeds by name (case-insensitive)
   */
  async searchByName(searchTerm: string): Promise<BreedResponseDto[]> {
    const term = searchTerm.trim();
    const { data, error } = await this.supabase
      .from("breeds")
      .select("*")
      .eq("is_active", true)
      .or(`name_pl.ilike.%${term}%,name_en.ilike.%${term}%`)
      .order("name_pl", { ascending: true });

    if (error) {
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return (data as BreedResponseDto[]) || [];
  }
}
