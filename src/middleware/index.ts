import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.server";

// Ścieżki chronione (wymagają autoryzacji)
const PROTECTED_PATHS = [
  "/dashboard",
  "/shows/new",
  "/shows/*/edit",
  "/dogs/new",
  "/dogs/*/edit",
  "/owners/new",
  "/owners/*/edit",
];

export const onRequest = defineMiddleware(
  async ({ locals, cookies, request, url, redirect }, next) => {
    const supabase = createSupabaseServerInstance({
      headers: request.headers,
      cookies,
    });

    try {
      // Sprawdź sesję użytkownika
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Auth error in middleware:", error);
      }

      // Wzbogac locals
      locals.supabase = supabase;
      locals.auth = {
        user: user || null,
        session: null, // Uproszczenie - nie potrzebujemy pełnej sesji w middleware
      };

      // Sprawdź czy ścieżka wymaga autoryzacji
      const isProtectedPath = PROTECTED_PATHS.some((path) => {
        if (path.includes("*")) {
          const basePath = path.replace("/*", "");
          return url.pathname.startsWith(basePath) && url.pathname !== basePath;
        }
        return url.pathname.startsWith(path);
      });

      if (isProtectedPath && !user) {
        // Przekieruj na stronę logowania z informacją o powrocie
        const redirectUrl = `/auth/login?redirect=${encodeURIComponent(url.pathname)}`;
        return redirect(redirectUrl);
      }

      return next();
    } catch (error) {
      console.error("Middleware error:", error);
      // W przypadku błędu, kontynuuj bez autoryzacji
      locals.supabase = supabase;
      locals.auth = { user: null, session: null };
      return next();
    }
  },
);
