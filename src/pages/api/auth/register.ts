import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerInstance } from "../../../db/supabase.server.ts";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name } =
      registerSchema.parse(body);

    const supabase = createSupabaseServerInstance({
      headers: request.headers,
      cookies,
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      const message = error.message ?? "registration_failed";
      return new Response(
        JSON.stringify({
          error: { code: "400", message },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        }),
        { status: 400 },
      );
    }

    // Utwórz/uzupełnij rekord profilu w public.users (tymczasowa zgodność)
    // Hash hasła jak w /api/users.ts
    const passwordHashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(password),
    );
    const password_hash = Array.from(new Uint8Array(passwordHashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { error: upsertError } = await supabase.from("users").upsert(
      {
        email,
        first_name,
        last_name,
        role: "club_board",
        is_active: true,
        password_hash,
      },
      { onConflict: "email" },
    );

    if (upsertError) {
      // Nie przerywaj procesu – konto w Auth zostało utworzone
      // Można dodać logowanie błędu po stronie serwera, jeśli będzie potrzebne
    }

    // Zapewnij aktywną sesję (brak wymogu potwierdzenia email)
    let session = data.session ?? null;
    if (!session) {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      session = signInData?.session ?? null;
    }

    if (!session) {
      return new Response(
        JSON.stringify({
          error: { code: "500", message: "could_not_establish_session" },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        }),
        { status: 500 },
      );
    }

    return new Response(
      JSON.stringify({
        user: {
          id: data.user?.id ?? "",
          email: data.user?.email ?? email,
          first_name,
          last_name,
          role: "club_board",
        },
        access_token: session.access_token,
        expires_at: new Date((session.expires_at ?? 0) * 1000).toISOString(),
      }),
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: { code: "422", message: "invalid_payload" },
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        }),
        { status: 422 },
      );
    }

    return new Response(
      JSON.stringify({
        error: { code: "400", message: "bad_request" },
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      }),
      { status: 400 },
    );
  }
};
