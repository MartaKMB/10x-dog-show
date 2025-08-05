import type { APIRoute } from "astro";
import { z } from "zod";
import type {
  ErrorResponseDto,
  DescriptionResponseDto,
} from "../../../../types";

// Mock DEFAULT_USER dla testów
const DEFAULT_USER = {
  id: "00000000-0000-0000-0000-000000000003",
  role: "admin" as const,
};

// Schema for description ID validation - akceptuje zarówno UUID jak i mock ID
const descriptionIdSchema = z.string().min(1, "Description ID is required");

export const PATCH: APIRoute = async ({ params }) => {
  try {
    // Validate description ID
    const validatedId = descriptionIdSchema.parse(params.id);

    // Mock response for finalize
    const mockFinalizedDescription: DescriptionResponseDto = {
      id: validatedId,
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
        id: DEFAULT_USER.id,
        first_name: "Admin",
        last_name: "User",
      },
      content_pl: "Pies o bardzo dobrym typie, zrównoważony temperament...",
      content_en: "Dog of very good type, balanced temperament...",
      version: 1,
      is_final: true,
      finalized_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(mockFinalizedDescription), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error finalizing description:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid description ID format",
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
      const statusCode = error.message.includes("NOT_FOUND")
        ? 404
        : error.message.includes("AUTHORIZATION_ERROR")
          ? 403
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
