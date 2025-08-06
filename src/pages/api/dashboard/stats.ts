import type { APIRoute } from "astro";
import { supabaseClient } from "../../../db/supabase.client";
import type { ErrorResponseDto } from "../../../types";

interface DashboardStats {
  totalShows: number;
  activeShows: number;
  totalDogs: number;
  totalOwners: number;
  upcomingShows: number;
  completedShows: number;
}

export const GET: APIRoute = async () => {
  try {
    // Get total shows
    const { count: totalShows, error: showsError } = await supabaseClient
      .from("shows")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    if (showsError) throw showsError;

    // Get active shows (draft, open_for_registration, registration_closed, in_progress)
    const { count: activeShows, error: activeShowsError } = await supabaseClient
      .from("shows")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .in("status", [
        "draft",
        "open_for_registration",
        "registration_closed",
        "in_progress",
      ]);

    if (activeShowsError) throw activeShowsError;

    // Get upcoming shows (future dates)
    const { count: upcomingShows, error: upcomingShowsError } =
      await supabaseClient
        .from("shows")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .gte("show_date", new Date().toISOString().split("T")[0]);

    if (upcomingShowsError) throw upcomingShowsError;

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

    // Get total owners
    const { count: totalOwners, error: ownersError } = await supabaseClient
      .from("owners")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    if (ownersError) throw ownersError;

    const stats: DashboardStats = {
      totalShows: totalShows || 0,
      activeShows: activeShows || 0,
      totalDogs: totalDogs || 0,
      totalOwners: totalOwners || 0,
      upcomingShows: upcomingShows || 0,
      completedShows: completedShows || 0,
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
