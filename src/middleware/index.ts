import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.server";

export const onRequest = defineMiddleware(
  async ({ locals, cookies, request }, next) => {
    const supabase = createSupabaseServerInstance({
      headers: request.headers,
      cookies,
    });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    locals.supabase = supabase;
    locals.auth = { session, user: session?.user ?? null };

    // All routes are public for now; middleware only enriches locals
    return next();
  },
);
