import type { APIRoute } from "astro";
import { z } from "zod";
import { RegistrationService } from "../../../../lib/services/registrationService";
import {
  createRegistrationSchema,
  registrationQuerySchema,
} from "../../../../lib/validation/registrationSchemas";
import { supabaseClient } from "../../../../db/supabase.client";
import type { ErrorResponseDto } from "../../../../types";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { id: showId } = params;

    if (!showId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Show ID is required",
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

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams: Record<string, unknown> = {};

    // Convert query parameters
    for (const [key, value] of url.searchParams.entries()) {
      if (key === "page" || key === "limit") {
        queryParams[key] = parseInt(value, 10);
      } else if (key === "is_paid") {
        queryParams[key] = value === "true";
      } else {
        queryParams[key] = value;
      }
    }

    // Validate query parameters
    const validatedParams = registrationQuerySchema.parse(queryParams);

    // Get registrations using service
    const registrationService = new RegistrationService(supabaseClient);
    const registrations = await registrationService.getRegistrations(
      showId,
      validatedParams,
    );

    return new Response(JSON.stringify(registrations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching registrations:", error);

    // Handle business logic errors
    if (error instanceof Error) {
      const statusCode = error.message.includes("NOT_FOUND")
        ? 404
        : error.message.includes("AUTHORIZATION_ERROR")
          ? 403
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

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { id: showId } = params;

    if (!showId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Show ID is required",
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

    // Parse request body
    const body = await request.json();

    // Validate input data
    const validatedData = createRegistrationSchema.parse(body);

    // Create registration using service
    const registrationService = new RegistrationService(supabaseClient);
    const registration = await registrationService.createRegistration(
      showId,
      validatedData,
    );

    return new Response(JSON.stringify(registration), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
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
