import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../../../db/supabase.server";
import { ShowService } from "../../../../../lib/services/showService";
import type { ErrorResponseDto } from "../../../../../types";

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id: showId } = params;

    if (!showId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "BAD_REQUEST",
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

    const supabase = createSupabaseServerClient();
    // Get registration stats using service
    const showService = new ShowService(supabase);
    const registrations = await showService.getRegistrations(showId);

    // Calculate stats from registrations
    const stats = {
      total: registrations.length,
      byClass: registrations.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc: Record<string, number>, reg: any) => {
          acc[reg.dog_class] = (acc[reg.dog_class] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byGender: registrations.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc: Record<string, number>, reg: any) => {
          acc[reg.dog.gender] = (acc[reg.dog.gender] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching registration stats:", error);

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
