import type { APIRoute } from "astro";
import { z } from "zod";
import type { ErrorResponseDto, DescriptionResponseDto } from "../../../types";

// Mock DEFAULT_USER dla testów
const DEFAULT_USER = {
  id: "00000000-0000-0000-0000-000000000003",
  role: "admin" as const,
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const showId = url.searchParams.get("show_id");
    const dogId = url.searchParams.get("dog_id");

    // Mock descriptions data - dodajemy opisy dla wszystkich psów z mock danych
    const mockDescriptions: DescriptionResponseDto[] = [
      {
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
      {
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
    ];

    // Filter descriptions based on parameters
    let filteredDescriptions = mockDescriptions;

    if (showId) {
      filteredDescriptions = filteredDescriptions.filter(
        (desc) => desc.show.id === showId,
      );
    }

    if (dogId) {
      filteredDescriptions = filteredDescriptions.filter(
        (desc) => desc.dog.id === dogId,
      );
    }

    return new Response(JSON.stringify(filteredDescriptions), {
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
      } as ErrorResponseDto),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Mock response for POST - zwracamy pełny obiekt DescriptionResponseDto
    const mockDescription: DescriptionResponseDto = {
      id: "desc-new-" + Date.now(), // Generujemy unikalne ID
      show: {
        id: body.show_id || "show-1",
        name: "Wystawa Psów Rasowych 2024",
        show_date: "2024-06-15",
        show_type: "national",
        status: "in_progress",
      },
      dog: {
        id: body.dog_id || "dog-1",
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
        id: body.judge_id || "judge-1",
        first_name: "Jan",
        last_name: "Kowalski",
        license_number: "JUDGE-001",
      },
      secretary: {
        id: DEFAULT_USER.id,
        first_name: "Admin",
        last_name: "User",
      },
      content_pl: body.content_pl || null,
      content_en: body.content_en || null,
      version: 1,
      is_final: false,
      finalized_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(mockDescription), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating description:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Sprawdź poprawność wprowadzonych danych",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Handle business logic errors
    if (error instanceof Error) {
      const statusCode = error.message.includes("AUTHORIZATION_ERROR")
        ? 403
        : error.message.includes("NOT_FOUND")
          ? 404
          : error.message.includes("CONFLICT")
            ? 409
            : error.message.includes("BUSINESS_RULE_ERROR")
              ? 422
              : 500;

      return new Response(
        JSON.stringify({
          error: {
            code: error.message.split(":")[0] || "INTERNAL_ERROR",
            message:
              error.message.split(":")[1]?.trim() || "Internal server error",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Generic error handler
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
