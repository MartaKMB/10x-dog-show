import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.server";

export const onRequest = defineMiddleware(
  async ({ locals, cookies, request }, next) => {
    const supabase = createSupabaseServerInstance({
      headers: request.headers,
      cookies,
    });

    // Use getUser() instead of getSession() for better security
    const {
      data: { user },
    } = await supabase.auth.getUser();
    locals.supabase = supabase;
    locals.auth = { user, session: user ? null : null };

    // All routes are public for now; middleware only enriches locals
    return next();
  },
);
