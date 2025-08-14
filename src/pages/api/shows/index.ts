import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../db/supabase.server";
import { ShowService } from "../../../lib/services/showService";
import { createShowSchema } from "../../../lib/validation/showSchemas";
import type { ErrorResponseDto } from "../../../types";

const showsQuerySchema = z.object({
  status: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  search: z.string().optional(),
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("20"),
});

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const queryParams = showsQuerySchema.parse(
      Object.fromEntries(url.searchParams),
    );

    const supabase = createSupabaseServerClient();

    // Build the base query with registration count
    let query = supabase
      .from("shows")
      .select(
        `
        id,
        name,
        status,
        show_date,
        location,
        judge_name,
        description,
        max_participants,
        created_at,
        updated_at,
        registered_dogs:show_registrations(count)
      `,
      )
      .is("deleted_at", null)
      .order("show_date", { ascending: false });

    // Apply filters
    if (queryParams.status) {
      query = query.eq("status", queryParams.status as "draft" | "completed");
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
      countQuery.eq("status", queryParams.status as "draft" | "completed");
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

    // Process shows to extract registration count
    const processedShows =
      shows?.map((show) => ({
        ...show,
        registered_dogs: show.registered_dogs?.[0]?.count || 0,
      })) || [];

    // Calculate pagination info
    const total = count || 0;
    const pages = Math.ceil(total / queryParams.limit);

    return new Response(
      JSON.stringify({
        data: processedShows,
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

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const validatedData = createShowSchema.parse(body);

    // Create show using service with server instance
    const supabase = createSupabaseServerClient();

    const showService = new ShowService(supabase);
    const show = await showService.create(validatedData);

    return new Response(JSON.stringify(show), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating show:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error("Zod validation errors:", error.errors);
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
      console.error("Business logic error:", error.message);
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
