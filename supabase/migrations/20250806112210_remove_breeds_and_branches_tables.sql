-- =============================================================================
-- Migration: Remove breeds and branches tables from public schema
-- =============================================================================
-- Purpose: Remove tables that are not needed for Hovawart Club MVP
-- Affected: public.breeds, public.branches
-- Author: System Migration
-- Date: 2025-08-06
-- Special Considerations: 
-- - These tables were created for multi-breed system
-- - Hovawart Club MVP only needs hovawarts (single breed)
-- - No branches needed for club-only system
-- =============================================================================

-- Remove breeds table (not needed for single breed system)
drop table if exists public.breeds cascade;

-- Remove branches table (not needed for club-only system)
drop table if exists public.branches cascade;

-- =============================================================================
-- Migration completed
-- =============================================================================
