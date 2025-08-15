import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../db/supabase.server";
import { ShowService } from "../../../lib/services/showService";
import { updateShowSchema } from "../../../lib/validation/showSchemas";
import type { ErrorResponseDto } from "../../../types";

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({
          error: { code: "BAD_REQUEST", message: "Show ID is required" },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const supabase = createSupabaseServerClient();
    const showService = new ShowService(supabase);

    const show = await showService.getShowById(id);

    return new Response(JSON.stringify(show), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching show:", error);

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

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({
          error: { code: "BAD_REQUEST", message: "Show ID is required" },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const body = await request.json();
    const validatedData = updateShowSchema.parse(body);

    const supabase = createSupabaseServerClient();
    const showService = new ShowService(supabase);

    const show = await showService.update(id, validatedData);

    return new Response(JSON.stringify(show), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating show:", error);

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
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({
          error: { code: "BAD_REQUEST", message: "Show ID is required" },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const supabase = createSupabaseServerClient();
    const showService = new ShowService(supabase);

    await showService.delete(id);

    return new Response(
      JSON.stringify({
        message: "Show deleted successfully",
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting show:", error);

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
