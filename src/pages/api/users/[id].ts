import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.server";
import { z } from "zod";
import type { ErrorResponseDto } from "../../../types";

// Schema dla aktualizacji użytkownika
const updateUserSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
});

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({
          error: { code: "BAD_REQUEST", message: "User ID is required" },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !user) {
      return new Response(
        JSON.stringify({
          error: {
            code: "NOT_FOUND",
            message: "User not found",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Usuń hash hasła z odpowiedzi
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;

    return new Response(JSON.stringify(userWithoutPassword), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user:", error);

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

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({
          error: { code: "BAD_REQUEST", message: "User ID is required" },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const supabase = createSupabaseServerClient();

    // Sprawdź czy użytkownik istnieje
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (!existingUser) {
      return new Response(
        JSON.stringify({
          error: {
            code: "NOT_FOUND",
            message: "User not found",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Usuń hash hasła z odpowiedzi
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;

    return new Response(JSON.stringify(userWithoutPassword), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating user:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
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

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({
          error: { code: "BAD_REQUEST", message: "User ID is required" },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const supabase = createSupabaseServerClient();

    // Soft delete - oznacz jako usunięty
    const { error } = await supabase
      .from("users")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        message: "User deleted successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error deleting user:", error);

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
