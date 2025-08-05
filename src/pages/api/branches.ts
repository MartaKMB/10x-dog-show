import type { APIRoute } from "astro";
import type { ErrorResponseDto } from "../../types";
import { BranchService } from "../../lib/services/branchService";
import { branchQuerySchema } from "../../lib/validation/branchSchemas";
import { supabaseClient } from "../../db/supabase.client";

// Mock DEFAULT_USER dla testów (department_representative)
const DEFAULT_USER = {
  id: "00000000-0000-0000-0000-000000000002",
  role: "department_representative" as const,
};

export const GET: APIRoute = async ({ request }) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Use DEFAULT_USER instead of real auth for now
    const user = DEFAULT_USER;

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      region: url.searchParams.get("region") || undefined,
      is_active: url.searchParams.get("is_active") || undefined,
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
    };

    // Validate query parameters using Zod schema
    const validationResult = branchQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorDetails = validationResult.error.errors.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      const errorResponse: ErrorResponseDto = {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
          details: errorDetails,
        },
        timestamp: new Date().toISOString(),
        request_id: requestId,
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize service and fetch data
    const branchService = new BranchService(supabaseClient);
    const result = await branchService.getMany(validationResult.data);

    // Log successful request
    const responseTime = Date.now() - startTime;
    // eslint-disable-next-line no-console
    console.log(
      `[${new Date().toISOString()}] GET /api/branches - Success - User: ${user.id} - Response time: ${responseTime}ms - Request ID: ${requestId}`,
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorCode = errorMessage.startsWith("NOT_FOUND:")
      ? "NOT_FOUND"
      : errorMessage.startsWith("VALIDATION_ERROR:")
        ? "VALIDATION_ERROR"
        : errorMessage.startsWith("CONFLICT:")
          ? "CONFLICT"
          : "INTERNAL_ERROR";

    // Log error

    console.error(
      `[${new Date().toISOString()}] GET /api/branches - Error - User: ${DEFAULT_USER.id} - Error: ${errorMessage} - Response time: ${responseTime}ms - Request ID: ${requestId}`,
    );

    const errorResponse: ErrorResponseDto = {
      error: {
        code: errorCode,
        message: errorMessage.replace(/^[A-Z_]+:\s*/, ""), // Remove error code prefix
      },
      timestamp: new Date().toISOString(),
      request_id: requestId,
    };

    const statusCode =
      errorCode === "NOT_FOUND"
        ? 404
        : errorCode === "VALIDATION_ERROR"
          ? 400
          : errorCode === "CONFLICT"
            ? 409
            : 500;

    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
};
