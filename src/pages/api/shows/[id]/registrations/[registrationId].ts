import type { APIRoute } from "astro";
import { z } from "zod";
import { supabaseServerClient } from "../../../../../db/supabase.server";
import { ShowService } from "../../../../../lib/services/showService";
import { updateRegistrationSchema } from "../../../../../lib/validation/showSchemas";
import type { ErrorResponseDto } from "../../../../../types";

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { showId, registrationId } = params;
    if (!showId || !registrationId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "400",
            message: "Show ID and Registration ID are required",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 400 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input data
    const validatedData = updateRegistrationSchema.parse(body);

    // Update registration using service
    const supabase = supabaseServerClient;
    const showService = new ShowService(supabase);

    const registration = await showService.updateRegistration(
      showId,
      registrationId,
      validatedData,
    );

    return new Response(JSON.stringify(registration), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating registration:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "The provided data is invalid",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 400 },
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
        { status: statusCode },
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
      { status: 500 },
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { showId, registrationId } = params;
    if (!showId || !registrationId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "400",
            message: "Show ID and Registration ID are required",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 400 },
      );
    }

    // Delete registration using service
    const supabase = supabaseServerClient;
    const showService = new ShowService(supabase);

    await showService.deleteRegistration(showId, registrationId);

    return new Response(
      JSON.stringify({
        message: "Registration deleted successfully",
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting registration:", error);

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
        { status: statusCode },
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
      { status: 500 },
    );
  }
};
