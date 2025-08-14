import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../../../db/supabase.server";
import { ShowService } from "../../../../../lib/services/showService";
import {
  createRegistrationSchema,
  registrationQuerySchema,
} from "../../../../../lib/validation/showSchemas";
import type { ErrorResponseDto } from "../../../../../types";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { id: showId } = params;
    if (!showId) {
      return new Response(
        JSON.stringify({
          error: { code: "BAD_REQUEST", message: "Show ID is required" },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = registrationQuerySchema.parse(
      Object.fromEntries(url.searchParams),
    );

    // Get registrations using service
    const supabase = createSupabaseServerClient();
    const showService = new ShowService(supabase);

    const registrations = await showService.getRegistrations(
      showId,
      queryParams,
    );

    return new Response(JSON.stringify(registrations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "The provided query parameters are invalid",
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

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { id: showId } = params;
    if (!showId) {
      return new Response(
        JSON.stringify({
          error: { code: "BAD_REQUEST", message: "Show ID is required" },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input data
    const validatedData = createRegistrationSchema.parse(body);

    // Create registration using service
    const supabase = createSupabaseServerClient();
    const showService = new ShowService(supabase);

    // Check if dog is already registered for this show
    const { data: existingRegistration } = await supabase
      .from("show_registrations")
      .select("id")
      .eq("show_id", showId)
      .eq("dog_id", validatedData.dog_id)
      .single();

    if (existingRegistration) {
      return new Response(
        JSON.stringify({
          error: {
            code: "BUSINESS_RULE_ERROR",
            message: "Dog is already registered for this show",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 409 },
      );
    }

    const registration = await showService.createRegistration(
      showId,
      validatedData,
    );

    return new Response(JSON.stringify(registration), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating registration:", error);

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
