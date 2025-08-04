import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BreedResponseDto,
  PaginatedResponseDto,
  FCIGroup,
} from "../../types";
import type { BreedQueryInput } from "../validation/breedSchemas";

// Mock data for testing purposes
const MOCK_BREEDS: BreedResponseDto[] = [
  {
    id: "breed-1",
    name_pl: "Owczarek Niemiecki",
    name_en: "German Shepherd",
    fci_group: "G1",
    fci_number: 166,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "breed-2",
    name_pl: "Labrador Retriever",
    name_en: "Labrador Retriever",
    fci_group: "G8",
    fci_number: 122,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "breed-3",
    name_pl: "Golden Retriever",
    name_en: "Golden Retriever",
    fci_group: "G8",
    fci_number: 111,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "breed-4",
    name_pl: "Border Collie",
    name_en: "Border Collie",
    fci_group: "G1",
    fci_number: 297,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "breed-5",
    name_pl: "Husky Syberyjski",
    name_en: "Siberian Husky",
    fci_group: "G5",
    fci_number: 270,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "breed-6",
    name_pl: "Buldog Francuski",
    name_en: "French Bulldog",
    fci_group: "G9",
    fci_number: 101,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "breed-7",
    name_pl: "Chihuahua",
    name_en: "Chihuahua",
    fci_group: "G9",
    fci_number: 218,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "breed-8",
    name_pl: "Rottweiler",
    name_en: "Rottweiler",
    fci_group: "G2",
    fci_number: 147,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "breed-9",
    name_pl: "Bernardyn",
    name_en: "Saint Bernard",
    fci_group: "G2",
    fci_number: 61,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "breed-10",
    name_pl: "Doberman",
    name_en: "Doberman",
    fci_group: "G2",
    fci_number: 143,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export class BreedService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get paginated list of breeds with filtering and search capabilities
   */
  async getMany(
    query: BreedQueryInput,
  ): Promise<PaginatedResponseDto<BreedResponseDto>> {
    const { fci_group, is_active, search, page, limit } = query;

    // Use mock data for testing purposes
    let filteredBreeds = [...MOCK_BREEDS];

    // Apply filters
    if (fci_group) {
      filteredBreeds = filteredBreeds.filter(
        (breed) => breed.fci_group === fci_group,
      );
    }

    if (is_active !== undefined) {
      filteredBreeds = filteredBreeds.filter(
        (breed) => breed.is_active === is_active,
      );
    } else {
      // Default to active breeds only
      filteredBreeds = filteredBreeds.filter((breed) => breed.is_active);
    }

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      filteredBreeds = filteredBreeds.filter(
        (breed) =>
          breed.name_pl.toLowerCase().includes(searchTerm) ||
          breed.name_en.toLowerCase().includes(searchTerm),
      );
    }

    // Calculate pagination
    const total = filteredBreeds.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedBreeds = filteredBreeds.slice(offset, offset + limit);

    return {
      data: paginatedBreeds,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * Get a single breed by ID
   */
  async getById(id: string): Promise<BreedResponseDto> {
    const breed = MOCK_BREEDS.find((b) => b.id === id);
    if (!breed) {
      throw new Error("NOT_FOUND: Breed not found");
    }
    return breed;
  }

  /**
   * Get breeds by FCI group
   */
  async getByFciGroup(fciGroup: FCIGroup): Promise<BreedResponseDto[]> {
    return MOCK_BREEDS.filter(
      (breed) => breed.fci_group === fciGroup && breed.is_active,
    );
  }

  /**
   * Search breeds by name (case-insensitive)
   */
  async searchByName(searchTerm: string): Promise<BreedResponseDto[]> {
    const term = searchTerm.toLowerCase();
    return MOCK_BREEDS.filter(
      (breed) =>
        breed.is_active &&
        (breed.name_pl.toLowerCase().includes(term) ||
          breed.name_en.toLowerCase().includes(term)),
    );
  }
}
