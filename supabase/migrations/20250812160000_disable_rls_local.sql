-- =============================================================================
-- Migration: Aggressively Disable RLS for Local Development
-- =============================================================================
-- Purpose: Completely disable Row Level Security for local development
-- Affected: All tables in public schema - removes ALL RLS policies
-- Author: System Migration
-- Date: 2025-08-12
-- Special Considerations: 
-- - This migration is for LOCAL DEVELOPMENT ONLY
-- - Should NOT be applied to production
-- - RLS will be re-enabled when deploying to production
-- - This migration is AGGRESSIVE - removes all RLS policies
-- =============================================================================

-- =============================================================================
-- STEP 1: DROP ALL EXISTING RLS POLICIES
-- =============================================================================

-- Drop all policies from users table
drop policy if exists "users_club_board_access" on public.users;
drop policy if exists "users_test_access" on public.users;
drop policy if exists "hide_deleted_users" on public.users;

-- Drop all policies from shows table
drop policy if exists "shows_club_board_access" on public.shows;
drop policy if exists "shows_test_access" on public.shows;
drop policy if exists "hide_deleted_shows" on public.shows;

-- Drop all policies from owners table
drop policy if exists "owners_club_board_access" on public.owners;
drop policy if exists "owners_test_access" on public.owners;
drop policy if exists "hide_deleted_owners" on public.owners;

-- Drop all policies from dogs table
drop policy if exists "dogs_club_board_access" on public.dogs;
drop policy if exists "dogs_test_access" on public.dogs;
drop policy if exists "hide_deleted_dogs" on public.dogs;

-- Drop all policies from dog_owners table
drop policy if exists "dog_owners_club_board_access" on public.dog_owners;
drop policy if exists "dog_owners_test_access" on public.dog_owners;

-- Drop all policies from show_registrations table
drop policy if exists "registrations_club_board_access" on public.show_registrations;
drop policy if exists "registrations_test_access" on public.show_registrations;

-- Drop all policies from evaluations table
drop policy if exists "evaluations_club_board_access" on public.evaluations;
drop policy if exists "evaluations_test_access" on public.evaluations;

-- =============================================================================
-- STEP 2: DISABLE RLS ON ALL TABLES
-- =============================================================================

-- Disable RLS on all tables for local development
alter table public.users disable row level security;
alter table public.shows disable row level security;
alter table public.owners disable row level security;
alter table public.dogs disable row level security;
alter table public.dog_owners disable row level security;
alter table public.show_registrations disable row level security;
alter table public.evaluations disable row level security;

-- =============================================================================
-- STEP 3: GRANT ALL PERMISSIONS
-- =============================================================================

-- Grant all permissions to anon and authenticated users for local development
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;

-- Grant usage on schema
grant usage on schema public to anon, authenticated;

-- =============================================================================
-- STEP 4: VERIFICATION COMMENTS
-- =============================================================================
-- COMPLETED: RLS aggressively disabled for local development
-- All RLS policies removed
-- All tables have RLS disabled
-- All permissions granted to anon and authenticated users
-- =============================================================================
