/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateDescriptionInput } from "../validation/descriptionSchemas";
import type { DescriptionResponseDto } from "../../types";

// Mock data dla testów
const MOCK_DATA = {
  shows: [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      status: "in_progress",
      name: "National Dog Show Warsaw 2024",
      show_date: "2024-03-15",
      show_type: "national" as const,
    },
  ],
  dogs: [
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      breed_id: "550e8400-e29b-41d4-a716-446655440101",
      name: "Bella",
      gender: "female" as const,
      birth_date: "2022-05-15",
      microchip_number: "123456789012345",
    },
  ],
  judges: [
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      first_name: "Jan",
      last_name: "Kowalski",
      license_number: "PL001",
    },
  ],
  breeds: [
    {
      id: "550e8400-e29b-41d4-a716-446655440101",
      name_pl: "Labrador retriever",
      name_en: "Labrador Retriever",
      fci_group: "G8" as const,
    },
  ],
  secretary_assignments: [
    {
      id: "550e8400-e29b-41d4-a716-446655440201",
      show_id: "550e8400-e29b-41d4-a716-446655440001",
      secretary_id: "00000000-0000-0000-0000-000000000001",
      breed_id: "550e8400-e29b-41d4-a716-446655440101",
    },
  ],
  users: [
    {
      id: "00000000-0000-0000-0000-000000000001",
      raw_user_meta_data: {
        first_name: "Test",
        last_name: "Secretary",
      },
    },
  ],
  descriptions: [] as any[], // Start empty for creation tests
};

export class DescriptionService {
  constructor(private supabase: SupabaseClient<any>) {}

  async create(
    data: CreateDescriptionInput,
    secretaryId: string,
  ): Promise<DescriptionResponseDto> {
    // 1. Validate business rules
    await this.validateBusinessRules(data, secretaryId);

    // 2. Check if description already exists
    await this.checkDescriptionExists(data);

    // 3. Create description in transaction
    const description = await this.createDescriptionTransaction(
      data,
      secretaryId,
    );

    // 4. Return formatted response
    return this.formatResponse(description);
  }

  private async validateBusinessRules(
    data: CreateDescriptionInput,
    secretaryId: string,
  ): Promise<void> {
    // Mock: Check if show exists and is not completed
    const show = MOCK_DATA.shows.find((s) => s.id === data.show_id);

    if (!show) {
      throw new Error("NOT_FOUND: Show not found");
    }

    if (show.status === "completed" || show.status === "cancelled") {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot create descriptions for completed or cancelled shows",
      );
    }

    // Mock: Check if dog exists
    const dog = MOCK_DATA.dogs.find((d) => d.id === data.dog_id);

    if (!dog) {
      throw new Error("NOT_FOUND: Dog not found");
    }

    // Mock: Check if judge exists
    const judge = MOCK_DATA.judges.find((j) => j.id === data.judge_id);

    if (!judge) {
      throw new Error("NOT_FOUND: Judge not found");
    }

    // Mock: Check if secretary has permission for this breed
    const assignment = MOCK_DATA.secretary_assignments.find(
      (a) =>
        a.show_id === data.show_id &&
        a.secretary_id === secretaryId &&
        a.breed_id === dog.breed_id,
    );

    if (!assignment) {
      throw new Error(
        "AUTHORIZATION_ERROR: Secretary not assigned to this breed for this show",
      );
    }
  }

  private async checkDescriptionExists(
    data: CreateDescriptionInput,
  ): Promise<void> {
    // Mock: Check if description already exists
    const existing = MOCK_DATA.descriptions.find(
      (d) =>
        d.show_id === data.show_id &&
        d.dog_id === data.dog_id &&
        d.judge_id === data.judge_id,
    );

    if (existing) {
      throw new Error(
        "CONFLICT: Description already exists for this dog and judge in this show",
      );
    }
  }

  private async createDescriptionTransaction(
    data: CreateDescriptionInput,
    secretaryId: string,
  ): Promise<Record<string, any>> {
    // Mock: Create the main description record
    const newDescription = {
      id: crypto.randomUUID(),
      show_id: data.show_id,
      dog_id: data.dog_id,
      judge_id: data.judge_id,
      secretary_id: secretaryId,
      content_pl: data.content_pl || null,
      content_en: data.content_en || null,
      version: 1,
      is_final: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      finalized_at: null,
    };

    // Mock: Add to descriptions array
    MOCK_DATA.descriptions.push(newDescription);

    return newDescription;
  }

  private async formatResponse(
    description: Record<string, any>,
  ): Promise<DescriptionResponseDto> {
    // Mock: Fetch related data for response
    const show = MOCK_DATA.shows.find((s) => s.id === description.show_id);
    const dog = MOCK_DATA.dogs.find((d) => d.id === description.dog_id);
    const judge = MOCK_DATA.judges.find((j) => j.id === description.judge_id);
    const secretary = MOCK_DATA.users.find(
      (u) => u.id === description.secretary_id,
    );
    const breed = dog
      ? MOCK_DATA.breeds.find((b) => b.id === dog.breed_id)
      : null;

    return {
      id: description.id,
      show: show
        ? {
            id: show.id,
            name: show.name,
            show_date: show.show_date,
            show_type: show.show_type,
          }
        : {
            id: "",
            name: "",
            show_date: "",
            show_type: "national" as const,
          },
      dog: dog
        ? {
            id: dog.id,
            name: dog.name,
            breed: breed
              ? {
                  id: breed.id,
                  name_pl: breed.name_pl,
                  name_en: breed.name_en,
                  fci_group: breed.fci_group,
                }
              : {
                  id: "",
                  name_pl: "",
                  name_en: "",
                  fci_group: "G1" as const,
                },
            gender: dog.gender,
            birth_date: dog.birth_date,
            microchip_number: dog.microchip_number,
          }
        : {
            id: "",
            name: "",
            breed: {
              id: "",
              name_pl: "",
              name_en: "",
              fci_group: "G1" as const,
            },
            gender: "male" as const,
            birth_date: "",
            microchip_number: "",
          },
      judge: judge
        ? {
            id: judge.id,
            first_name: judge.first_name,
            last_name: judge.last_name,
            license_number: judge.license_number,
          }
        : {
            id: "",
            first_name: "",
            last_name: "",
            license_number: "",
          },
      secretary: secretary
        ? {
            id: secretary.id,
            first_name: secretary.raw_user_meta_data?.first_name || "",
            last_name: secretary.raw_user_meta_data?.last_name || "",
          }
        : {
            id: "",
            first_name: "",
            last_name: "",
          },
      content_pl: description.content_pl,
      content_en: description.content_en,
      version: description.version,
      is_final: description.is_final,
      created_at: description.created_at,
      updated_at: description.updated_at,
      finalized_at: description.finalized_at,
    };
  }
}
