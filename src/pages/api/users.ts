import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../db/supabase.server";
import type { ErrorResponseDto } from "../../types";
import { z } from "zod";

// Schema dla tworzenia użytkownika
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.literal("club_board").default("club_board"),
});

export const GET: APIRoute = async () => {
  try {
    const supabase = createSupabaseServerClient();

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ data: users }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch users",
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, role } =
      createUserSchema.parse(body);

    const supabase = createSupabaseServerClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({
          error: {
            code: "CONFLICT",
            message: "User with this email already exists",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Hash password
    const passwordHashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(password),
    );
    const password_hash = Array.from(new Uint8Array(passwordHashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        password_hash,
        first_name,
        last_name,
        role: role || "club_board",
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        data: user,
        message: "User created successfully",
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error creating user:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        } as ErrorResponseDto),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create user",
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
