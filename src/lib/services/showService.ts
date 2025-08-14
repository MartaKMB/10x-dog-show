/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateShowInput,
  UpdateShowInput,
} from "../validation/showSchemas";
import type {
  ShowResponseDto,
  PaginatedResponseDto,
  ShowStatus,
} from "../../types";

export class ShowService {
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * Validates if dog age matches the selected class
   * @param birthDate Dog's birth date
   * @param dogClass Selected dog class
   * @param showDate Show date for age calculation
   * @returns true if valid, throws error if invalid
   */
  private validateDogClassByAge(
    birthDate: string,
    dogClass: string,
    showDate: string,
  ): boolean {
    console.error("validateDogClassByAge called with:", {
      birthDate,
      dogClass,
      showDate,
    });

    const birth = new Date(birthDate);
    const show = new Date(showDate);
    const ageInMonths =
      (show.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

    console.error("Calculated age in months:", ageInMonths);

    switch (dogClass) {
      case "baby":
        if (ageInMonths < 4 || ageInMonths >= 6) {
          throw new Error(
            "BUSINESS_RULE_ERROR: Baby class dogs must be 4-6 months old",
          );
        }
        break;
      case "puppy":
        if (ageInMonths < 6 || ageInMonths >= 9) {
          throw new Error(
            "BUSINESS_RULE_ERROR: Puppy class dogs must be 6-9 months old",
          );
        }
        break;
      case "junior":
        if (ageInMonths < 9 || ageInMonths >= 18) {
          throw new Error(
            "BUSINESS_RULE_ERROR: Junior class dogs must be 9-18 months old",
          );
        }
        break;
      case "intermediate":
        if (ageInMonths < 15 || ageInMonths >= 24) {
          throw new Error(
            "BUSINESS_RULE_ERROR: Intermediate class dogs must be 15-24 months old",
          );
        }
        break;
      case "open":
        if (ageInMonths < 15) {
          throw new Error(
            "BUSINESS_RULE_ERROR: Open class dogs must be at least 15 months old",
          );
        }
        break;
      case "working":
        if (ageInMonths < 15) {
          throw new Error(
            "BUSINESS_RULE_ERROR: Working class dogs must be at least 15 months old",
          );
        }
        break;
      case "champion":
        if (ageInMonths < 15) {
          throw new Error(
            "BUSINESS_RULE_ERROR: Champion class dogs must be at least 15 months old",
          );
        }
        break;
      case "veteran":
        if (ageInMonths < 84) {
          // 7 years = 84 months (zgodnie z dokumentacją)
          throw new Error(
            "BUSINESS_RULE_ERROR: Veteran class dogs must be at least 7 years old",
          );
        }
        break;
      default:
        throw new Error(`BUSINESS_RULE_ERROR: Invalid dog class: ${dogClass}`);
    }

    return true;
  }

  /**
   * Validates if show can be edited based on its status
   * @param showStatus Current show status
   * @param operation Operation being performed
   * @returns true if editable, throws error if not
   */
  private validateShowEditable(showStatus: string, operation: string): boolean {
    const nonEditableStatuses = ["completed"];

    if (nonEditableStatuses.includes(showStatus)) {
      throw new Error(
        `BUSINESS_RULE_ERROR: Cannot ${operation} show with status '${showStatus}'`,
      );
    }

    return true;
  }

  /**
   * Validates no duplicate registration for the same dog
   * @param showId Show ID
   * @param dogId Dog ID
   * @returns true if no duplicate, throws error if duplicate exists
   */
  private async validateNoDuplicateRegistration(
    showId: string,
    dogId: string,
  ): Promise<boolean> {
    const { data: existingRegistration } = await this.supabase
      .from("show_registrations")
      .select("id")
      .eq("show_id", showId)
      .eq("dog_id", dogId)
      .single();

    if (existingRegistration) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Dog is already registered for this show",
      );
    }

