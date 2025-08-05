import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BranchResponseDto,
  BranchesListResponseDto,
  PaginationDto,
} from "../../types";
import type { BranchQueryInput } from "../validation/branchSchemas";

export class BranchService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get paginated list of branches with filtering capabilities
   */
  async getMany(
    query: BranchQueryInput,
  ): Promise<BranchesListResponseDto> {
    const { region, is_active, page, limit } = query;

    // Build query using Supabase
    let queryBuilder = this.supabase
      .from("branches")
      .select("*", { count: "exact" });

    // Apply filters
    if (region) {
      queryBuilder = queryBuilder.ilike("region", `%${region}%`);
    }

    if (is_active !== undefined) {
      queryBuilder = queryBuilder.eq("is_active", is_active);
    } else {
      // Default to active branches only
      queryBuilder = queryBuilder.eq("is_active", true);
    }

    // Add ordering by name for consistent results
    queryBuilder = queryBuilder.order("name", { ascending: true });

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await queryBuilder;

    if (error) {
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return {
      branches: (data as BranchResponseDto[]) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Get a single branch by ID
   */
  async getById(id: string): Promise<BranchResponseDto> {
    const { data, error } = await this.supabase
      .from("branches")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error(`NOT_FOUND: Branch with ID ${id} not found`);
      }
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data as BranchResponseDto;
  }

  /**
   * Get branches by region
   */
  async getByRegion(region: string): Promise<BranchResponseDto[]> {
    const { data, error } = await this.supabase
      .from("branches")
      .select("*")
      .ilike("region", `%${region}%`)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return (data as BranchResponseDto[]) || [];
  }
} 
