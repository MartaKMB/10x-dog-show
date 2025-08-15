import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types.ts";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY; // Poprawka: PUBLIC_SUPABASE_KEY -> PUBLIC_SUPABASE_ANON_KEY

// Check if we're in local development environment
const isLocalDevelopment =
  supabaseUrl?.includes("127.0.0.1") || supabaseUrl?.includes("localhost");

export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    // In local development, disable auth completely
    auth: {
      autoRefreshToken: !isLocalDevelopment,
      persistSession: !isLocalDevelopment,
      detectSessionInUrl: !isLocalDevelopment,
    },
    // In local development, use empty headers to avoid auth issues
    global: {
      headers: isLocalDevelopment ? {} : undefined,
    },
    // In local development, don't require any auth
    db: {
      schema: "public",
    },
  },
);

export type { Database } from "./database.types.ts";
