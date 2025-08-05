-- =============================================================================
-- Migration: Disable All RLS Policies
-- =============================================================================
-- Purpose: Disable all Row Level Security policies defined in previous migrations
-- Author: System Migration
-- Date: 2024-12-20
-- =============================================================================

-- =============================================================================
-- 1. DROP ALL RLS POLICIES
-- =============================================================================

-- Drop show policies
drop policy if exists shows_department_representative_select on dog_shows.shows;
drop policy if exists shows_department_representative_insert on dog_shows.shows;
drop policy if exists shows_department_representative_update on dog_shows.shows;
drop policy if exists shows_department_representative_delete on dog_shows.shows;

-- Drop description policies
drop policy if exists descriptions_secretary_select on dog_shows.descriptions;
drop policy if exists descriptions_secretary_insert on dog_shows.descriptions;
drop policy if exists descriptions_secretary_update on dog_shows.descriptions;

-- Drop soft-delete policies
drop policy if exists hide_deleted_shows on dog_shows.shows;
drop policy if exists hide_deleted_dogs on dog_shows.dogs;
drop policy if exists hide_deleted_owners on dog_shows.owners;

-- Drop public access policies
drop policy if exists public_breeds_select on dictionary.breeds;
drop policy if exists public_branches_select on dictionary.branches;
drop policy if exists public_judges_select on dictionary.judges;
drop policy if exists public_judge_specializations_select on dictionary.judge_specializations;

-- =============================================================================
-- 2. DISABLE RLS ON ALL TABLES
-- =============================================================================

-- Disable RLS on main business tables
alter table dog_shows.shows disable row level security;
alter table dog_shows.dogs disable row level security;
alter table dog_shows.owners disable row level security;
alter table dog_shows.descriptions disable row level security;
alter table dog_shows.show_registrations disable row level security;
alter table dog_shows.secretary_assignments disable row level security;
alter table dog_shows.evaluations disable row level security;
alter table dog_shows.pdf_documents disable row level security;

-- Disable RLS on dictionary tables
alter table dictionary.breeds disable row level security;
alter table dictionary.branches disable row level security;
alter table dictionary.judges disable row level security;
alter table dictionary.judge_specializations disable row level security;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================

-- migration completed successfully
-- all rls policies dropped and rls disabled on all tables
-- system no longer enforces row level security 
