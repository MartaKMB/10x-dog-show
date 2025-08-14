import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export const cookieOptions: CookieOptionsWithName = {
  name: undefined, // use defaults per @supabase/ssr
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(
  cookieHeader: string,
): { name: string; value: string }[] {
  if (!cookieHeader) return [];
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  const supabase = createServerClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY, // Poprawka: SUPABASE_KEY -> SUPABASE_ANON_KEY
    {
      cookieOptions,
      cookies: {
        getAll() {
          return parseCookieHeader(context.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return supabase;
};

// Funkcja do tworzenia klienta dla API routes (nie wymaga auth w lokalnym środowisku)
export const createSupabaseServerClient = () => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // Sprawdź czy zmienne środowiskowe są dostępne
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  // Check if we're in local development environment
  const isLocalDevelopment =
    supabaseUrl?.includes("127.0.0.1") || supabaseUrl?.includes("localhost");

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    // In local development, disable auth completely for server-side API calls
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    // In local development, use empty headers to avoid auth issues
    global: {
      headers: isLocalDevelopment ? {} : undefined,
    },
    // In local development, don't require any auth
    db: {
      schema: "public",
    },
  });
};

export type { Database } from "./database.types";
