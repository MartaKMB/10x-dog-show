import type { APIRoute } from "astro";
import { z } from "zod";
import { DescriptionService } from "../../lib/services/descriptionService";
import { createDescriptionSchema } from "../../lib/validation/descriptionSchemas";
import { supabaseClient } from "../../db/supabase.client";
import type { ErrorResponseDto } from "../../types";

// Mock DEFAULT_USER dla testów
const DEFAULT_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  role: "secretary" as const,
};

// Schema for query parameters
const descriptionQuerySchema = z.object({
  show_id: z.string().uuid().optional(),
  judge_id: z.string().uuid().optional(),
  secretary_id: z.string().uuid().optional(),
  is_final: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  language: z.enum(["pl", "en"]).optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("20"),
});

export const GET: APIRoute = async ({ url }) => {
  try {
    // Parse and validate query parameters
    const urlParams = new URL(url).searchParams;
    const queryParams: Record<string, string> = {};

    for (const [key, value] of urlParams.entries()) {
      queryParams[key] = value;
    }

    const validatedParams = descriptionQuerySchema.parse(queryParams);

    // Validate pagination limits
    if (validatedParams.limit > 100) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Limit cannot exceed 100 items per page",
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

    // Get descriptions using service
    const descriptionService = new DescriptionService(supabaseClient);
    const result = await descriptionService.list(validatedParams);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching descriptions:", error);

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

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const validatedData = createDescriptionSchema.parse(body);

    // Use DEFAULT_USER instead of real auth for now
    const currentUserId = DEFAULT_USER.id;

    // Create description using service with existing supabase client
    const descriptionService = new DescriptionService(supabaseClient);
    const description = await descriptionService.create(
      validatedData,
      currentUserId,
    );

    return new Response(JSON.stringify(description), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating description:", error);

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
