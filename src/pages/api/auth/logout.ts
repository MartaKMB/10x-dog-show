import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.server.ts";

export const POST: APIRoute = async ({ cookies, request }) => {
  const supabase = createSupabaseServerInstance({
    headers: request.headers,
    cookies,
  });

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({ error: { code: "400", message: error.message } }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(JSON.stringify({ message: "Wylogowano pomyślnie" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({ error: { code: "500", message: "Błąd serwera" } }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
