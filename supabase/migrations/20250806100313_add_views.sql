-- =============================================================================
-- Migration: Disable All RLS Policies for Hovawart App
-- =============================================================================
-- Purpose: Disable all Row Level Security policies for the simplified Hovawart Club MVP
-- Author: System Migration
-- Date: 2025-08-06
-- =============================================================================

-- =============================================================================
-- 1. DROP ALL RLS POLICIES
-- =============================================================================

-- Drop club board access policies
drop policy if exists users_club_board_access on public.users;
drop policy if exists shows_club_board_access on public.shows;
drop policy if exists dogs_club_board_access on public.dogs;
drop policy if exists owners_club_board_access on public.owners;
drop policy if exists registrations_club_board_access on public.show_registrations;
drop policy if exists evaluations_club_board_access on public.evaluations;
drop policy if exists dog_owners_club_board_access on public.dog_owners;

-- Drop soft-delete policies
drop policy if exists hide_deleted_users on public.users;
drop policy if exists hide_deleted_shows on public.shows;
drop policy if exists hide_deleted_dogs on public.dogs;
drop policy if exists hide_deleted_owners on public.owners;

-- =============================================================================
-- 2. DISABLE RLS ON ALL TABLES
-- =============================================================================

-- Disable RLS on all public schema tables
alter table public.users disable row level security;
alter table public.shows disable row level security;
alter table public.dogs disable row level security;
alter table public.owners disable row level security;
alter table public.show_registrations disable row level security;
alter table public.evaluations disable row level security;
alter table public.dog_owners disable row level security;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================

-- migration completed successfully
-- all rls policies dropped and rls disabled on all tables in public schema
-- hovawart app no longer enforces row level security
-- system is now open for development and testing purposes
