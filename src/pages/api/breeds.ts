import type { APIRoute } from "astro";
import type { BreedResponseDto, PaginatedResponseDto } from "../../types";

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const isActive = url.searchParams.get("is_active");

    // Przykładowe rasy psów
    const mockBreeds: BreedResponseDto[] = [
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
    ];

    // Filtruj aktywne rasy jeśli parametr is_active jest ustawiony
    let filteredBreeds = mockBreeds;
    if (isActive === "true") {
      filteredBreeds = mockBreeds.filter((breed) => breed.is_active);
    }

    const response: PaginatedResponseDto<BreedResponseDto> = {
      data: filteredBreeds,
      pagination: {
        page: 1,
        limit: 50,
        total: filteredBreeds.length,
        pages: 1,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching breeds:", error);

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
