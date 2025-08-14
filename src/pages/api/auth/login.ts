import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerInstance } from "../../../db/supabase.server.ts";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const supabase = createSupabaseServerInstance({
      headers: request.headers,
      cookies,
    });

    // Logowanie przez Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message = error.message ?? "invalid_credentials";
      return new Response(
        JSON.stringify({
          error: { code: "401", message },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        }),
        { status: 401 },
      );
    }

    // Sprawdź profil w lokalnej tabeli users
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("first_name,last_name,role,is_active")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      // Kontynuuj bez profilu - użytkownik może nie mieć profilu w lokalnej tabeli
    }

    // Sprawdź czy konto jest aktywne (jeśli profil istnieje)
    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      return new Response(
        JSON.stringify({
          error: {
            code: "403",
            message: "Konto nieaktywne. Skontaktuj się z administratorem.",
          },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        }),
        { status: 403 },
      );
    }

    // Jeśli profil nie istnieje, utwórz go automatycznie
    if (!profile) {
      const { error: upsertError } = await supabase.from("users").upsert(
        {
          email,
          first_name: "Użytkownik", // Domyślne wartości
          last_name: "Systemu",
          role: "club_board",
          is_active: true,
          password_hash: "", // Puste - hasło jest w Supabase Auth
        },
        { onConflict: "email" },
      );

      if (upsertError) {
        console.error("Profile creation error:", upsertError);
        // Kontynuuj bez profilu
      }
    }

    return new Response(
      JSON.stringify({
        user: {
          id: data.user?.id ?? "",
          email: data.user?.email ?? "",
          first_name: profile?.first_name ?? "Użytkownik",
          last_name: profile?.last_name ?? "Systemu",
          role: (profile?.role as "club_board") ?? "club_board",
        },
        access_token: data.session?.access_token ?? "",
        expires_at: new Date(
          (data.session?.expires_at ?? 0) * 1000,
        ).toISOString(),
      }),
      { status: 200 },
    );
  } catch (err) {
    console.error("Login error:", err);
    return new Response(
      JSON.stringify({
        error: { code: "422", message: "invalid_payload" },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      }),
      { status: 422 },
    );
  }
};
