-- =============================================================================
-- Migration: Disable RLS Again for Local Development
-- =============================================================================
-- Purpose: Disable Row Level Security that was re-enabled by previous migration
-- Date: 2025-08-14
-- =============================================================================

-- Disable RLS on all tables for local development
alter table public.users disable row level security;
alter table public.shows disable row level security;
alter table public.owners disable row level security;
alter table public.dogs disable row level security;
alter table public.dog_owners disable row level security;
alter table public.show_registrations disable row level security;
alter table public.evaluations disable row level security;

-- Drop all RLS policies
drop policy if exists "users_club_board_access" on public.users;
drop policy if exists "shows_club_board_access" on public.shows;
drop policy if exists "owners_club_board_access" on public.owners;
drop policy if exists "dogs_club_board_access" on public.dogs;
drop policy if exists "dog_owners_club_board_access" on public.dog_owners;
drop policy if exists "show_registrations_club_board_access" on public.show_registrations;
drop policy if exists "evaluations_club_board_access" on public.evaluations;
drop policy if exists "users_local_dev_access" on public.users;
drop policy if exists "shows_local_dev_access" on public.shows;
drop policy if exists "owners_local_dev_access" on public.owners;
drop policy if exists "dogs_local_dev_access" on public.dogs;
drop policy if exists "dog_owners_local_dev_access" on public.dog_owners;
drop policy if exists "show_registrations_local_dev_access" on public.show_registrations;
drop policy if exists "evaluations_local_dev_access" on public.evaluations;

-- Grant all permissions to anon and authenticated users for local development
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;
grant usage on schema public to anon, authenticated;
