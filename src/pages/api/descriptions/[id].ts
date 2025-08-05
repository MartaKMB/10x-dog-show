import type { APIRoute } from "astro";
import type { DescriptionResponseDto, ErrorResponseDto } from "../../../types";

const DEFAULT_USER = {
  id: "admin-user-id",
  first_name: "Admin",
  last_name: "User",
};

export const GET: APIRoute = async ({ params }) => {
  try {
    // Validate description ID - akceptuje zarówno UUID jak i mock ID
    const descriptionId = params.id;
    if (!descriptionId) {
      throw new Error("Description ID is required");
    }

    // Mock response for description data
    const mockDescriptions: Record<string, DescriptionResponseDto> = {
      "desc-1": {
        id: "desc-1",
        show: {
          id: "550e8400-e29b-41d4-a716-446655440002",
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
          id: "550e8400-e29b-41d4-a716-446655440001",
          first_name: "Jan",
          last_name: "Kowalski",
          license_number: "JUDGE-001",
        },
        secretary: {
          id: DEFAULT_USER.id,
          first_name: "Admin",
          last_name: "User",
        },
        content_pl: "Pies o bardzo dobrym typie, zrównoważony temperament...",
        content_en: "Dog of very good type, balanced temperament...",
        version: 1,
        is_final: false,
        finalized_at: null,
        created_at: "2024-06-10T10:00:00Z",
        updated_at: "2024-06-12T14:30:00Z",
      },
      "desc-2": {
        id: "desc-2",
        show: {
          id: "550e8400-e29b-41d4-a716-446655440002",
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
          id: "550e8400-e29b-41d4-a716-446655440001",
          first_name: "Jan",
          last_name: "Kowalski",
          license_number: "JUDGE-001",
        },
        secretary: {
          id: DEFAULT_USER.id,
          first_name: "Admin",
          last_name: "User",
        },
        content_pl: "Suka o doskonałym typie, bardzo dobra głowa...",
        content_en: "Bitch of excellent type, very good head...",
        version: 1,
        is_final: false,
        finalized_at: null,
        created_at: "2024-06-10T11:00:00Z",
        updated_at: "2024-06-12T14:30:00Z",
      },
    };

    const description = mockDescriptions[descriptionId];
    if (!description) {
      return new Response(
        JSON.stringify({
          error: {
            code: "NOT_FOUND",
            message: "Description not found",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify(description), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching description:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      } as ErrorResponseDto),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    // Validate description ID
    const descriptionId = params.id;
    if (!descriptionId) {
      throw new Error("Description ID is required");
    }

    // Parse request body
    const body = await request.json();
    const { content_pl, content_en } = body;

    // Mock response for updated description
    const mockDescriptions: Record<string, DescriptionResponseDto> = {
      "desc-1": {
        id: "desc-1",
        show: {
          id: "550e8400-e29b-41d4-a716-446655440002",
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
          id: "550e8400-e29b-41d4-a716-446655440001",
          first_name: "Jan",
          last_name: "Kowalski",
          license_number: "JUDGE-001",
        },
        secretary: {
          id: DEFAULT_USER.id,
          first_name: "Admin",
          last_name: "User",
        },
        content_pl:
          content_pl ||
          "Pies o bardzo dobrym typie, zrównoważony temperament...",
        content_en:
          content_en || "Dog of very good type, balanced temperament...",
        version: 2,
        is_final: false,
        finalized_at: null,
        created_at: "2024-06-10T10:00:00Z",
        updated_at: new Date().toISOString(),
      },
      "desc-2": {
        id: "desc-2",
        show: {
          id: "550e8400-e29b-41d4-a716-446655440002",
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
          id: "550e8400-e29b-41d4-a716-446655440001",
          first_name: "Jan",
          last_name: "Kowalski",
          license_number: "JUDGE-001",
        },
        secretary: {
          id: DEFAULT_USER.id,
          first_name: "Admin",
          last_name: "User",
        },
        content_pl:
          content_pl || "Suka o doskonałym typie, bardzo dobra głowa...",
        content_en: content_en || "Bitch of excellent type, very good head...",
        version: 2,
        is_final: false,
        finalized_at: null,
        created_at: "2024-06-10T11:00:00Z",
        updated_at: new Date().toISOString(),
      },
    };

    const description = mockDescriptions[descriptionId];
    if (!description) {
      return new Response(
        JSON.stringify({
          error: {
            code: "NOT_FOUND",
            message: "Description not found",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify(description), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating description:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      } as ErrorResponseDto),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const descriptionId = params.id;
    if (!descriptionId) {
      throw new Error("Description ID is required");
    }

    // Mock delete - just return success
    return new Response(
      JSON.stringify({
        message: "Description deleted successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error deleting description:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      } as ErrorResponseDto),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