    return true;
  }

  /**
   * Validates if show accepts registrations
   * @param showStatus Current show status
   * @returns true if accepts registrations
   */
  private validateShowAcceptsRegistrations(showStatus?: string): boolean {
    // For Hovawart Club, shows in draft status accept registrations
    // This allows for post-factum registration of historical shows
    if (showStatus) {
      return showStatus === "draft";
    }
    return true; // Backward compatibility
  }

  /**
   * Creates a new show
   * @param data Show creation data
   * @returns Created show
   */
  async create(data: CreateShowInput): Promise<ShowResponseDto> {
    await this.validateBusinessRules(data);

    const showData = {
      ...data,
      status: "draft" as ShowStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: show, error } = await this.supabase
      .from("shows")
      .insert(showData)
      .select()
      .single();

    if (error) {
      throw new Error(
        `INTERNAL_ERROR: Failed to create show: ${error.message}`,
      );
    }

    return await this.formatResponse(show);
  }

  /**
   * Gets paginated list of shows
   * @param params Query parameters
   * @returns Paginated shows response
   */
  async getShows(params: any): Promise<PaginatedResponseDto<ShowResponseDto>> {
    let query = this.supabase.from("shows").select("*", { count: "exact" });

    // Apply filters
    if (params.status) {
      query = query.eq("status", params.status);
    }
    if (params.from_date) {
      query = query.gte("show_date", params.from_date);
    }
    if (params.to_date) {
      query = query.lte("show_date", params.to_date);
    }
    if (params.search) {
      // Search in name, location, and judge_name
      query = query.or(
        `name.ilike.%${params.search}%,location.ilike.%${params.search}%,judge_name.ilike.%${params.search}%`,
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);
    query = query.order("show_date", { ascending: false });

    const { data: shows, error, count } = await query;

    if (error) {
      throw new Error(
        `INTERNAL_ERROR: Failed to fetch shows: ${error.message}`,
      );
    }

    const formattedShows = await Promise.all(
      shows.map((show) => this.formatResponse(show)),
    );

    return {
      data: formattedShows,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Validates business rules for show creation
   * @deprecated Overlap check removed for local development
   */
  private async validateBusinessRules(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data?: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _excludeShowId?: string,
  ): Promise<void> {
    // Business rules validation temporarily disabled for local development
    // This will be re-enabled when deploying to production
    return;
  }

  /**
   * Gets show by ID
   * @param id Show ID
   * @returns Show details
   */
  async getShowById(id: string): Promise<ShowResponseDto> {
    const { data: show, error } = await this.supabase
      .from("shows")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("NOT_FOUND: Show not found");
      }
      throw new Error(`INTERNAL_ERROR: Failed to fetch show: ${error.message}`);
    }

    // Return basic show data without registration count for now
    // This avoids RLS issues with show_registrations table
    return {
      id: show.id,
      name: show.name,
      status: show.status,
      show_date: show.show_date,
      location: show.location,
      judge_name: show.judge_name,
      description: show.description,
      registered_dogs: 0, // Will be fetched separately if needed
      created_at: show.created_at,
    };
  }

  /**
   * Updates show
   * @param id Show ID
   * @param data Update data
   * @returns Updated show
   */
  async update(id: string, data: UpdateShowInput): Promise<ShowResponseDto> {
    const currentShow = await this.getShowById(id);
    this.validateShowEditable(currentShow.status, "update");

    // Check for overlapping dates if show_date is being updated
    if (data.show_date) {
      await this.validateBusinessRules(
        {
          show_date: data.show_date,
          name: data.name || currentShow.name,
        },
        id,
      );
    }

    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: show, error } = await this.supabase
      .from("shows")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `INTERNAL_ERROR: Failed to update show: ${error.message}`,
      );
    }

    return await this.formatResponse(show);
  }

  /**
   * Deletes show (soft delete)
   * @param id Show ID
   */
  async delete(id: string): Promise<void> {
    const currentShow = await this.getShowById(id);
    this.validateShowEditable(currentShow.status, "delete");

    const { error } = await this.supabase
      .from("shows")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(
        `INTERNAL_ERROR: Failed to delete show: ${error.message}`,
      );
    }
  }

  /**
   * Updates show status
   * @param id Show ID
   * @param status New status
   * @returns Updated show
   */
  async updateStatus(id: string, status: ShowStatus): Promise<ShowResponseDto> {
    // For Hovawart Club, allow all status transitions
    // Shows can be moved back to draft even if completed

    const { data: show, error } = await this.supabase
      .from("shows")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `INTERNAL_ERROR: Failed to update show status: ${error.message}`,
      );
    }

    return await this.formatResponse(show);
  }

  /**
   * Gets registrations for a show
   * @param showId Show ID
   * @param params Query parameters
   * @returns Paginated registrations response
   */
  async getRegistrations(showId: string, params?: any): Promise<any> {
    // Verify show exists (basic check without formatting)
    const { error: showError } = await this.supabase
      .from("shows")
      .select("id")
      .eq("id", showId)
      .single();

    if (showError) {
      if (showError.code === "PGRST116") {
        throw new Error("NOT_FOUND: Show not found");
      }
      throw new Error(
        `INTERNAL_ERROR: Failed to fetch show: ${showError.message}`,
      );
    }

    let query = this.supabase
      .from("show_registrations")
      .select(
        `
        *,
        dogs (
          id,
          name,
          gender,
          birth_date,
          microchip_number,
          kennel_name
        )
      `,
        { count: "exact" },
      )
      .eq("show_id", showId);

    // Apply filters
    if (params?.dog_class) {
      query = query.eq("dog_class", params.dog_class);
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);
    query = query.order("registered_at", { ascending: true });

    const { data: registrations, error, count } = await query;

    if (error) {
      throw new Error(
        `INTERNAL_ERROR: Failed to fetch registrations: ${error.message}`,
      );
    }

    const formattedRegistrations = registrations.map((reg: any) => ({
      id: reg.id,
      dog: reg.dogs,
      dog_class: reg.dog_class,
      registered_at: reg.registered_at,
    }));

    return {
      data: formattedRegistrations,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Creates registration for a show
   * @param showId Show ID
   * @param data Registration data
   * @returns Created registration
   */
  async createRegistration(showId: string, data: any): Promise<any> {
    // Get basic show info without formatting for validation
    const { data: show, error: showError } = await this.supabase
      .from("shows")
      .select("id, status, show_date")
      .eq("id", showId)
      .single();

    if (showError) {
      if (showError.code === "PGRST116") {
        throw new Error("NOT_FOUND: Show not found");
      }
      throw new Error(
        `INTERNAL_ERROR: Failed to fetch show: ${showError.message}`,
      );
    }

    if (!this.validateShowAcceptsRegistrations(show.status)) {
      throw new Error(
        `BUSINESS_RULE_ERROR: Show with status '${show.status}' does not accept registrations`,
      );
    }

    // Validate dog exists
    const { data: dog, error: dogError } = await this.supabase
      .from("dogs")
      .select("id, birth_date")
      .eq("id", data.dog_id)
      .single();

    if (dogError || !dog) {
      throw new Error("NOT_FOUND: Dog not found");
    }

    // Validate dog class by age
    this.validateDogClassByAge(dog.birth_date, data.dog_class, show.show_date);

    // Check for duplicate registration (temporarily disabled for local development)
    // This will be re-enabled when deploying to production
    // await this.validateNoDuplicateRegistration(showId, data.dog_id);

    // No participant limit validation for Hovawart Club shows

    const registrationData = {
      show_id: showId,
      dog_id: data.dog_id,
      dog_class: data.dog_class,
    };

    const { data: registration, error } = await this.supabase
      .from("show_registrations")
      .insert(registrationData)
      .select(
        `
        *,
        dogs (
          id,
          name,
          gender,
          birth_date,
          microchip_number,
          kennel_name
        )
      `,
      )
      .single();

    if (error) {
      throw new Error(
        `INTERNAL_ERROR: Failed to create registration: ${error.message}`,
      );
    }

    return {
      id: registration.id,
      dog: registration.dogs,
      dog_class: registration.dog_class,
      registered_at: registration.registered_at,
    };
  }

  /**
   * Updates registration
   * @param showId Show ID
   * @param registrationId Registration ID
   * @param data Update data
   * @returns Updated registration
   */
  async updateRegistration(
    showId: string,
    registrationId: string,
    data: any,
  ): Promise<any> {
    // Get basic show info without formatting for validation
    const { data: show, error: showError } = await this.supabase
      .from("shows")
      .select("id, status, show_date")
      .eq("id", showId)
      .single();

    if (showError) {
      if (showError.code === "PGRST116") {
        throw new Error("NOT_FOUND: Show not found");
      }
      throw new Error(
        `INTERNAL_ERROR: Failed to fetch show: ${showError.message}`,
      );
    }

    if (!this.validateShowEditable(show.status, "update registration")) {
      throw new Error(
        `BUSINESS_RULE_ERROR: Cannot update registration for show with status '${show.status}'`,
      );
    }

    // Get current registration
    const { data: currentRegistration, error: fetchError } = await this.supabase
      .from("show_registrations")
      .select(
        `
        *,
        dogs (
          id,
          birth_date
        )
      `,
      )
      .eq("id", registrationId)
      .eq("show_id", showId)
      .single();

    if (fetchError || !currentRegistration) {
      throw new Error("NOT_FOUND: Registration not found");
    }

    // Validate dog class by age if changing
    if (data.dog_class && data.dog_class !== currentRegistration.dog_class) {
      this.validateDogClassByAge(
        currentRegistration.dogs.birth_date,
        data.dog_class,
        show.show_date,
      );
    }

    const updateData = {
      ...data,
    };

    const { data: registration, error } = await this.supabase
      .from("show_registrations")
      .update(updateData)
      .eq("id", registrationId)
      .select(
        `
        *,
        dogs (
          id,
          name,
          gender,
          birth_date,
          microchip_number,
          kennel_name
        )
      `,
      )
      .single();

    if (error) {
      throw new Error(
        `INTERNAL_ERROR: Failed to update registration: ${error.message}`,
      );
    }

    return {
      id: registration.id,
      dog: registration.dogs,
      dog_class: registration.dog_class,
      registered_at: registration.registered_at,
    };
  }

  /**
   * Deletes registration
   * @param showId Show ID
   * @param registrationId Registration ID
   */
  async deleteRegistration(
    showId: string,
    registrationId: string,
  ): Promise<void> {
    // Get basic show info without formatting for validation
    const { data: show, error: showError } = await this.supabase
      .from("shows")
      .select("id, status")
      .eq("id", showId)
      .single();

    if (showError) {
      if (showError.code === "PGRST116") {
        throw new Error("NOT_FOUND: Show not found");
      }
      throw new Error(
        `INTERNAL_ERROR: Failed to fetch show: ${showError.message}`,
      );
    }

    if (!this.validateShowEditable(show.status, "delete registration")) {
      throw new Error(
        `BUSINESS_RULE_ERROR: Cannot delete registration for show with status '${show.status}'`,
      );
    }

    const { error } = await this.supabase
      .from("show_registrations")
      .delete()
      .eq("id", registrationId)
      .eq("show_id", showId);

    if (error) {
      throw new Error(
        `INTERNAL_ERROR: Failed to delete registration: ${error.message}`,
      );
    }
  }

  /**
   * Formats show response
   * @param show Raw show data
   * @returns Formatted show response
   */
  private async formatResponse(
    show: Record<string, any>,
  ): Promise<ShowResponseDto> {
    // Get registration count
    const { count: registeredDogs } = await this.supabase
      .from("show_registrations")
      .select("*", { count: "exact", head: true })
      .eq("show_id", show.id);

    return {
      id: show.id,
      name: show.name,
      status: show.status,
      show_date: show.show_date,
      location: show.location,
      judge_name: show.judge_name,
      description: show.description,
      registered_dogs: registeredDogs || 0,
      created_at: show.created_at,
    };
  }
}
