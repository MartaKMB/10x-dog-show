import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DogResponseDto,
  DogDetailResponseDto,
  PaginatedResponseDto,
} from "../../types";
import type {
  CreateDogInput,
  UpdateDogInput,
  DogQueryInput,
} from "../validation/dogSchemas";

export class DogService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create a new dog with owner relationships
   */
  async create(data: CreateDogInput): Promise<DogResponseDto> {
    const { data: existingDog } = await this.supabase
      .from("dog_shows.dogs")
      .select("id")
      .eq("microchip_number", data.microchip_number)
      .is("deleted_at", null)
      .single();

    if (existingDog) {
      throw new Error("CONFLICT: Microchip number already exists");
    }

    // Check if breed exists
    const { data: breed, error: breedError } = await this.supabase
      .from("dictionary.breeds")
      .select("id, name_pl, name_en, fci_group")
      .eq("id", data.breed_id)
      .eq("is_active", true)
      .single();

    if (breedError || !breed) {
      throw new Error("NOT_FOUND: Breed not found");
    }

    // Check if all owners exist
    const ownerIds = data.owners.map((owner: { id: string }) => owner.id);
    const { data: owners, error: ownersError } = await this.supabase
      .from("dog_shows.owners")
      .select("id, first_name, last_name, email")
      .in("id", ownerIds)
      .is("deleted_at", null);

    if (ownersError || !owners || owners.length !== ownerIds.length) {
      throw new Error("NOT_FOUND: One or more owners not found");
    }

    // Create dog in transaction
    const { data: dog, error: dogError } = await this.supabase
      .from("dog_shows.dogs")
      .insert({
        name: data.name,
        breed_id: data.breed_id,
        gender: data.gender,
        birth_date: data.birth_date,
        microchip_number: data.microchip_number,
        kennel_club_number: data.kennel_club_number,
        kennel_name: data.kennel_name,
        father_name: data.father_name,
        mother_name: data.mother_name,
      })
      .select()
      .single();

    if (dogError) {
      throw new Error(
        `INTERNAL_ERROR: Failed to create dog - ${dogError.message}`,
      );
    }

    // Create owner relationships
    const ownerRelationships = data.owners.map(
      (owner: { id: string; is_primary: boolean }) => ({
        dog_id: dog.id,
        owner_id: owner.id,
        is_primary: owner.is_primary,
      }),
    );

    const { error: relationshipError } = await this.supabase
      .from("dog_shows.dog_owners")
      .insert(ownerRelationships);

    if (relationshipError) {
      // Rollback dog creation if relationships fail
      await this.supabase.from("dog_shows.dogs").delete().eq("id", dog.id);
      throw new Error(
        `INTERNAL_ERROR: Failed to create owner relationships - ${relationshipError.message}`,
      );
    }

    // Return created dog with relationships
    return this.getById(dog.id);
  }

  /**
   * Get dogs with pagination and filters
   */
  async getMany(
    query: DogQueryInput,
  ): Promise<PaginatedResponseDto<DogResponseDto>> {
    const { page, limit, ...filters } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.supabase
      .from("dog_shows.dogs")
      .select("*")
      .is("deleted_at", null);

    // Apply filters
    if (filters.breed_id) {
      queryBuilder = queryBuilder.eq("breed_id", filters.breed_id);
    }
    if (filters.gender) {
      queryBuilder = queryBuilder.eq("gender", filters.gender);
    }
    if (filters.microchip_number) {
      queryBuilder = queryBuilder.eq(
        "microchip_number",
        filters.microchip_number,
      );
    }
    if (filters.kennel_club_number) {
      queryBuilder = queryBuilder.eq(
        "kennel_club_number",
        filters.kennel_club_number,
      );
    }
    if (filters.owner_id) {
      // Filter by owner_id using a subquery approach
      const { data: dogIds } = await this.supabase
        .from("dog_shows.dog_owners")
        .select("dog_id")
        .eq("owner_id", filters.owner_id);

      if (dogIds && dogIds.length > 0) {
        const ids = dogIds.map((item: { dog_id: string }) => item.dog_id);
        queryBuilder = queryBuilder.in("id", ids);
      } else {
        // If no dogs found for this owner, return empty result
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        };
      }
    }

    // Get total count
    const { data: allDogs, error: countError } = await queryBuilder;
    if (countError) {
      throw new Error(
        `INTERNAL_ERROR: Failed to get count - ${countError.message}`,
      );
    }
    const count = allDogs?.length || 0;

    // Get paginated results
    const { data: dogs, error: dogsError } = await queryBuilder
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (dogsError) {
      throw new Error(
        `INTERNAL_ERROR: Failed to get dogs - ${dogsError.message}`,
      );
    }

    // Get breed and owner data for each dog
    const transformedDogs: DogResponseDto[] = [];
    for (const dog of dogs || []) {
      // Get breed data
      const { data: breed } = await this.supabase
        .from("dictionary.breeds")
        .select("id, name_pl, name_en, fci_group")
        .eq("id", dog.breed_id)
        .single();

      // Get owner relationships
      const { data: dogOwners } = await this.supabase
        .from("dog_shows.dog_owners")
        .select(
          `
          is_primary,
          owner:dog_shows.owners(id, first_name, last_name, email)
        `,
        )
        .eq("dog_id", dog.id);

      transformedDogs.push({
        id: dog.id,
        name: dog.name,
        gender: dog.gender,
        birth_date: dog.birth_date,
        microchip_number: dog.microchip_number,
        kennel_club_number: dog.kennel_club_number,
        kennel_name: dog.kennel_name,
        father_name: dog.father_name,
        mother_name: dog.mother_name,
        created_at: dog.created_at,
        updated_at: dog.updated_at,
        deleted_at: dog.deleted_at,
        scheduled_for_deletion: dog.scheduled_for_deletion,
        breed: breed || { id: "", name_pl: "", name_en: "", fci_group: "G1" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        owners: (dogOwners || []).map((rel: any) => ({
          id: rel.owner.id,
          first_name: rel.owner.first_name,
          last_name: rel.owner.last_name,
          email: rel.owner.email,
          is_primary: rel.is_primary,
        })),
      });
    }

    return {
      data: transformedDogs,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Get dog by ID with detailed information
   */
  async getById(id: string): Promise<DogDetailResponseDto> {
    const { data: dog, error } = await this.supabase
      .from("dog_shows.dogs")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !dog) {
      throw new Error("NOT_FOUND: Dog not found");
    }

    // Get breed data
    const { data: breed } = await this.supabase
      .from("dictionary.breeds")
      .select("*")
      .eq("id", dog.breed_id)
      .single();

    // Get owner relationships
    const { data: dogOwners } = await this.supabase
      .from("dog_shows.dog_owners")
      .select(
        `
        is_primary,
        owner:dog_shows.owners(id, first_name, last_name, email, phone)
      `,
      )
      .eq("dog_id", dog.id);

    return {
      id: dog.id,
      name: dog.name,
      gender: dog.gender,
      birth_date: dog.birth_date,
      microchip_number: dog.microchip_number,
      kennel_club_number: dog.kennel_club_number,
      kennel_name: dog.kennel_name,
      father_name: dog.father_name,
      mother_name: dog.mother_name,
      created_at: dog.created_at,
      updated_at: dog.updated_at,
      deleted_at: dog.deleted_at,
      scheduled_for_deletion: dog.scheduled_for_deletion,
      breed: breed || {
        id: "",
        name_pl: "",
        name_en: "",
        fci_group: "G1",
        fci_number: null,
        is_active: true,
        created_at: "",
        updated_at: "",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      owners: (dogOwners || []).map((rel: any) => ({
        id: rel.owner.id,
        first_name: rel.owner.first_name,
        last_name: rel.owner.last_name,
        email: rel.owner.email,
        phone: rel.owner.phone,
        is_primary: rel.is_primary,
      })),
    };
  }

  /**
   * Update dog information
   */
  async update(id: string, data: UpdateDogInput): Promise<DogResponseDto> {
    // Check if dog exists
    const { data: existingDog, error: checkError } = await this.supabase
      .from("dog_shows.dogs")
      .select("id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (checkError || !existingDog) {
      throw new Error("NOT_FOUND: Dog not found");
    }

    // Update dog
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: dog, error: updateError } = await this.supabase
      .from("dog_shows.dogs")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new Error(
        `INTERNAL_ERROR: Failed to update dog - ${updateError.message}`,
      );
    }

    // Return updated dog with relationships
    return this.getById(id);
  }

  /**
   * Soft delete dog
   */
  async delete(id: string): Promise<void> {
    // Check if dog exists
    const { data: existingDog, error: checkError } = await this.supabase
      .from("dog_shows.dogs")
      .select("id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (checkError || !existingDog) {
      throw new Error("NOT_FOUND: Dog not found");
    }

    // Soft delete
    const { error: deleteError } = await this.supabase
      .from("dog_shows.dogs")
      .update({
        deleted_at: new Date().toISOString(),
        scheduled_for_deletion: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (deleteError) {
      throw new Error(
        `INTERNAL_ERROR: Failed to delete dog - ${deleteError.message}`,
      );
    }
  }
}
