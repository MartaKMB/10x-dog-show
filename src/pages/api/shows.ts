import type { APIRoute } from "astro";
import { z } from "zod";
import { ShowService } from "../../lib/services/showService";
import {
  createShowSchema,
  showQuerySchema,
} from "../../lib/validation/showSchemas";
import { supabaseClient } from "../../db/supabase.client";
import type { ErrorResponseDto } from "../../types";

// Mock DEFAULT_USER dla testów (department_representative)
const DEFAULT_USER = {
  id: "00000000-0000-0000-0000-000000000002",
  role: "department_representative" as const,
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const validatedData = createShowSchema.parse(body);

    // Use DEFAULT_USER instead of real auth for now
    const currentUserId = DEFAULT_USER.id;

    // Create show using service with existing supabase client
    const showService = new ShowService(supabaseClient);
    const show = await showService.create(validatedData, currentUserId);

    return new Response(JSON.stringify(show), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating show:", error);

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

export const GET: APIRoute = async ({ request }) => {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const queryParams: Record<string, unknown> = {};

    // Convert query parameters
    for (const [key, value] of url.searchParams.entries()) {
      if (key === "page" || key === "limit") {
        queryParams[key] = parseInt(value, 10);
      } else {
        queryParams[key] = value;
      }
    }

    // Validate query parameters
    const validatedParams = showQuerySchema.parse(queryParams);

    // Get shows using service
    const showService = new ShowService(supabaseClient);
    const shows = await showService.getShows(validatedParams);

    return new Response(JSON.stringify(shows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching shows:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
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
