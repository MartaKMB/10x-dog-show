import type { APIRoute } from "astro";
import { z } from "zod";
import type { ErrorResponseDto } from "../../../types";

// Schema for dog ID validation
const dogIdSchema = z.string().uuid("Invalid dog ID format");

export const GET: APIRoute = async ({ params }) => {
  try {
    // Validate dog ID
    const validatedId = dogIdSchema.parse(params.id);

    // TODO: W rzeczywistej aplikacji pobierać z bazy danych
    // Na razie zwracamy mock data
    const mockDog = {
      id: validatedId,
      name: "Bella",
      breed: {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name_pl: "Labrador retriever",
        name_en: "Labrador Retriever",
        fci_group: "G8",
      },
      gender: "female" as const,
      birth_date: "2020-03-15",
      microchip_number: "123456789012345",
      kennel_club_number: "KC123456",
      kennel_name: "Happy Kennel",
      father_name: "Max",
      mother_name: "Luna",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    return new Response(JSON.stringify(mockDog), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching dog:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid dog ID format",
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
