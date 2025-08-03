/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateDescriptionInput } from "../validation/descriptionSchemas";
import type {
  DescriptionResponseDto,
  DescriptionQueryParams,
  PaginatedResponseDto,
} from "../../types";

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
  description_versions: [] as any[], // History of description versions
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

  async list(
    params: DescriptionQueryParams,
  ): Promise<PaginatedResponseDto<DescriptionResponseDto>> {
    // Mock: Filter descriptions based on parameters
    let filteredDescriptions = [...MOCK_DATA.descriptions];

    // Apply filters
    if (params.show_id) {
      filteredDescriptions = filteredDescriptions.filter(
        (d) => d.show_id === params.show_id,
      );
    }

    if (params.judge_id) {
      filteredDescriptions = filteredDescriptions.filter(
        (d) => d.judge_id === params.judge_id,
      );
    }

    if (params.secretary_id) {
      filteredDescriptions = filteredDescriptions.filter(
        (d) => d.secretary_id === params.secretary_id,
      );
    }

    if (params.is_final !== undefined) {
      filteredDescriptions = filteredDescriptions.filter(
        (d) => d.is_final === params.is_final,
      );
    }

    if (params.language) {
      filteredDescriptions = filteredDescriptions.filter((d) => {
        if (params.language === "pl") return d.content_pl;
        if (params.language === "en") return d.content_en;
        return true;
      });
    }

    // Calculate pagination
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const offset = (page - 1) * limit;
    const total = filteredDescriptions.length;
    const pages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedDescriptions = filteredDescriptions.slice(
      offset,
      offset + limit,
    );

    // Format responses
    const formattedDescriptions = await Promise.all(
      paginatedDescriptions.map((desc) => this.formatResponse(desc)),
    );

    return {
      data: formattedDescriptions,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  async getById(id: string): Promise<DescriptionResponseDto> {
    // Mock: Find description by ID
    const description = MOCK_DATA.descriptions.find((d) => d.id === id);

    if (!description) {
      throw new Error("NOT_FOUND: Description not found");
    }

    return this.formatResponse(description);
  }

  async update(
    id: string,
    data: any,
    secretaryId: string,
  ): Promise<DescriptionResponseDto> {
    // 1. Check if description exists
    const existingDescription = MOCK_DATA.descriptions.find((d) => d.id === id);

    if (!existingDescription) {
      throw new Error("NOT_FOUND: Description not found");
    }

    // 2. Validate business rules
    await this.validateUpdateBusinessRules(existingDescription, secretaryId);

    // 3. Create new version in transaction
    const updatedDescription = await this.updateDescriptionTransaction(
      id,
      data,
    );

    // 4. Return formatted response
    return this.formatResponse(updatedDescription);
  }

  async finalize(
    id: string,
    secretaryId: string,
  ): Promise<DescriptionResponseDto> {
    // 1. Check if description exists
    const existingDescription = MOCK_DATA.descriptions.find((d) => d.id === id);

    if (!existingDescription) {
      throw new Error("NOT_FOUND: Description not found");
    }

    // 2. Validate business rules
    await this.validateFinalizeBusinessRules(existingDescription, secretaryId);

    // 3. Finalize description in transaction
    const finalizedDescription = await this.finalizeDescriptionTransaction(id);

    // 4. Return formatted response
    return this.formatResponse(finalizedDescription);
  }

  async getVersions(id: string): Promise<{ versions: any[] }> {
    // Mock: Check if description exists
    const description = MOCK_DATA.descriptions.find((d) => d.id === id);

    if (!description) {
      throw new Error("NOT_FOUND: Description not found");
    }

    // Mock: Get versions for this description
    const versions = MOCK_DATA.description_versions
      .filter((v) => v.description_id === id)
      .sort((a, b) => b.version - a.version) // Sort by version descending
      .map((version) => ({
        id: version.id,
        version: version.version,
        content_pl: version.content_pl,
        content_en: version.content_en,
        changed_by: {
          id: version.changed_by_id,
          first_name: "Test",
          last_name: "Secretary",
        },
        change_reason: version.change_reason,
        created_at: version.created_at,
        changed_fields: version.changed_fields || [],
      }));

    return { versions };
  }

  async delete(id: string, secretaryId: string): Promise<void> {
    // 1. Check if description exists
    const existingDescription = MOCK_DATA.descriptions.find((d) => d.id === id);

    if (!existingDescription) {
      throw new Error("NOT_FOUND: Description not found");
    }

    // 2. Validate business rules
    await this.validateDeleteBusinessRules(existingDescription, secretaryId);

    // 3. Delete description in transaction
    await this.deleteDescriptionTransaction(id);
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
    // Mock: Create new description
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
      finalized_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to mock data
    MOCK_DATA.descriptions.push(newDescription);

    // Create initial version record
    const initialVersion = {
      id: crypto.randomUUID(),
      description_id: newDescription.id,
      version: 1,
      content_pl: data.content_pl || null,
      content_en: data.content_en || null,
      changed_by_id: secretaryId,
      change_reason: "Initial creation",
      created_at: new Date().toISOString(),
      changed_fields: this.getChangedFields(null, data),
    };

    // Add version to mock data
    MOCK_DATA.description_versions.push(initialVersion);

    return newDescription;
  }

  private getChangedFields(oldData: any, newData: any): string[] {
    const changedFields: string[] = [];

    if (oldData?.content_pl !== newData?.content_pl) {
      changedFields.push("content_pl");
    }

    if (oldData?.content_en !== newData?.content_en) {
      changedFields.push("content_en");
    }

    return changedFields;
  }

  private async validateUpdateBusinessRules(
    description: any,
    secretaryId: string,
  ): Promise<void> {
    // Check if description is finalized
    if (description.is_final) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot update finalized descriptions",
      );
    }

    // Check if secretary has permission (mock validation)
    if (description.secretary_id !== secretaryId) {
      throw new Error(
        "AUTHORIZATION_ERROR: Secretary not authorized to update this description",
      );
    }

    // Check if show is still in progress
    const show = MOCK_DATA.shows.find((s) => s.id === description.show_id);
    if (show && (show.status === "completed" || show.status === "cancelled")) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot update descriptions for completed or cancelled shows",
      );
    }
  }

  private async validateFinalizeBusinessRules(
    description: any,
    secretaryId: string,
  ): Promise<void> {
    // Check if description is already finalized
    if (description.is_final) {
      throw new Error("BUSINESS_RULE_ERROR: Description is already finalized");
    }

    // Check if secretary has permission (mock validation)
    if (description.secretary_id !== secretaryId) {
      throw new Error(
        "AUTHORIZATION_ERROR: Secretary not authorized to finalize this description",
      );
    }

    // Check if show is still in progress
    const show = MOCK_DATA.shows.find((s) => s.id === description.show_id);
    if (show && (show.status === "completed" || show.status === "cancelled")) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot finalize descriptions for completed or cancelled shows",
      );
    }

    // Check if description is complete (at least one content field)
    if (!description.content_pl && !description.content_en) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot finalize incomplete description - at least one content field is required",
      );
    }
  }

  private async validateDeleteBusinessRules(
    description: any,
    secretaryId: string,
  ): Promise<void> {
    // Check if description is finalized
    if (description.is_final) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot delete finalized descriptions",
      );
    }

    // Check if secretary has permission (mock validation)
    if (description.secretary_id !== secretaryId) {
      throw new Error(
        "AUTHORIZATION_ERROR: Secretary not authorized to delete this description",
      );
    }

    // Check if show is still in progress
    const show = MOCK_DATA.shows.find((s) => s.id === description.show_id);
    if (show && (show.status === "completed" || show.status === "cancelled")) {
      throw new Error(
        "BUSINESS_RULE_ERROR: Cannot delete descriptions for completed or cancelled shows",
      );
    }
  }

  private async deleteDescriptionTransaction(id: string): Promise<void> {
    // Mock: Find and remove description
    const existingIndex = MOCK_DATA.descriptions.findIndex((d) => d.id === id);
    if (existingIndex === -1) {
      throw new Error("NOT_FOUND: Description not found");
    }

    // Remove from mock data
    MOCK_DATA.descriptions.splice(existingIndex, 1);

    // Also remove related versions
    const versionIndices = MOCK_DATA.description_versions
      .map((v, index) => (v.description_id === id ? index : -1))
      .filter((index) => index !== -1)
      .reverse(); // Remove from end to avoid index shifting

    versionIndices.forEach((index) => {
      MOCK_DATA.description_versions.splice(index, 1);
    });
  }

  private async updateDescriptionTransaction(
    id: string,
    data: any,
  ): Promise<Record<string, any>> {
    // Mock: Find existing description
    const existingIndex = MOCK_DATA.descriptions.findIndex((d) => d.id === id);
    if (existingIndex === -1) {
      throw new Error("NOT_FOUND: Description not found");
    }

    const existingDescription = MOCK_DATA.descriptions[existingIndex];

    // Create new version
    const newVersion = {
      ...existingDescription,
      content_pl: data.content_pl ?? existingDescription.content_pl,
      content_en: data.content_en ?? existingDescription.content_en,
      version: existingDescription.version + 1,
      updated_at: new Date().toISOString(),
    };

    // Update in mock data
    MOCK_DATA.descriptions[existingIndex] = newVersion;

    // Create version record
    const versionRecord = {
      id: crypto.randomUUID(),
      description_id: id,
      version: newVersion.version,
      content_pl: newVersion.content_pl,
      content_en: newVersion.content_en,
      changed_by_id: "00000000-0000-0000-0000-000000000001", // Mock secretary ID
      change_reason: "Content update",
      created_at: new Date().toISOString(),
      changed_fields: this.getChangedFields(existingDescription, data),
    };

    // Add version to mock data
    MOCK_DATA.description_versions.push(versionRecord);

    return newVersion;
  }

  private async finalizeDescriptionTransaction(
    id: string,
  ): Promise<Record<string, any>> {
    // Mock: Find existing description
    const existingIndex = MOCK_DATA.descriptions.findIndex((d) => d.id === id);
    if (existingIndex === -1) {
      throw new Error("NOT_FOUND: Description not found");
    }

    const existingDescription = MOCK_DATA.descriptions[existingIndex];

    // Finalize description
    const finalizedDescription = {
      ...existingDescription,
      is_final: true,
      finalized_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update in mock data
    MOCK_DATA.descriptions[existingIndex] = finalizedDescription;

    return finalizedDescription;
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
