/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateDogInput, UpdateDogInput } from "../validation/dogSchemas";
import type { DogResponseDto, PaginatedResponseDto } from "../../types";

export class DogService {
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * Creates a new dog
   * @param data Dog creation data
   * @returns Created dog
   */
  async create(data: CreateDogInput): Promise<DogResponseDto> {
    // Validate microchip number uniqueness if provided
    if (data.microchip_number) {
      await this.validateMicrochipUniqueness(data.microchip_number);
    }

    // Create dog record
    const dogData = {
      name: data.name,
      gender: data.gender,
      birth_date: data.birth_date,
      coat: data.coat || "czarny",
      microchip_number: data.microchip_number,
      kennel_name: data.kennel_name,
      father_name: data.father_name,
      mother_name: data.mother_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: dog, error } = await this.supabase
      .from("dogs")
      .insert(dogData)
      .select()
      .single();

    if (error) {
      throw new Error(`INTERNAL_ERROR: Failed to create dog: ${error.message}`);
    }

    // Create dog-owner relationships
    await this.createDogOwnerRelationships(dog.id, data.owners);

    return await this.formatResponse(dog);
  }

  /**
   * Gets paginated list of dogs
   * @param params Query parameters
   * @returns Paginated dogs response
   */
  async getDogs(params: any): Promise<PaginatedResponseDto<DogResponseDto>> {
    let query = this.supabase.from("dogs").select("*", { count: "exact" });

    // Apply filters
    if (params.gender) {
      query = query.eq("gender", params.gender);
    }
    if (params.coat) {
      query = query.eq("coat", params.coat);
    }
    if (params.kennel_name) {
      query = query.ilike("kennel_name", `%${params.kennel_name}%`);
    }
    if (params.search) {
      query = query.or(
        `name.ilike.%${params.search}%,kennel_name.ilike.%${params.search}%`,
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);
    query = query.order("created_at", { ascending: false });

    const { data: dogs, error, count } = await query;

    if (error) {
      throw new Error(`INTERNAL_ERROR: Failed to fetch dogs: ${error.message}`);
    }

    // Filter by owner_id if provided (separate query)
    let filteredDogs = dogs;
    if (params.owner_id) {
      const { data: dogOwners, error: ownerError } = await this.supabase
        .from("dog_owners")
        .select("dog_id")
        .eq("owner_id", params.owner_id);

      if (ownerError) {
        throw new Error(
          `INTERNAL_ERROR: Failed to fetch dog owners: ${ownerError.message}`,
        );
      }

      const dogIds = dogOwners.map((rel) => rel.dog_id);
      filteredDogs = dogs.filter((dog) => dogIds.includes(dog.id));
    }

    const formattedDogs = await Promise.all(
      filteredDogs.map((dog) => this.formatResponse(dog)),
    );

    return {
      data: formattedDogs,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Gets dog by ID
   * @param id Dog ID
   * @returns Dog details
   */
  async getDogById(id: string): Promise<DogResponseDto> {
    const { data: dog, error } = await this.supabase
      .from("dogs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("NOT_FOUND: Dog not found");
      }
      throw new Error(`INTERNAL_ERROR: Failed to fetch dog: ${error.message}`);
    }

    return await this.formatResponse(dog);
  }

  /**
   * Updates dog
   * @param id Dog ID
   * @param data Update data
   * @returns Updated dog
   */
  async update(id: string, data: UpdateDogInput): Promise<DogResponseDto> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: dog, error } = await this.supabase
      .from("dogs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`INTERNAL_ERROR: Failed to update dog: ${error.message}`);
    }

    return await this.formatResponse(dog);
  }

