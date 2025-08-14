import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.server";
import type { ErrorResponseDto } from "../../../types";

interface DashboardStats {
  totalShows: number;
  completedShows: number;
  totalDogs: number;
}

export const GET: APIRoute = async () => {
  try {
    const supabase = createSupabaseServerClient();

    // Get total shows
    const { count: totalShows, error: showsError } = await supabase
      .from("shows")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    if (showsError) throw showsError;

    // Get completed shows
    const { count: completedShows, error: completedShowsError } = await supabase
      .from("shows")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "completed");

    if (completedShowsError) throw completedShowsError;

    // Get total dogs
    const { count: totalDogs, error: dogsError } = await supabase
      .from("dogs")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    if (dogsError) throw dogsError;

    const stats: DashboardStats = {
      totalShows: totalShows || 0,
      completedShows: completedShows || 0,
      totalDogs: totalDogs || 0,
    };

    return new Response(JSON.stringify({ data: stats }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch dashboard statistics",
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
