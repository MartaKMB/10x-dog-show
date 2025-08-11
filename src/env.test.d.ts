/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly TEST_ENVIRONMENT: string;
  readonly TEST_BASE_URL: string;
  readonly TEST_USER_EMAIL: string;
  readonly TEST_USER_PASSWORD: string;
  readonly TEST_USER_ID: string;
  readonly TEST_SHOW_ID: string;
  readonly TEST_DOG_ID: string;
  readonly TEST_JUDGE_ID: string;
  readonly TEST_SECRETARY_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Test mode global
declare const __TEST_MODE__: boolean;
