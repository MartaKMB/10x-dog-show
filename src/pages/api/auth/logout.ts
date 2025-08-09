import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.server.ts";

export const POST: APIRoute = async ({ cookies, request }) => {
  const supabase = createSupabaseServerInstance({
    headers: request.headers,
    cookies,
  });

  const { error } = await supabase.auth.signOut();

  if (error) {
    return new Response(
      JSON.stringify({ error: { code: "400", message: error.message } }),
      { status: 400 },
    );
  }

  return new Response(null, { status: 200 });
};
