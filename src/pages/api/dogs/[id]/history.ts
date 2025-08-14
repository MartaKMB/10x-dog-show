import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../../db/supabase.server";
import { DogService } from "../../../../lib/services/dogService";
import type { ErrorResponseDto } from "../../../../types";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Dog ID is required",
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

    const url = new URL(request.url);
    const queryParamsObj = Object.fromEntries(url.searchParams.entries());

    // Parse query parameters
    const queryParams = {
      from_date: queryParamsObj.from_date,
      to_date: queryParamsObj.to_date,
      page: queryParamsObj.page ? parseInt(queryParamsObj.page) : undefined,
      limit: queryParamsObj.limit ? parseInt(queryParamsObj.limit) : undefined,
    };

    const supabase = createSupabaseServerClient();
    // Get dog history using service
    const dogService = new DogService(supabase);
    const history = await dogService.getDogHistory(id, queryParams);

    return new Response(JSON.stringify(history), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching dog history:", error);

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
