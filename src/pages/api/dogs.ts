import type { APIRoute } from "astro";
import type { DogResponseDto, PaginatedResponseDto } from "../../types";

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const breedId = url.searchParams.get("breed_id");
    const gender = url.searchParams.get("gender");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);

    // Przykładowe psy
    const mockDogs: DogResponseDto[] = [
      {
        id: "dog-1",
        name: "Azor",
        breed: {
          id: "breed-1",
          name_pl: "Owczarek Niemiecki",
          name_en: "German Shepherd",
          fci_group: "G1",
        },
        gender: "male",
        birth_date: "2020-01-15",
        microchip_number: "123456789012345",
        kennel_club_number: "PL-001",
        kennel_name: "Z Kwiatowej",
        father_name: "Max von Haus",
        mother_name: "Luna von Berg",
        owners: [
          {
            id: "owner-1",
            first_name: "Jan",
            last_name: "Kowalski",
            email: "jan.kowalski@example.com",
            is_primary: true,
          },
        ],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        deleted_at: null,
        scheduled_for_deletion: false,
      },
      {
        id: "dog-2",
        name: "Luna",
        breed: {
          id: "breed-2",
          name_pl: "Labrador Retriever",
          name_en: "Labrador Retriever",
          fci_group: "G8",
        },
        gender: "female",
        birth_date: "2019-03-20",
        microchip_number: "987654321098765",
        kennel_club_number: "PL-002",
        kennel_name: "Ze Słonecznej",
        father_name: "Rex Golden",
        mother_name: "Bella Sunshine",
        owners: [
          {
            id: "owner-2",
            first_name: "Anna",
            last_name: "Nowak",
            email: "anna.nowak@example.com",
            is_primary: true,
          },
        ],
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        deleted_at: null,
        scheduled_for_deletion: false,
      },
      {
        id: "dog-3",
        name: "Rex",
        breed: {
          id: "breed-4",
          name_pl: "Border Collie",
          name_en: "Border Collie",
          fci_group: "G1",
        },
        gender: "male",
        birth_date: "2021-07-10",
        microchip_number: "555666777888999",
        kennel_club_number: "PL-003",
        kennel_name: "Z Leśnej",
        father_name: "Shadow Border",
        mother_name: "Sky Highland",
        owners: [
          {
            id: "owner-3",
            first_name: "Piotr",
            last_name: "Wiśniewski",
            email: "piotr.wisniewski@example.com",
            is_primary: true,
          },
        ],
        created_at: "2024-01-03T00:00:00Z",
        updated_at: "2024-01-03T00:00:00Z",
        deleted_at: null,
        scheduled_for_deletion: false,
      },
      {
        id: "dog-4",
        name: "Bella",
        breed: {
          id: "breed-3",
          name_pl: "Golden Retriever",
          name_en: "Golden Retriever",
          fci_group: "G8",
        },
        gender: "female",
        birth_date: "2020-05-12",
        microchip_number: "111222333444555",
        kennel_club_number: "PL-004",
        kennel_name: "Z Parkowej",
        father_name: "Golden Boy",
        mother_name: "Sunny Girl",
        owners: [
          {
            id: "owner-4",
            first_name: "Maria",
            last_name: "Dąbrowska",
            email: "maria.dabrowska@example.com",
            is_primary: true,
          },
        ],
        created_at: "2024-01-04T00:00:00Z",
        updated_at: "2024-01-04T00:00:00Z",
        deleted_at: null,
        scheduled_for_deletion: false,
      },
      {
        id: "dog-5",
        name: "Max",
        breed: {
          id: "breed-5",
          name_pl: "Husky Syberyjski",
          name_en: "Siberian Husky",
          fci_group: "G5",
        },
        gender: "male",
        birth_date: "2018-11-08",
        microchip_number: "666777888999000",
        kennel_club_number: "PL-005",
        kennel_name: "Z Ogrodowej",
        father_name: "Storm Husky",
        mother_name: "Ice Princess",
        owners: [
          {
            id: "owner-5",
            first_name: "Tomasz",
            last_name: "Lewandowski",
            email: "tomasz.lewandowski@example.com",
            is_primary: true,
          },
        ],
        created_at: "2024-01-05T00:00:00Z",
        updated_at: "2024-01-05T00:00:00Z",
        deleted_at: null,
        scheduled_for_deletion: false,
      },
    ];

    // Apply filters
    let filteredDogs = mockDogs;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredDogs = mockDogs.filter(
        (dog) =>
          dog.name.toLowerCase().includes(searchLower) ||
          dog.breed.name_pl.toLowerCase().includes(searchLower) ||
          dog.breed.name_en.toLowerCase().includes(searchLower) ||
          dog.microchip_number.toLowerCase().includes(searchLower),
      );
    }

    if (breedId) {
      filteredDogs = filteredDogs.filter(
        (dog) => dog.breed.name_pl === breedId,
      );
    }

    if (gender) {
      filteredDogs = filteredDogs.filter((dog) => dog.gender === gender);
    }

    // Apply pagination
    const total = filteredDogs.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDogs = filteredDogs.slice(startIndex, endIndex);

    const response: PaginatedResponseDto<DogResponseDto> = {
      data: paginatedDogs,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching dogs:", error);

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

export const POST: APIRoute = async () => {
  try {
    // Mock response for POST
    return new Response(JSON.stringify({ message: "Dog created (mock)" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating dog:", error);

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
