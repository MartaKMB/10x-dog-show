/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateShowInput } from "../validation/showSchemas";
import type { ShowResponseDto, PaginatedResponseDto } from "../../types";

// Mock data dla testów
const MOCK_DATA = {
  venues: [
    {
      id: "550e8400-e29b-41d4-a716-446655440201",
      name: "Warsaw Expo Center",
      address: "ul. Marywilska 44",
      city: "Warsaw",
      postal_code: "03-042",
      country: "Poland",
      is_active: true,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440202",
      name: "Krakow Congress Center",
      address: "ul. Konopnickiej 17",
      city: "Krakow",
      postal_code: "30-302",
      country: "Poland",
      is_active: true,
    },
  ],
  users: [
    {
      id: "00000000-0000-0000-0000-000000000001",
      raw_user_meta_data: {
        first_name: "Test",
        last_name: "Secretary",
      },
      role: "secretary",
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      raw_user_meta_data: {
        first_name: "John",
        last_name: "Organizer",
      },
      role: "department_representative",
    },
  ],
  shows: [] as any[], // Start empty for creation tests
};

export class ShowService {
  constructor(private supabase: SupabaseClient<any>) {}

  async create(
    data: CreateShowInput,
    organizerId: string,
  ): Promise<ShowResponseDto> {
    // 1. Validate business rules
    await this.validateBusinessRules(data, organizerId);

    // 2. Create show in transaction
    const show = await this.createShowTransaction(data, organizerId);

    // 3. Return formatted response
    return this.formatResponse(show);
  }

  async getShows(params: any): Promise<PaginatedResponseDto<ShowResponseDto>> {
    // Mock: Get shows with filtering and pagination
    let filteredShows = [...MOCK_DATA.shows];

    // Apply filters
    if (params.status) {
      filteredShows = filteredShows.filter((s) => s.status === params.status);
    }
    if (params.show_type) {
      filteredShows = filteredShows.filter(
        (s) => s.show_type === params.show_type,
      );
    }
    if (params.organizer_id) {
      filteredShows = filteredShows.filter(
        (s) => s.organizer_id === params.organizer_id,
      );
    }
    if (params.from_date) {
      filteredShows = filteredShows.filter(
        (s) => s.show_date >= params.from_date,
      );
    }
    if (params.to_date) {
      filteredShows = filteredShows.filter(
        (s) => s.show_date <= params.to_date,
      );
    }

    // Sort by show_date descending
    filteredShows.sort(
      (a, b) =>
        new Date(b.show_date).getTime() - new Date(a.show_date).getTime(),
    );

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedShows = filteredShows.slice(start, end);

    // Format response
    const formattedShows = await Promise.all(
      paginatedShows.map((show) => this.formatResponse(show)),
    );

    return {
      data: formattedShows,
      pagination: {
        page,
        limit,
        total: filteredShows.length,
        pages: Math.ceil(filteredShows.length / limit),
      },
    };
  }

  private async validateBusinessRules(
    data: CreateShowInput,
    organizerId: string,
  ): Promise<void> {
    // Mock: Check if venue exists
    const venue = MOCK_DATA.venues.find((v) => v.id === data.venue_id);

    if (!venue) {
      throw new Error("NOT_FOUND: Venue not found");
    }

    if (!venue.is_active) {
      throw new Error("BUSINESS_RULE_ERROR: Venue is not active");
    }

    // Mock: Check if organizer exists and has correct role
    const organizer = MOCK_DATA.users.find((u) => u.id === organizerId);

    if (!organizer) {
      throw new Error("NOT_FOUND: Organizer not found");
    }

    if (organizer.role !== "department_representative") {
      throw new Error(
        "AUTHORIZATION_ERROR: Only department representatives can create shows",
      );
    }

    // Check if show date is in the future
    const showDate = new Date(data.show_date);
    const now = new Date();
    if (showDate <= now) {
      throw new Error("BUSINESS_RULE_ERROR: Show date must be in the future");
    }
  }

  private async createShowTransaction(
    data: CreateShowInput,
    organizerId: string,
  ): Promise<Record<string, any>> {
    // Mock: Create the main show record
    const newShow = {
      id: crypto.randomUUID(),
      name: data.name,
      show_type: data.show_type,
      status: "draft" as const, // Always starts as draft
      show_date: data.show_date,
      registration_deadline: data.registration_deadline,
      venue_id: data.venue_id,
      organizer_id: organizerId,
      max_participants: data.max_participants || null,
      description: data.description || null,
      entry_fee: data.entry_fee || null,
      language: data.language,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      scheduled_for_deletion: false,
    };

    // Mock: Add to shows array
    MOCK_DATA.shows.push(newShow);

    return newShow;
  }

  private async formatResponse(
    show: Record<string, any>,
  ): Promise<ShowResponseDto> {
    // Mock: Fetch related data for response
    const venue = MOCK_DATA.venues.find((v) => v.id === show.venue_id);
    const organizer = MOCK_DATA.users.find((u) => u.id === show.organizer_id);

    return {
      id: show.id,
      name: show.name,
      show_type: show.show_type,
      status: show.status,
      show_date: show.show_date,
      registration_deadline: show.registration_deadline,
      venue: venue
        ? {
            id: venue.id,
            name: venue.name,
            city: venue.city,
          }
        : {
            id: "",
            name: "",
            city: "",
          },
      organizer: organizer
        ? {
            id: organizer.id,
            first_name: organizer.raw_user_meta_data?.first_name || "",
            last_name: organizer.raw_user_meta_data?.last_name || "",
          }
        : {
            id: "",
            first_name: "",
            last_name: "",
          },
      max_participants: show.max_participants,
      registered_dogs: 0, // Mock: no registrations yet
      entry_fee: show.entry_fee,
      description: show.description,
      language: show.language,
      created_at: show.created_at,
      updated_at: show.updated_at,
      deleted_at: show.deleted_at,
      scheduled_for_deletion: show.scheduled_for_deletion,
    };
  }
}
