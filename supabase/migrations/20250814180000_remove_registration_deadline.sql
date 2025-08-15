-- Migration: Remove registration_deadline column from shows table
-- Date: 2025-08-14

-- Remove the constraint first
ALTER TABLE public.shows DROP CONSTRAINT IF EXISTS valid_dates;

-- Remove the registration_deadline column
ALTER TABLE public.shows DROP COLUMN IF EXISTS registration_deadline;
