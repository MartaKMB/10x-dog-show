import type { APIRoute } from "astro";
import { z } from "zod";
import type { ErrorResponseDto } from "../../../../types";

// Schema for show ID validation
const showIdSchema = z.string().uuid("Invalid show ID format");

// Mock DEFAULT_USER dla testów
const DEFAULT_USER = {
  id: "00000000-0000-0000-0000-000000000003",
  role: "admin" as const,
};

export const GET: APIRoute = async ({ params }) => {
  try {
    // Validate show ID
    const validatedId = showIdSchema.parse(params.id);

    // TODO: W rzeczywistej aplikacji pobierać user z kontekstu autentykacji
    const currentUser = DEFAULT_USER;

    // TODO: W rzeczywistej aplikacji pobierać uprawnienia z bazy danych
    // Na razie zwracamy mock data - wszystkie rasy są dozwolone
    const mockPermissions = {
      allowed_breeds: [
        "550e8400-e29b-41d4-a716-446655440001", // Labrador
        "550e8400-e29b-41d4-a716-446655440002", // German Shepherd
        "550e8400-e29b-41d4-a716-446655440003", // Golden Retriever
        "550e8400-e29b-41d4-a716-446655440004", // Border Collie
        "550e8400-e29b-41d4-a716-446655440005", // Beagle
      ],
      show_id: validatedId,
      secretary_id: currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(mockPermissions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid show ID format",
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
