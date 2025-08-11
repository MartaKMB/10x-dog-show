import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerInstance } from "../../../db/supabase.server.ts";

const showsQuerySchema = z.object({
  status: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  search: z.string().optional(),
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("20"),
});

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const url = new URL(request.url);
    const queryParams = showsQuerySchema.parse(
      Object.fromEntries(url.searchParams),
    );

    const supabase = createSupabaseServerInstance({
      headers: request.headers,
      cookies,
    });

    // Build the base query
    let query = supabase
      .from("shows")
      .select(
        `
        id,
        name,
        status,
        show_date,
        registration_deadline,
        location,
        judge_name,
        description,
        max_participants,
        created_at,
        updated_at
      `,
      )
      .is("deleted_at", null)
      .order("show_date", { ascending: false });

    // Apply filters
    if (queryParams.status) {
      query = query.eq(
        "status",
        queryParams.status as
          | "draft"
          | "open_for_registration"
          | "registration_closed"
          | "in_progress"
          | "completed"
          | "cancelled",
      );
    }

    if (queryParams.from_date) {
      query = query.gte("show_date", queryParams.from_date);
    }

    if (queryParams.to_date) {
      query = query.lte("show_date", queryParams.to_date);
    }

    if (queryParams.search) {
      query = query.or(
        `name.ilike.%${queryParams.search}%,location.ilike.%${queryParams.search}%,judge_name.ilike.%${queryParams.search}%`,
      );
    }

    // Get total count for pagination - use separate count query
    const countQuery = supabase
      .from("shows")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    // Apply same filters to count query
    if (queryParams.status) {
      countQuery.eq(
        "status",
        queryParams.status as
          | "draft"
          | "open_for_registration"
          | "registration_closed"
          | "in_progress"
          | "completed"
          | "cancelled",
      );
    }

    if (queryParams.from_date) {
      countQuery.gte("show_date", queryParams.from_date);
    }

    if (queryParams.to_date) {
      countQuery.lte("show_date", queryParams.to_date);
    }

    if (queryParams.search) {
      countQuery.or(
        `name.ilike.%${queryParams.search}%,location.ilike.%${queryParams.search}%,judge_name.ilike.%${queryParams.search}%`,
      );
    }

    const { count } = await countQuery;

    // Apply pagination
    const offset = (queryParams.page - 1) * queryParams.limit;
    query = query.range(offset, offset + queryParams.limit - 1);

    const { data: shows, error } = await query;

    if (error) {
      console.error("Error fetching shows:", error);
      return new Response(
        JSON.stringify({
          error: { code: "500", message: "Internal server error" },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        }),
        { status: 500 },
      );
    }

    // Calculate pagination info
    const total = count || 0;
    const pages = Math.ceil(total / queryParams.limit);

    return new Response(
      JSON.stringify({
        data: shows || [],
        pagination: {
          page: queryParams.page,
          limit: queryParams.limit,
          total,
          pages,
        },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error in shows API:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: { code: "400", message: "Invalid query parameters" },
          details: error.errors,
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        }),
        { status: 400 },
      );
    }

    return new Response(
      JSON.stringify({
        error: { code: "500", message: "Internal server error" },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      }),
      { status: 500 },
    );
  }
};
