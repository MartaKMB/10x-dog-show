import type { APIRoute } from "astro";
import { supabaseClient } from "../../../db/supabase.client";
import type { ErrorResponseDto } from "../../../types";

interface DashboardStats {
  totalShows: number;
  completedShows: number;
  totalDogs: number;
}

export const GET: APIRoute = async () => {
  try {
    // Get total shows
    const { count: totalShows, error: showsError } = await supabaseClient
      .from("shows")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    if (showsError) throw showsError;

    // Get completed shows
    const { count: completedShows, error: completedShowsError } =
      await supabaseClient
        .from("shows")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("status", "completed");

    if (completedShowsError) throw completedShowsError;

    // Get total dogs
    const { count: totalDogs, error: dogsError } = await supabaseClient
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
