import type { APIRoute } from "astro";
import { z } from "zod";
import { DescriptionService } from "../../../../lib/services/descriptionService";
import { supabaseClient } from "../../../../db/supabase.client";
import type { ErrorResponseDto } from "../../../../types";

// Schema for description ID validation
const descriptionIdSchema = z.string().uuid("Invalid description ID format");

export const GET: APIRoute = async ({ params }) => {
  try {
    // Validate description ID
    const validatedId = descriptionIdSchema.parse(params.id);

    // Get description versions using service
    const descriptionService = new DescriptionService(supabaseClient);
    const versions = await descriptionService.getVersions(validatedId);

    return new Response(JSON.stringify(versions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching description versions:", error);

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

    // Handle not found errors
    if (error instanceof Error && error.message.includes("NOT_FOUND")) {
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

    // Handle other errors
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
