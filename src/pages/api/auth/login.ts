import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.server.ts";

export const POST: APIRoute = async ({ cookies, request }) => {
  const supabase = createSupabaseServerInstance({
    headers: request.headers,
    cookies,
  });

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Email i hasło są wymagane",
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: {
            code: "AUTHENTICATION_ERROR",
            message: error.message,
          },
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        message: "Zalogowano pomyślnie",
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Błąd serwera",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