  /**
   * Deletes dog (soft delete)
   * @param id Dog ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("dogs")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(`INTERNAL_ERROR: Failed to delete dog: ${error.message}`);
    }
  }

  /**
   * Gets dog's show history
   * @param id Dog ID
   * @param params Query parameters
   * @returns Dog history response
   */
  async getDogHistory(id: string, params?: any): Promise<any> {
    // Verify dog exists
    await this.getDogById(id);

    let query = this.supabase
      .from("evaluations")
      .select(
        `
        *,
        shows (
          id,
          name,
          show_date,
          location
        )
      `,
        { count: "exact" },
      )
      .eq("dog_id", id);

    // Apply date filters
    if (params?.from_date) {
      query = query.gte("shows.show_date", params.from_date);
    }
    if (params?.to_date) {
      query = query.lte("shows.show_date", params.to_date);
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);
    query = query.order("shows.show_date", { ascending: false });

    const { data: evaluations, error, count } = await query;

    if (error) {
      throw new Error(
        `INTERNAL_ERROR: Failed to fetch dog history: ${error.message}`,
      );
    }

    const dog = await this.getDogById(id);
    const history = evaluations.map((evaluation: any) => ({
      show: evaluation.shows,
      dog_class: evaluation.dog_class,
      grade: evaluation.grade,
      baby_puppy_grade: evaluation.baby_puppy_grade,
      club_title: evaluation.club_title,
      placement: evaluation.placement,
      evaluated_at: evaluation.created_at,
    }));

    return {
      dog: {
        id: dog.id,
        name: dog.name,
        gender: dog.gender,
        birth_date: dog.birth_date,
      },
      history,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Validates microchip number uniqueness
   * @param microchipNumber Microchip number to validate
   */
  private async validateMicrochipUniqueness(
    microchipNumber: string,
  ): Promise<void> {
    const { data: existingDog, error } = await this.supabase
      .from("dogs")
      .select("id")
      .eq("microchip_number", microchipNumber)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(
        `INTERNAL_ERROR: Failed to validate microchip: ${error.message}`,
      );
    }

    if (existingDog) {
      throw new Error("BUSINESS_RULE_ERROR: Microchip number already exists");
    }
  }

  /**
   * Creates dog-owner relationships
   * @param dogId Dog ID
   * @param owners Array of owner relationships
   */
  private async createDogOwnerRelationships(
    dogId: string,
    owners: Array<{ id: string; is_primary: boolean }>,
  ): Promise<void> {
    const relationships = owners.map((owner) => ({
      dog_id: dogId,
      owner_id: owner.id,
      is_primary: owner.is_primary,
      created_at: new Date().toISOString(),
    }));

    const { error } = await this.supabase
      .from("dog_owners")
      .insert(relationships);

    if (error) {
      throw new Error(
        `INTERNAL_ERROR: Failed to create dog-owner relationships: ${error.message}`,
      );
    }
  }

  /**
   * Formats dog response
   * @param dog Raw dog data
   * @returns Formatted dog response
   */
  private async formatResponse(
    dog: Record<string, any>,
  ): Promise<DogResponseDto> {
    // Get owners for this dog
    const { data: dogOwners, error: ownersError } = await this.supabase
      .from("dog_owners")
      .select("owner_id, is_primary")
      .eq("dog_id", dog.id);

    if (ownersError) {
      throw new Error(
        `INTERNAL_ERROR: Failed to fetch dog owners: ${ownersError.message}`,
      );
    }

    // Get owner details
    const ownerIds = dogOwners.map((rel) => rel.owner_id);
    let owners: any[] = [];

    if (ownerIds.length > 0) {
      const { data: ownerDetails, error: ownerDetailsError } =
        await this.supabase
          .from("owners")
          .select("id, first_name, last_name, email, phone, kennel_name")
          .in("id", ownerIds);

      if (ownerDetailsError) {
        throw new Error(
          `INTERNAL_ERROR: Failed to fetch owner details: ${ownerDetailsError.message}`,
        );
      }

      owners = dogOwners.map((rel) => {
        const owner = ownerDetails.find((o) => o.id === rel.owner_id);
        return {
          id: owner?.id || rel.owner_id,
          name: owner
            ? `${owner.first_name} ${owner.last_name}`
            : "Unknown Owner",
          email: owner?.email || "",
          phone: owner?.phone || null,
          kennel_name: owner?.kennel_name || null,
          is_primary: rel.is_primary,
        };
      });
    }

    return {
      id: dog.id,
      name: dog.name,
      gender: dog.gender,
      birth_date: dog.birth_date,
      coat: dog.coat,
      microchip_number: dog.microchip_number,
      kennel_name: dog.kennel_name,
      father_name: dog.father_name,
      mother_name: dog.mother_name,
      owners,
      created_at: dog.created_at,
    };
  }
}
