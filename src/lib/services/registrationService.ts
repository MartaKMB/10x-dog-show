import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateRegistrationDto,
  UpdateRegistrationDto,
  UpdatePaymentStatusDto,
  RegistrationResponseDto,
  RegistrationStatsDto,
  RegistrationQueryParams,
  PaginatedResponseDto,
  DogClass,
  DogGender,
  ShowStatus,
} from "../../types";

// =============================================================================
// DATABASE TYPES (based on db-plan.md)
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ShowRegistrationRow {
  id: string;
  show_id: string;
  dog_id: string;
  dog_class: DogClass;
  catalog_number: number | null;
  registration_fee: number | null;
  is_paid: boolean;
  registered_at: string;
  created_at: string;
  updated_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DogRow {
  id: string;
  name: string;
  gender: DogGender;
  birth_date: string;
  microchip_number: string | null;
  kennel_name: string | null;
  father_name: string | null;
  mother_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Breed interface removed - not needed for Hovawart Club MVP

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ShowRow {
  id: string;
  name: string;
  show_type: string;
  status: ShowStatus;
  show_date: string;
  registration_deadline: string;
  branch_id: string | null;
  organizer_id: string;
  max_participants: number | null;
  description: string | null;
  entry_fee: number | null;
  language: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  scheduled_for_deletion: boolean;
}

export class RegistrationService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * Pobiera listę rejestracji dla wystawy z filtrowaniem i paginacją
   */
  async getRegistrations(
    showId: string,
    params?: RegistrationQueryParams,
  ): Promise<PaginatedResponseDto<RegistrationResponseDto>> {
    try {
      // Sprawdzenie czy wystawa istnieje
      const { data: show, error: showError } = await this.supabase
        .from("shows")
        .select("id, status")
        .eq("id", showId)
        .single();

      if (showError || !show) {
        throw new Error("NOT_FOUND: Show not found");
      }

      // Budowanie zapytania z filtrami
      let query = this.supabase
        .from("show_registrations")
        .select(
          `
          *,
          dog: dogs (
            id,
            name,
            gender,
            birth_date,
            kennel_name
          )
        `,
        )
        .eq("show_id", showId);

      // Filtry
      if (params?.dog_class) {
        query = query.eq("dog_class", params.dog_class);
      }

      if (params?.is_paid !== undefined) {
        query = query.eq("is_paid", params.is_paid);
      }

      if (params?.gender) {
        query = query.eq("dog.gender", params.gender);
      }

      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        query = query.or(`dog.name.ilike.%${searchTerm}%`);
      }

      // Paginacja
      const page = params?.page || 1;
      const limit = Math.min(params?.limit || 20, 100);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query
        .range(from, to)
        .order("registered_at", { ascending: false });

      const { data: registrations, error, count } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Obliczenie paginacji
      const total = count || 0;
      const pages = Math.ceil(total / limit);

      return {
        data: registrations || [],
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }
  }

  /**
   * Tworzy nową rejestrację psa na wystawę
   */
  async createRegistration(
    showId: string,
    data: CreateRegistrationDto,
  ): Promise<RegistrationResponseDto> {
    try {
      // 1. Sprawdzenie czy wystawa istnieje i przyjmuje rejestracje
      const { data: show, error: showError } = await this.supabase
        .from("shows")
        .select("id, status, show_date, max_participants, entry_fee")
        .eq("id", showId)
        .single();

      if (showError || !show) {
        throw new Error("NOT_FOUND: Show not found");
      }

      this.validateShowAcceptsRegistrations(show.status as ShowStatus);

      // 2. Sprawdzenie czy pies istnieje
      const { data: dog, error: dogError } = await this.supabase
        .from("dogs")
        .select("id, birth_date")
        .eq("id", data.dog_id)
        .single();

      if (dogError || !dog) {
        throw new Error("NOT_FOUND: Dog not found");
      }

      // 3. Walidacja klasy psa na podstawie wieku
      this.validateDogClassByAge(
        dog.birth_date,
        data.dog_class,
        show.show_date,
      );

      // 4. Sprawdzenie czy pies już nie jest zarejestrowany
      const { data: existingRegistration } = await this.supabase
        .from("show_registrations")
        .select("id")
        .eq("show_id", showId)
        .eq("dog_id", data.dog_id)
        .single();

      if (existingRegistration) {
        throw new Error("CONFLICT: Dog is already registered for this show");
      }

      // 5. Sprawdzenie limitu uczestników
      const { count: currentRegistrations } = await this.supabase
        .from("show_registrations")
        .select("*", { count: "exact", head: true })
        .eq("show_id", showId);

      this.validateParticipantLimit(
        currentRegistrations || 0,
        show.max_participants,
      );

      // 6. Tworzenie rejestracji
      const registrationData = {
        show_id: showId,
        dog_id: data.dog_id,
        dog_class: data.dog_class,
        is_paid: false,
        registered_at: new Date().toISOString(),
      };

      const { data: registration, error: createError } = await this.supabase
        .from("show_registrations")
        .insert(registrationData)
        .select(
          `
          *,
          dog: dogs (
            id,
            name,
            gender,
            birth_date,
            kennel_name
          )
        `,
        )
        .single();

      if (createError) {
        throw new Error(`Database error: ${createError.message}`);
      }

      return this.formatRegistrationResponse(registration);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }
  }

  /**
   * Aktualizuje rejestrację psa
   */
  async updateRegistration(
    showId: string,
    registrationId: string,
    data: UpdateRegistrationDto,
  ): Promise<RegistrationResponseDto> {
    try {
      // 1. Sprawdzenie czy wystawa istnieje
      const { data: show, error: showError } = await this.supabase
        .from("shows")
        .select("id, status, show_date")
        .eq("id", showId)
        .single();

      if (showError || !show) {
        throw new Error("NOT_FOUND: Show not found");
      }

      // 2. Sprawdzenie czy można edytować (wystawa nie rozpoczęta)
      this.validateShowEditable(show.status, "update registration");

      // 3. Sprawdzenie czy rejestracja istnieje
      const { data: existingRegistration, error: regError } =
        await this.supabase
          .from("show_registrations")
          .select("*, dog: dogs(birth_date)")
          .eq("id", registrationId)
          .eq("show_id", showId)
          .single();

      if (regError || !existingRegistration) {
        throw new Error("NOT_FOUND: Registration not found");
      }

      // 4. Walidacja klasy psa jeśli jest zmieniana
      if (data.dog_class && data.dog_class !== existingRegistration.dog_class) {
        this.validateDogClassByAge(
          existingRegistration.dog.birth_date,
          data.dog_class,
          show.show_date,
        );
      }

      // 5. Aktualizacja rejestracji
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: registration, error: updateError } = await this.supabase
        .from("show_registrations")
        .update(updateData)
        .eq("id", registrationId)
        .select(
          `
          *,
          dog: dogs (
            id,
            name,
            gender,
            birth_date
          )
        `,
        )
        .single();

      if (updateError) {
        throw new Error(`Database error: ${updateError.message}`);
      }

      return this.formatRegistrationResponse(registration);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }
  }

  /**
   * Usuwa rejestrację psa
   */
  async deleteRegistration(
    showId: string,
    registrationId: string,
  ): Promise<void> {
    try {
      // 1. Sprawdzenie czy wystawa istnieje
      const { data: show, error: showError } = await this.supabase
        .from("shows")
        .select("id, status")
        .eq("id", showId)
        .single();

      if (showError || !show) {
        throw new Error("NOT_FOUND: Show not found");
      }

      // 2. Sprawdzenie czy można usunąć (wystawa nie rozpoczęta)
      this.validateShowEditable(show.status, "delete registration");

      // 3. Sprawdzenie czy rejestracja istnieje
      const { data: registration, error: regError } = await this.supabase
        .from("show_registrations")
        .select("id")
        .eq("id", registrationId)
        .eq("show_id", showId)
        .single();

      if (regError || !registration) {
        throw new Error("NOT_FOUND: Registration not found");
      }

      // 4. Usunięcie rejestracji
      const { error: deleteError } = await this.supabase
        .from("show_registrations")
        .delete()
        .eq("id", registrationId);

      if (deleteError) {
        throw new Error(`Database error: ${deleteError.message}`);
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }
  }

  /**
   * Aktualizuje status płatności rejestracji
   */
  async updatePaymentStatus(
    showId: string,
    registrationId: string,
    data: UpdatePaymentStatusDto,
  ): Promise<RegistrationResponseDto> {
    try {
      // 1. Sprawdzenie czy rejestracja istnieje
      const { data: registration, error: regError } = await this.supabase
        .from("show_registrations")
        .select("id")
        .eq("id", registrationId)
        .eq("show_id", showId)
        .single();

      if (regError || !registration) {
        throw new Error("NOT_FOUND: Registration not found");
      }

      // 2. Aktualizacja statusu płatności
      const updateData = {
        is_paid: data.is_paid,
        payment_date: data.is_paid
          ? data.payment_date || new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedRegistration, error: updateError } =
        await this.supabase
          .from("show_registrations")
          .update(updateData)
          .eq("id", registrationId)
          .select(
            `
          *,
          dog: dogs (
            id,
            name,
            gender,
            birth_date
          )
        `,
          )
          .single();

      if (updateError) {
        throw new Error(`Database error: ${updateError.message}`);
      }

      return this.formatRegistrationResponse(updatedRegistration);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }
  }

  /**
   * Pobiera statystyki rejestracji dla wystawy
   */
  async getRegistrationStats(showId: string): Promise<RegistrationStatsDto> {
    try {
      // Sprawdzenie czy wystawa istnieje
      const { data: show, error: showError } = await this.supabase
        .from("shows")
        .select("id")
        .eq("id", showId)
        .single();

      if (showError || !show) {
        throw new Error("NOT_FOUND: Show not found");
      }

      // Pobranie wszystkich rejestracji dla statystyk
      const { data: registrations, error } = await this.supabase
        .from("show_registrations")
        .select(
          `
          dog_class,
          dog: dogs (
            gender
          )
        `,
        )
        .eq("show_id", showId);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Obliczenie statystyk

      const stats = this.calculateRegistrationStats(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (registrations as any) || [],
      );
      return stats;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private validateShowAcceptsRegistrations(status: ShowStatus): void {
    if (status !== "draft") {
      throw new Error(
        "BUSINESS_RULE_ERROR: Show is not accepting registrations",
      );
    }
  }

  private validateShowEditable(status: ShowStatus, action: string): void {
    if (status === "completed") {
      throw new Error(
        `BUSINESS_RULE_ERROR: Cannot ${action} for completed shows`,
      );
    }
  }

  private validateDogClassByAge(
    birthDate: string,
    dogClass: DogClass,
    showDate: string,
  ): void {
    const birth = new Date(birthDate);
    const show = new Date(showDate);
    const ageInMonths =
      (show.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

    const classAgeRequirements: Record<DogClass, { min: number; max: number }> =
      {
        baby: { min: 3, max: 6 },
        puppy: { min: 6, max: 9 },
        junior: { min: 9, max: 18 },
        intermediate: { min: 15, max: 24 },
        open: { min: 15, max: 999 },
        working: { min: 15, max: 999 },
        champion: { min: 15, max: 999 },
        veteran: { min: 84, max: 999 },
      };

    const requirements = classAgeRequirements[dogClass];
    if (ageInMonths < requirements.min || ageInMonths > requirements.max) {
      throw new Error(
        `VALIDATION_ERROR: Dog age (${Math.floor(ageInMonths)} months) does not match selected class (${dogClass})`,
      );
    }
  }

  private validateParticipantLimit(
    currentCount: number,
    maxParticipants: number | null,
  ): void {
    if (maxParticipants && currentCount >= maxParticipants) {
      throw new Error(
        "CONFLICT: Maximum participants limit reached for this show",
      );
    }
  }

  private formatRegistrationResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registration: any,
  ): RegistrationResponseDto {
    return {
      id: registration.id,
      dog: {
        id: registration.dog.id,
        name: registration.dog.name,
        gender: registration.dog.gender,
        birth_date: registration.dog.birth_date,
        microchip_number: null,
        kennel_name: null,
        father_name: null,
        mother_name: null,
        owners: [],
      },
      dog_class: registration.dog_class,
      catalog_number: registration.catalog_number,
      registered_at: registration.registered_at,
    };
  }

  private calculateRegistrationStats(
    registrations: {
      dog_class: DogClass;
      is_paid: boolean;
      registration_fee: number | null;
      dog?: {
        gender?: DogGender;
      };
    }[],
  ): RegistrationStatsDto {
    const stats: RegistrationStatsDto = {
      total_registrations: registrations.length,
      by_class: {} as Record<DogClass, number>,
      by_gender: {} as Record<DogGender, number>,
    };

    registrations.forEach((reg) => {
      // Klasa psa
      stats.by_class[reg.dog_class] = (stats.by_class[reg.dog_class] || 0) + 1;

      // Płeć psa
      const gender = reg.dog?.gender;
      if (gender) {
        stats.by_gender[gender] = (stats.by_gender[gender] || 0) + 1;
      }
    });

    return stats;
  }
}
