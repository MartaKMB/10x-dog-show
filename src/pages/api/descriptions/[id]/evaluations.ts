import type { APIRoute } from "astro";
import { z } from "zod";
import { EvaluationService } from "../../../../lib/services/evaluationService";
import {
  createEvaluationSchema,
  updateEvaluationSchema,
} from "../../../../lib/validation/evaluationSchemas";
import { supabaseClient } from "../../../../db/supabase.client";
import type { ErrorResponseDto } from "../../../../types";

// Schema for description ID validation
const descriptionIdSchema = z.string().uuid("Invalid description ID format");

export const POST: APIRoute = async ({ params, request }) => {
  try {
    // Validate description ID
    const validatedId = descriptionIdSchema.parse(params.id);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createEvaluationSchema.parse(body);

    // Create evaluation using service
    const evaluationService = new EvaluationService(supabaseClient);
    const evaluation = await evaluationService.create(
      validatedId,
      validatedData,
    );

    return new Response(JSON.stringify(evaluation), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating evaluation:", error);

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

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    // Validate description ID
    const validatedId = descriptionIdSchema.parse(params.id);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateEvaluationSchema.parse(body);

    // Update evaluation using service
    const evaluationService = new EvaluationService(supabaseClient);
    const evaluation = await evaluationService.update(
      validatedId,
      validatedData,
    );

    return new Response(JSON.stringify(evaluation), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating evaluation:", error);

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
