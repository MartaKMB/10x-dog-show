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
  shows: [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "National Dog Show Warsaw 2024",
      show_type: "national",
      status: "in_progress",
      show_date: "2024-03-15",
      registration_deadline: "2024-03-01",
      venue_id: "550e8400-e29b-41d4-a716-446655440201",
      organizer_id: "00000000-0000-0000-0000-000000000002",
      max_participants: 500,
      description: "Międzynarodowa wystawa psów rasowych",
      entry_fee: 150.0,
      language: "pl",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      deleted_at: null,
      scheduled_for_deletion: false,
    },
  ] as any[],
};

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
    const birth = new Date(birthDate);
    const show = new Date(showDate);
    const ageInMonths =
      (show.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

    switch (dogClass) {
      case "baby":
        if (ageInMonths < 3 || ageInMonths >= 6) {
          throw new Error(
            `BUSINESS_RULE_ERROR: Dog must be 3-6 months old for baby class. Current age: ${Math.floor(ageInMonths)} months`,
          );
        }
        break;
      case "puppy":
        if (ageInMonths < 6 || ageInMonths >= 9) {
          throw new Error(
            `BUSINESS_RULE_ERROR: Dog must be 6-9 months old for puppy class. Current age: ${Math.floor(ageInMonths)} months`,
          );
        }
        break;
      case "junior":
        if (ageInMonths < 9 || ageInMonths >= 18) {
          throw new Error(
            `BUSINESS_RULE_ERROR: Dog must be 9-18 months old for junior class. Current age: ${Math.floor(ageInMonths)} months`,
          );
        }
        break;
      case "intermediate":
        if (ageInMonths < 15 || ageInMonths >= 24) {
          throw new Error(
            `BUSINESS_RULE_ERROR: Dog must be 15-24 months old for intermediate class. Current age: ${Math.floor(ageInMonths)} months`,
          );
        }
        break;
      case "open":
        if (ageInMonths < 15) {
          throw new Error(
            `BUSINESS_RULE_ERROR: Dog must be at least 15 months old for open class. Current age: ${Math.floor(ageInMonths)} months`,
          );
        }
        break;
      case "working":
        if (ageInMonths < 15) {
          throw new Error(
            `BUSINESS_RULE_ERROR: Dog must be at least 15 months old for working class. Current age: ${Math.floor(ageInMonths)} months`,
          );
        }
        break;
      case "champion":
        if (ageInMonths < 15) {
          throw new Error(
            `BUSINESS_RULE_ERROR: Dog must be at least 15 months old for champion class. Current age: ${Math.floor(ageInMonths)} months`,
          );
        }
        break;
      case "veteran":
        if (ageInMonths < 96) {
          // 8 years
          throw new Error(
            `BUSINESS_RULE_ERROR: Dog must be at least 8 years old for veteran class. Current age: ${Math.floor(ageInMonths / 12)} years`,
          );
        }
        break;
      default:
        throw new Error(`BUSINESS_RULE_ERROR: Invalid dog class: ${dogClass}`);
    }

    return true;
  }

  /**
   * Validates if show is in editable state
   * @param showStatus Current show status
   * @param operation Operation being performed
   * @returns true if valid, throws error if invalid
   */
  private validateShowEditable(showStatus: string, operation: string): boolean {
    const nonEditableStatuses = ["in_progress", "completed", "cancelled"];

    if (nonEditableStatuses.includes(showStatus)) {
      throw new Error(
        `BUSINESS_RULE_ERROR: Cannot ${operation} for shows with status '${showStatus}'`,
      );
    }

    return true;
  }

  /**
   * Validates participant limits
   * @param showId Show ID
   * @param currentCount Current registration count
   * @param maxParticipants Maximum allowed participants
   * @returns true if valid, throws error if invalid
   */
  private validateParticipantLimit(
    currentCount: number,
    maxParticipants: number | null,
  ): boolean {
    if (maxParticipants && currentCount >= maxParticipants) {
      throw new Error(
        `CONFLICT: Maximum participants limit (${maxParticipants}) reached for this show`,
      );
    }

    return true;
  }

  /**
   * Validates if dog is already registered for the show
   * @param showId Show ID
   * @param dogId Dog ID
   * @returns true if not registered, throws error if already registered
   */
  private validateNoDuplicateRegistration(
    showId: string,
    dogId: string,
  ): boolean {
    // Mock: Check if dog is already registered
    // In real implementation, this would query the database
    const existingRegistrations =
      MOCK_DATA.shows.find((s) => s.id === showId)?.registrations || [];

    const isAlreadyRegistered = existingRegistrations.some(
      (reg: any) => reg.dog_id === dogId,
    );

    if (isAlreadyRegistered) {
      throw new Error(`CONFLICT: Dog is already registered for this show`);
    }

    return true;
  }

  /**
   * Validates if show accepts registrations
   * @param showStatus Current show status
   * @returns true if valid, throws error if invalid
   */
  private validateShowAcceptsRegistrations(showStatus: string): boolean {
    const registrationStatuses = ["draft", "open_for_registration"];

    if (!registrationStatuses.includes(showStatus)) {
      throw new Error(
        `BUSINESS_RULE_ERROR: Show is not accepting registrations. Current status: '${showStatus}'`,
      );
    }

    return true;
  }

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

  async getShowById(id: string): Promise<any> {
    const show = MOCK_DATA.shows.find((s) => s.id === id);
    if (!show) {
      throw new Error("NOT_FOUND: Show not found");
    }
    return this.formatResponse(show);
  }

  async update(id: string, data: any): Promise<any> {
    const show = MOCK_DATA.shows.find((s) => s.id === id);
    if (!show) {
      throw new Error("NOT_FOUND: Show not found");
    }

    // Update show data
    Object.assign(show, data, { updated_at: new Date().toISOString() });
    return this.formatResponse(show);
  }

  async delete(id: string): Promise<void> {
    const showIndex = MOCK_DATA.shows.findIndex((s) => s.id === id);
    if (showIndex === -1) {
      throw new Error("NOT_FOUND: Show not found");
    }

    MOCK_DATA.shows.splice(showIndex, 1);
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const show = MOCK_DATA.shows.find((s) => s.id === id);
    if (!show) {
      throw new Error("NOT_FOUND: Show not found");
    }

    show.status = status;
    show.updated_at = new Date().toISOString();
    return this.formatResponse(show);
  }

  async getRegistrations(showId: string, params?: any): Promise<any> {
    // Mock: Return registrations with pagination
    const registrations = [
      {
        id: "reg-1",
        show_id: showId,
        dog: {
          id: "dog-1",
          name: "Bella",
          breed: {
            name_pl: "Labrador retriever",
            name_en: "Labrador Retriever",
            fci_group: "G8" as const,
          },
          gender: "female" as const,
          birth_date: "2022-05-15",
        },
        dog_class: "open" as const,
        catalog_number: 45,
        registration_fee: 150.0,
        is_paid: true,
        payment_date: "2024-01-15T10:30:00Z",
        registered_at: "2024-01-15T10:30:00Z",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
      },
      {
        id: "reg-2",
        show_id: showId,
        dog: {
          id: "dog-2",
          name: "Max",
          breed: {
            name_pl: "Owczarek niemiecki",
            name_en: "German Shepherd",
            fci_group: "G1" as const,
          },
          gender: "male" as const,
          birth_date: "2021-08-20",
        },
        dog_class: "champion" as const,
        catalog_number: 12,
        registration_fee: 150.0,
        is_paid: false,
        payment_date: null,
        registered_at: "2024-01-16T14:20:00Z",
        created_at: "2024-01-16T14:20:00Z",
        updated_at: "2024-01-16T14:20:00Z",
      },
    ];

    // Apply filters if provided
    let filteredRegistrations = registrations;

    if (params) {
      if (params.dog_class) {
        filteredRegistrations = filteredRegistrations.filter(
          (reg) => reg.dog_class === params.dog_class,
        );
      }

      if (params.is_paid !== undefined) {
        filteredRegistrations = filteredRegistrations.filter(
          (reg) => reg.is_paid === params.is_paid,
        );
      }

      if (params.breed_id) {
        filteredRegistrations = filteredRegistrations.filter(
          (reg) => reg.dog.id === params.breed_id,
        );
      }

      if (params.gender) {
        filteredRegistrations = filteredRegistrations.filter(
          (reg) => reg.dog.gender === params.gender,
        );
      }

      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredRegistrations = filteredRegistrations.filter(
          (reg) =>
            reg.dog.name.toLowerCase().includes(searchLower) ||
            reg.dog.breed.name_pl.toLowerCase().includes(searchLower) ||
            reg.dog.breed.name_en.toLowerCase().includes(searchLower),
        );
      }
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRegistrations = filteredRegistrations.slice(
      startIndex,
      endIndex,
    );

    return {
      registrations: paginatedRegistrations,
      pagination: {
        page,
        limit,
        total: filteredRegistrations.length,
        pages: Math.ceil(filteredRegistrations.length / limit),
      },
    };
  }

  async createRegistration(showId: string, data: any): Promise<any> {
    // 1. Validate show exists and is in registration state
    const show = MOCK_DATA.shows.find((s) => s.id === showId);
    if (!show) {
      throw new Error("NOT_FOUND: Show not found");
    }

    // 2. Validate show accepts registrations
    this.validateShowAcceptsRegistrations(show.status);

    // 3. Validate dog age vs class
    // Mock dog data - in real implementation this would come from database
    const mockDog = {
      id: data.dog_id,
      birth_date: "2022-05-15", // Mock birth date
    };
    this.validateDogClassByAge(
      mockDog.birth_date,
      data.dog_class,
      show.show_date,
    );

    // 4. Validate no duplicate registration
    this.validateNoDuplicateRegistration(showId, data.dog_id);

    // 5. Validate participant limit
    const currentRegistrations =
      MOCK_DATA.shows.find((s) => s.id === showId)?.registrations?.length || 0;
    this.validateParticipantLimit(currentRegistrations, show.max_participants);

    // 6. Create registration
    const registration = {
      id: crypto.randomUUID(),
      show_id: showId,
      dog_id: data.dog_id,
      dog_class: data.dog_class,
      registration_fee: data.registration_fee || show.entry_fee || null,
      is_paid: false,
      registered_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 7. Add to mock data (in real implementation this would be saved to database)
    if (!show.registrations) {
      show.registrations = [];
    }
    show.registrations.push(registration);

    return registration;
  }

  async updateRegistration(
    showId: string,
    registrationId: string,
    data: any,
  ): Promise<any> {
    // 1. Validate show exists and is editable
    const show = MOCK_DATA.shows.find((s) => s.id === showId);
    if (!show) {
      throw new Error("NOT_FOUND: Show not found");
    }

    // 2. Validate show is editable
    this.validateShowEditable(show.status, "update registration");

    // 3. Validate registration exists
    const existingRegistration = show.registrations?.find(
      (reg: any) => reg.id === registrationId,
    );
    if (!existingRegistration) {
      throw new Error("NOT_FOUND: Registration not found");
    }

    // 4. Validate dog age vs class if class is being updated
    if (data.dog_class && data.dog_class !== existingRegistration.dog_class) {
      const mockDog = {
        id: existingRegistration.dog_id,
        birth_date: "2022-05-15", // Mock birth date
      };
      this.validateDogClassByAge(
        mockDog.birth_date,
        data.dog_class,
        show.show_date,
      );
    }

    // 5. Update registration
    const updatedRegistration = {
      ...existingRegistration,
      ...data,
      updated_at: new Date().toISOString(),
    };

    // 6. Update in mock data
    const registrationIndex = show.registrations?.findIndex(
      (reg: any) => reg.id === registrationId,
    );
    if (registrationIndex !== undefined && registrationIndex !== -1) {
      show.registrations[registrationIndex] = updatedRegistration;
    }

    return updatedRegistration;
  }

  async deleteRegistration(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    showId?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registrationId?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentUserId?: string,
  ): Promise<void> {
    // Mock: Delete registration (no-op for now)
  }

  async getRegistrationById(
    showId: string,
    registrationId: string,
  ): Promise<any> {
    // Mock: Get registration by ID
    const registration = {
      id: registrationId,
      show_id: showId,
      dog: {
        id: "mock-dog-id",
        name: "Mock Dog",
        breed: {
          name_pl: "Labrador retriever",
          name_en: "Labrador Retriever",
          fci_group: "G8" as const,
        },
        gender: "male" as const,
        birth_date: "2022-05-15",
      },
      dog_class: "open" as const,
      catalog_number: 45,
      registration_fee: 150.0,
      is_paid: true,
      payment_date: "2024-01-15T10:30:00Z",
      registered_at: "2024-01-15T10:30:00Z",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    return registration;
  }

  async updatePaymentStatus(
    showId: string,
    registrationId: string,
    data: any,
  ): Promise<any> {
    // Mock: Update payment status
    const registration = {
      id: registrationId,
      show_id: showId,
      dog: {
        id: "mock-dog-id",
        name: "Mock Dog",
        breed: {
          name_pl: "Labrador retriever",
          name_en: "Labrador Retriever",
          fci_group: "G8" as const,
        },
        gender: "male" as const,
        birth_date: "2022-05-15",
      },
      dog_class: "open" as const,
      catalog_number: 45,
      registration_fee: 150.0,
      is_paid: data.is_paid,
      payment_date:
        data.payment_date || (data.is_paid ? new Date().toISOString() : null),
      payment_method: data.payment_method,
      registered_at: "2024-01-15T10:30:00Z",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: new Date().toISOString(),
    };
    return registration;
  }

  async getRegistrationStats(): Promise<any> {
    // Mock: Get registration statistics
    const stats = {
      total: 45,
      paid: 38,
      unpaid: 7,
      by_class: {
        baby: 5,
        puppy: 8,
        junior: 12,
        intermediate: 0,
        open: 15,
        working: 0,
        champion: 5,
        veteran: 0,
      },
      by_gender: {
        male: 25,
        female: 20,
      },
      by_breed_group: {
        G1: 8,
        G2: 0,
        G3: 0,
        G4: 0,
        G5: 0,
        G6: 0,
        G7: 0,
        G8: 15,
        G9: 12,
        G10: 10,
      },
      revenue: {
        total: 2250.0,
        paid: 1900.0,
        outstanding: 350.0,
      },
    };
    return stats;
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
