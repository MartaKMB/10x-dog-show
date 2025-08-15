-- =============================================================================
-- Fix RLS Policies for Local Development
-- =============================================================================
-- Purpose: Fix infinite recursion in RLS policies for local development
-- Date: 2024-12-21
-- =============================================================================

-- Drop existing problematic policies
drop policy if exists users_club_board_access on public.users;
drop policy if exists shows_club_board_access on public.shows;
drop policy if exists dogs_club_board_access on public.dogs;
drop policy if exists owners_club_board_access on public.owners;
drop policy if exists dog_owners_club_board_access on public.dog_owners;
drop policy if exists show_registrations_club_board_access on public.show_registrations;
drop policy if exists evaluations_club_board_access on public.evaluations;

-- Create simplified policies for local development
-- These policies allow all operations for local development without auth complexity

-- Users table - allow all operations for local development
create policy users_local_dev_access on public.users
    for all using (true);

-- Shows table - allow all operations for local development
create policy shows_local_dev_access on public.shows
    for all using (true);

-- Dogs table - allow all operations for local development
create policy dogs_local_dev_access on public.dogs
    for all using (true);

-- Owners table - allow all operations for local development
create policy owners_local_dev_access on public.owners
    for all using (true);

-- Dog owners table - allow all operations for local development
create policy dog_owners_local_dev_access on public.dog_owners
    for all using (true);

-- Show registrations table - allow all operations for local development
create policy show_registrations_local_dev_access on public.show_registrations
    for all using (true);

-- Evaluations table - allow all operations for local development
create policy evaluations_local_dev_access on public.evaluations
    for all using (true);

-- Keep the soft-delete policies as they are simple and don't cause recursion
-- These policies are already correct and don't need changes
