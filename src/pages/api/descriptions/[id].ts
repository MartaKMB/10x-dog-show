import type { APIRoute } from "astro";
import { z } from "zod";
import { DescriptionService } from "../../../lib/services/descriptionService";
import { updateDescriptionSchema } from "../../../lib/validation/descriptionSchemas";
import { supabaseClient } from "../../../db/supabase.client";
import type { ErrorResponseDto } from "../../../types";

// Mock DEFAULT_USER dla testów
const DEFAULT_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  role: "secretary" as const,
};

// Schema for description ID validation
const descriptionIdSchema = z.string().uuid("Invalid description ID format");

export const GET: APIRoute = async ({ params }) => {
  try {
    // Validate description ID
    const validatedId = descriptionIdSchema.parse(params.id);

    // Get description using service
    const descriptionService = new DescriptionService(supabaseClient);
    const description = await descriptionService.getById(validatedId);

    return new Response(JSON.stringify(description), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching description:", error);

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

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    // Validate description ID
    const validatedId = descriptionIdSchema.parse(params.id);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateDescriptionSchema.parse(body);

    // Use DEFAULT_USER instead of real auth for now
    const currentUserId = DEFAULT_USER.id;

    // Update description using service
    const descriptionService = new DescriptionService(supabaseClient);
    const description = await descriptionService.update(
      validatedId,
      validatedData,
      currentUserId,
    );

    return new Response(JSON.stringify(description), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating description:", error);

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

export const DELETE: APIRoute = async ({ params }) => {
  try {
    // Validate description ID
    const validatedId = descriptionIdSchema.parse(params.id);

    // Use DEFAULT_USER instead of real auth for now
    const currentUserId = DEFAULT_USER.id;

    // Delete description using service
    const descriptionService = new DescriptionService(supabaseClient);
    await descriptionService.delete(validatedId, currentUserId);

    return new Response(
      JSON.stringify({
        message: "Description deleted successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error deleting description:", error);

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
