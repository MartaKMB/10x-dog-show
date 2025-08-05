import type { APIRoute } from "astro";
import type {
  RegistrationResponseDto,
  PaginatedResponseDto,
} from "../../../../types";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { id: showId } = params;

    if (!showId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Show ID is required",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Przykładowe rejestracje psów
    const mockRegistrations: RegistrationResponseDto[] = [
      {
        id: "reg-1",
        show_id: showId,
        dog: {
          id: "dog-1",
          name: "Azor",
          breed: {
            name_pl: "Owczarek Niemiecki",
            name_en: "German Shepherd",
            fci_group: "G1",
          },
          gender: "male",
          birth_date: "2020-01-15",
        },
        dog_class: "open",
        catalog_number: 1,
        registration_fee: 150,
        is_paid: true,
        registered_at: "2024-01-15T10:00:00Z",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      },
      {
        id: "reg-2",
        show_id: showId,
        dog: {
          id: "dog-2",
          name: "Luna",
          breed: {
            name_pl: "Labrador Retriever",
            name_en: "Labrador Retriever",
            fci_group: "G8",
          },
          gender: "female",
          birth_date: "2019-03-20",
        },
        dog_class: "champion",
        catalog_number: 2,
        registration_fee: 200,
        is_paid: true,
        registered_at: "2024-01-16T11:30:00Z",
        created_at: "2024-01-16T11:30:00Z",
        updated_at: "2024-01-16T11:30:00Z",
      },
      {
        id: "reg-3",
        show_id: showId,
        dog: {
          id: "dog-3",
          name: "Rex",
          breed: {
            name_pl: "Border Collie",
            name_en: "Border Collie",
            fci_group: "G1",
          },
          gender: "male",
          birth_date: "2021-07-10",
        },
        dog_class: "junior",
        catalog_number: 3,
        registration_fee: 120,
        is_paid: false,
        registered_at: "2024-01-17T09:15:00Z",
        created_at: "2024-01-17T09:15:00Z",
        updated_at: "2024-01-17T09:15:00Z",
      },
      {
        id: "reg-4",
        show_id: showId,
        dog: {
          id: "dog-4",
          name: "Bella",
          breed: {
            name_pl: "Golden Retriever",
            name_en: "Golden Retriever",
            fci_group: "G8",
          },
          gender: "female",
          birth_date: "2020-05-12",
        },
        dog_class: "open",
        catalog_number: 4,
        registration_fee: 150,
        is_paid: true,
        registered_at: "2024-01-18T14:20:00Z",
        created_at: "2024-01-18T14:20:00Z",
        updated_at: "2024-01-18T14:20:00Z",
      },
      {
        id: "reg-5",
        show_id: showId,
        dog: {
          id: "dog-5",
          name: "Max",
          breed: {
            name_pl: "Husky Syberyjski",
            name_en: "Siberian Husky",
            fci_group: "G5",
          },
          gender: "male",
          birth_date: "2018-11-08",
        },
        dog_class: "veteran",
        catalog_number: 5,
        registration_fee: 100,
        is_paid: false,
        registered_at: "2024-01-19T16:45:00Z",
        created_at: "2024-01-19T16:45:00Z",
        updated_at: "2024-01-19T16:45:00Z",
      },
      {
        id: "reg-6",
        show_id: showId,
        dog: {
          id: "dog-6",
          name: "Milo",
          breed: {
            name_pl: "Buldog Francuski",
            name_en: "French Bulldog",
            fci_group: "G9",
          },
          gender: "male",
          birth_date: "2022-02-14",
        },
        dog_class: "puppy",
        catalog_number: 6,
        registration_fee: 80,
        is_paid: true,
        registered_at: "2024-01-20T12:10:00Z",
        created_at: "2024-01-20T12:10:00Z",
        updated_at: "2024-01-20T12:10:00Z",
      },
      {
        id: "reg-7",
        show_id: showId,
        dog: {
          id: "dog-7",
          name: "Daisy",
          breed: {
            name_pl: "Chihuahua",
            name_en: "Chihuahua",
            fci_group: "G9",
          },
          gender: "female",
          birth_date: "2021-09-03",
        },
        dog_class: "intermediate",
        catalog_number: 7,
        registration_fee: 130,
        is_paid: true,
        registered_at: "2024-01-21T13:25:00Z",
        created_at: "2024-01-21T13:25:00Z",
        updated_at: "2024-01-21T13:25:00Z",
      },
      {
        id: "reg-8",
        show_id: showId,
        dog: {
          id: "dog-8",
          name: "Rocky",
          breed: {
            name_pl: "Rottweiler",
            name_en: "Rottweiler",
            fci_group: "G2",
          },
          gender: "male",
          birth_date: "2019-12-25",
        },
        dog_class: "working",
        catalog_number: 8,
        registration_fee: 180,
        is_paid: false,
        registered_at: "2024-01-22T15:40:00Z",
        created_at: "2024-01-22T15:40:00Z",
        updated_at: "2024-01-22T15:40:00Z",
      },
    ];

    // Parse query parameters for filtering
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const breedId = url.searchParams.get("breed_id");
    const gender = url.searchParams.get("gender");
    const dogClass = url.searchParams.get("dog_class");
    const isPaid = url.searchParams.get("is_paid");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);

    // Apply filters
    let filteredRegistrations = mockRegistrations;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredRegistrations = filteredRegistrations.filter(
        (reg) =>
          reg.dog.name.toLowerCase().includes(searchLower) ||
          reg.dog.breed.name_pl.toLowerCase().includes(searchLower) ||
          reg.dog.breed.name_en.toLowerCase().includes(searchLower),
      );
    }

    if (breedId) {
      filteredRegistrations = filteredRegistrations.filter(
        (reg) => reg.dog.breed.name_pl === breedId,
      );
    }

    if (gender) {
      filteredRegistrations = filteredRegistrations.filter(
        (reg) => reg.dog.gender === gender,
      );
    }

    if (dogClass) {
      filteredRegistrations = filteredRegistrations.filter(
        (reg) => reg.dog_class === dogClass,
      );
    }

    if (isPaid !== null) {
      const paid = isPaid === "true";
      filteredRegistrations = filteredRegistrations.filter(
        (reg) => reg.is_paid === paid,
      );
    }

    // Apply pagination
    const total = filteredRegistrations.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRegistrations = filteredRegistrations.slice(
      startIndex,
      endIndex,
    );

    const response: PaginatedResponseDto<RegistrationResponseDto> = {
      data: paginatedRegistrations,
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
    console.error("Error fetching registrations:", error);

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
