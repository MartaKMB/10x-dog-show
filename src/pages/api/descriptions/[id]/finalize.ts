import type { APIRoute } from "astro";
import { z } from "zod";
import { DescriptionService } from "../../../../lib/services/descriptionService";
import { supabaseClient } from "../../../../db/supabase.client";
import type { ErrorResponseDto } from "../../../../types";

// Mock DEFAULT_USER dla testów
const DEFAULT_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  role: "secretary" as const,
};

// Schema for description ID validation
const descriptionIdSchema = z.string().uuid("Invalid description ID format");

export const PATCH: APIRoute = async ({ params }) => {
  try {
    // Validate description ID
    const validatedId = descriptionIdSchema.parse(params.id);

    // Use DEFAULT_USER instead of real auth for now
    const currentUserId = DEFAULT_USER.id;

    // Finalize description using service
    const descriptionService = new DescriptionService(supabaseClient);
    const description = await descriptionService.finalize(
      validatedId,
      currentUserId,
    );

    return new Response(JSON.stringify(description), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
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
