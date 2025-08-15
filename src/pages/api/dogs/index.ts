import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../db/supabase.server";
import { DogService } from "../../../lib/services/dogService";
import {
  createDogSchema,
  dogQuerySchema,
} from "../../../lib/validation/dogSchemas";
import type { ErrorResponseDto } from "../../../types";

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    // Parse and validate query parameters
    const validatedParams = dogQuerySchema.parse({
      ...params,
      page: params.page ? parseInt(params.page) : undefined,
      limit: params.limit ? parseInt(params.limit) : undefined,
    });

    // Get dogs using service
    const supabase = createSupabaseServerClient();
    const dogService = new DogService(supabase);
    const dogs = await dogService.getDogs(validatedParams);

    return new Response(JSON.stringify(dogs), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching dogs:", error);

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

    // Handle business logic errors
    if (error instanceof Error) {
      const statusCode = error.message.includes("AUTHORIZATION_ERROR")
        ? 403
        : error.message.includes("NOT_FOUND")
          ? 404
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

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const validatedData = createDogSchema.parse(body);

    // Create dog using service
    const supabase = createSupabaseServerClient();
    const dogService = new DogService(supabase);
    const dog = await dogService.create(validatedData);

    return new Response(JSON.stringify(dog), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating dog:", error);

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
          : error.message.includes("BUSINESS_RULE_ERROR")
            ? 422
            : error.message.includes("CONFLICT")
              ? 409
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
