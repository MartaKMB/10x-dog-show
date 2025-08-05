import type { APIRoute } from "astro";
import type { DescriptionResponseDto, PaginatedResponseDto } from "../../types";

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const dogId = url.searchParams.get("dog_id");
    const showId = url.searchParams.get("show_id");

    // Przykładowe opisy psów
    const mockDescriptions: DescriptionResponseDto[] = [
      {
        id: "desc-1",
        show: {
          id: "show-1",
          name: "Wystawa Psów Rasowych 2024",
          show_date: "2024-06-15",
          show_type: "national",
          status: "in_progress",
        },
        dog: {
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
        },
        judge: {
          id: "judge-1",
          first_name: "Jan",
          last_name: "Kowalski",
          license_number: "JUDGE-001",
        },
        secretary: {
          id: "user-1",
          first_name: "Anna",
          last_name: "Nowak",
        },
        content_pl: "Pies o bardzo dobrym typie, zrównoważony temperament...",
        content_en: "Dog of very good type, balanced temperament...",
        version: 1,
        is_final: false,
        finalized_at: null,
        created_at: "2024-06-10T10:00:00Z",
        updated_at: "2024-06-10T10:00:00Z",
      },
      {
        id: "desc-2",
        show: {
          id: "show-1",
          name: "Wystawa Psów Rasowych 2024",
          show_date: "2024-06-15",
          show_type: "national",
          status: "in_progress",
        },
        dog: {
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
        },
        judge: {
          id: "judge-1",
          first_name: "Jan",
          last_name: "Kowalski",
          license_number: "JUDGE-001",
        },
        secretary: {
          id: "user-1",
          first_name: "Anna",
          last_name: "Nowak",
        },
        content_pl: "Suka o doskonałym typie, bardzo dobra głowa...",
        content_en: "Bitch of excellent type, very good head...",
        version: 2,
        is_final: true,
        finalized_at: "2024-06-12T14:30:00Z",
        created_at: "2024-06-10T11:00:00Z",
        updated_at: "2024-06-12T14:30:00Z",
      },
      {
        id: "desc-3",
        show: {
          id: "show-1",
          name: "Wystawa Psów Rasowych 2024",
          show_date: "2024-06-15",
          show_type: "national",
          status: "in_progress",
        },
        dog: {
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
        },
        judge: {
          id: "judge-2",
          first_name: "Maria",
          last_name: "Wiśniewska",
          license_number: "JUDGE-002",
        },
        secretary: {
          id: "user-1",
          first_name: "Anna",
          last_name: "Nowak",
        },
        content_pl: null,
        content_en: null,
        version: 1,
        is_final: false,
        finalized_at: null,
        created_at: "2024-06-10T12:00:00Z",
        updated_at: "2024-06-10T12:00:00Z",
      },
    ];

    // Filtruj opisy według parametrów
    let filteredDescriptions = mockDescriptions;

    if (dogId) {
      filteredDescriptions = filteredDescriptions.filter(
        (desc) => desc.dog.id === dogId,
      );
    }

    if (showId) {
      filteredDescriptions = filteredDescriptions.filter(
        (desc) => desc.show.id === showId,
      );
    }

    const response: PaginatedResponseDto<DescriptionResponseDto> = {
      data: filteredDescriptions,
      pagination: {
        page: 1,
        limit: 50,
        total: filteredDescriptions.length,
        pages: 1,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching descriptions:", error);

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
    return new Response(
      JSON.stringify({ message: "Description created (mock)" }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error creating description:", error);

    // Handle validation errors
    // if (error instanceof z.ZodError) { // This line was removed as per the new_code
    //   return new Response( // This line was removed as per the new_code
    //     JSON.stringify({ // This line was removed as per the new_code
    //       error: { // This line was removed as per the new_code
    //         code: "VALIDATION_ERROR", // This line was removed as per the new_code
    //         message: "The provided data is invalid", // This line was removed as per the new_code
    //         details: error.errors.map((err) => ({ // This line was removed as per the new_code
    //           field: err.path.join("."), // This line was removed as per the new_code
    //           message: err.message, // This line was removed as per the new_code
    //         })), // This line was removed as per the new_code
    //       }, // This line was removed as per the new_code
    //       timestamp: new Date().toISOString(), // This line was removed as per the new_code
    //       request_id: crypto.randomUUID(), // This line was removed as per the new_code
    //     } as ErrorResponseDto), // This line was removed as per the new_code
    //     { // This line was removed as per the new_code
    //       status: 400, // This line was removed as per the new_code
    //       headers: { "Content-Type": "application/json" }, // This line was removed as per the new_code
    //     }, // This line was removed as per the new_code
    //   ); // This line was removed as per the new_code
    // } // This line was removed as per the new_code

    // Handle business logic errors
    // if (error instanceof Error) { // This line was removed as per the new_code
    //   const statusCode = error.message.includes("AUTHORIZATION_ERROR") // This line was removed as per the new_code
    //     ? 403 // This line was removed as per the new_code
    //     : error.message.includes("NOT_FOUND") // This line was removed as per the new_code
    //       ? 404 // This line was removed as per the new_code
    //       : error.message.includes("CONFLICT") // This line was removed as per the new_code
    //         ? 409 // This line was removed as per the new_code
    //         : error.message.includes("BUSINESS_RULE_ERROR") // This line was removed as per the new_code
    //           ? 422 // This line was removed as per the new_code
    //           : 500; // This line was removed as per the new_code

    //   return new Response( // This line was removed as per the new_code
    //     JSON.stringify({ // This line was removed as per the new_code
    //       error: { // This line was removed as per the new_code
    //         code: error.message.split(":")[0] || "INTERNAL_ERROR", // This line was removed as per the new_code
    //         message: // This line was removed as per the new_code
    //           error.message.split(":")[1]?.trim() || "Internal server error", // This line was removed as per the new_code
    //       }, // This line was removed as per the new_code
    //       timestamp: new Date().toISOString(), // This line was removed as per the new_code
    //       request_id: crypto.randomUUID(), // This line was removed as per the new_code
    //     } as ErrorResponseDto), // This line was removed as per the new_code
    //     { // This line was removed as per the new_code
    //       status: statusCode, // This line was removed as per the new_code
    //       headers: { "Content-Type": "application/json" }, // This line was removed as per the new_code
    //     }, // This line was removed as per the new_code
    //   ); // This line was removed as per the new_code
    // } // This line was removed as per the new_code

    // Generic error handler
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
