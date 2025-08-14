import type { APIRoute } from "astro";
import { supabaseServerClient } from "../../../../../db/supabase.server";
import type { ErrorResponseDto } from "../../../../../types";

export const POST: APIRoute = async ({ params }) => {
  try {
    const { showId } = params;
    if (!showId) {
      return new Response(
        JSON.stringify({
          error: { code: "400", message: "Show ID is required" },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 400 },
      );
    }

    // Generate catalog numbers using Supabase function
    const supabase = supabaseServerClient;

    const { error } = await supabase.rpc("generate_catalog_numbers", {
      show_id_param: showId,
    });

    if (error) {
      console.error("Error generating catalog numbers:", error);
      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to generate catalog numbers",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 500 },
      );
    }

    // Get count of registrations to return in response
    const { count: registeredDogs } = await supabase
      .from("show_registrations")
      .select("*", { count: "exact", head: true })
      .eq("show_id", showId);

    return new Response(
      JSON.stringify({
        message: "Catalog numbers generated successfully",
        generated_count: registeredDogs || 0,
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating catalog numbers:", error);

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
