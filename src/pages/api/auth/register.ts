import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.server.ts";

export const POST: APIRoute = async ({ cookies, request }) => {
  const supabase = createSupabaseServerInstance({
    headers: request.headers,
    cookies,
  });

  try {
    const { email, password, confirm_password, first_name, last_name } =
      await request.json();

    // Walidacja
    if (!email || !password || !confirm_password || !first_name || !last_name) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Wszystkie pola są wymagane",
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

    if (password !== confirm_password) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Hasła nie są identyczne",
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

    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Hasło musi mieć co najmniej 8 znaków",
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

    // Rejestracja przez Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          role: "club_board",
        },
      },
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: {
            code: "REGISTRATION_ERROR",
            message: error.message,
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

    // Utworzenie profilu w lokalnej tabeli users
    if (data.user && data.user.id) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email || email,
        first_name,
        last_name,
        role: "club_board",
        is_active: true,
        password_hash: "", // Puste - hasło jest w Supabase Auth
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Kontynuuj mimo błędu profilu
      }
    }

    return new Response(
      JSON.stringify({
        message: "Konto zostało utworzone pomyślnie",
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Registration error:", error);
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
