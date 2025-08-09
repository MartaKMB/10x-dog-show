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

    // Optional: enforce is_active from public.users if profile exists
    const { data: profile } = await supabase
      .from("users")
      .select("first_name,last_name,role,is_active")
      .eq("email", email)
      .maybeSingle();

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

    return new Response(
      JSON.stringify({
        user: {
          id: data.user?.id ?? "",
          email: data.user?.email ?? "",
          first_name: profile?.first_name ?? "",
          last_name: profile?.last_name ?? "",
          role: (profile?.role as "club_board") ?? "club_board",
        },
        access_token: data.session?.access_token ?? "",
        expires_at: new Date(
          (data.session?.expires_at ?? 0) * 1000,
        ).toISOString(),
      }),
      { status: 200 },
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
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
