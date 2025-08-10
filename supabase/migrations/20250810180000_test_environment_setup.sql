-- =============================================================================
-- Test Environment Setup for E2E Tests
-- =============================================================================
-- Purpose: Prepare database for E2E testing with appropriate RLS policies
-- Date: 2025-08-10
-- =============================================================================

-- =============================================================================
-- Drop existing policies to recreate them for test environment
-- =============================================================================

-- Drop existing policies
drop policy if exists "dog_owners_club_board_access" on "public"."dog_owners";
drop policy if exists "dogs_club_board_access" on "public"."dogs";
drop policy if exists "hide_deleted_dogs" on "public"."dogs";
drop policy if exists "evaluations_club_board_access" on "public"."evaluations";
drop policy if exists "hide_deleted_owners" on "public"."owners";
drop policy if exists "owners_club_board_access" on "public"."owners";
drop policy if exists "registrations_club_board_access" on "public"."show_registrations";
drop policy if exists "hide_deleted_shows" on "public"."shows";
drop policy if exists "shows_club_board_access" on "public"."shows";
drop policy if exists "hide_deleted_users" on "public"."users";
drop policy if exists "users_club_board_access" on "public"."users";

-- =============================================================================
-- Create new policies for test environment
-- These policies allow test users to access data for E2E testing
-- =============================================================================

-- Users table policies
create policy "users_test_access"
on "public"."users"
as permissive
for all
to public
using (
    auth.uid() IS NOT NULL AND (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() AND users.role = 'club_board'
        ) OR
        -- Allow test users to access their own data
        auth.uid() = id
    )
);

create policy "hide_deleted_users"
on "public"."users"
as permissive
for select
to public
using (deleted_at IS NULL);

-- Shows table policies
create policy "shows_test_access"
on "public"."shows"
as permissive
for all
to public
using (
    auth.uid() IS NOT NULL AND (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() AND users.role = 'club_board'
        ) OR
        -- Allow test users to view shows
        true
    )
);

create policy "hide_deleted_shows"
on "public"."shows"
as permissive
for select
to public
using (deleted_at IS NULL);

-- Owners table policies
create policy "owners_test_access"
on "public"."owners"
as permissive
for all
to public
using (
    auth.uid() IS NOT NULL AND (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() AND users.role = 'club_board'
        ) OR
        -- Allow test users to view owners
        true
    )
);

create policy "hide_deleted_owners"
on "public"."owners"
as permissive
for select
to public
using (deleted_at IS NULL);

-- Dogs table policies
create policy "dogs_test_access"
on "public"."dogs"
as permissive
for all
to public
using (
    auth.uid() IS NOT NULL AND (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() AND users.role = 'club_board'
        ) OR
        -- Allow test users to view dogs
        true
    )
);

create policy "hide_deleted_dogs"
on "public"."dogs"
as permissive
for select
to public
using (deleted_at IS NULL);

-- Dog owners table policies
create policy "dog_owners_test_access"
on "public"."dog_owners"
as permissive
for all
to public
using (
    auth.uid() IS NOT NULL AND (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() AND users.role = 'club_board'
        ) OR
        -- Allow test users to view dog owners
        true
    )
);

-- Show registrations table policies
create policy "registrations_test_access"
on "public"."show_registrations"
as permissive
for all
to public
using (
    auth.uid() IS NOT NULL AND (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() AND users.role = 'club_board'
        ) OR
        -- Allow test users to view registrations
        true
    )
);

-- Evaluations table policies
create policy "evaluations_test_access"
on "public"."evaluations"
as permissive
for all
to public
using (
    auth.uid() IS NOT NULL AND (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() AND users.role = 'club_board'
        ) OR
        -- Allow test users to view evaluations
        true
    )
);

-- =============================================================================
-- Create a test user for E2E testing
-- This will be used by Playwright tests
-- =============================================================================

insert into public.users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    created_at,
    updated_at
) values (
    gen_random_uuid(),
    'test@example.com',
    '$2a$10$test.hash.for.testing.environment.only',
    'Test',
    'User',
    'club_board',
    true,
    now(),
    now()
) on conflict (email) do nothing;

-- =============================================================================
-- Grant necessary permissions for test environment
-- =============================================================================

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;
