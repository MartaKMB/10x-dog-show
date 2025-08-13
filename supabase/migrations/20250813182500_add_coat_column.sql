-- =============================================================================
-- Migration: Add missing coat column to dogs table
-- =============================================================================
-- Purpose: Add coat column and index for Hovawart coat colors
-- Date: 2025-08-13
-- =============================================================================

-- Add dog_coat enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'dog_coat' 
        AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        CREATE TYPE public.dog_coat AS ENUM ('czarny', 'czarny_podpalany', 'blond');
    END IF;
END $$;

-- Add coat column to dogs table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dogs' 
        AND column_name = 'coat' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.dogs ADD COLUMN coat public.dog_coat NOT NULL DEFAULT 'czarny';
    END IF;
END $$;

-- Add coat index if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_dogs_coat' 
        AND tablename = 'dogs'
    ) THEN
        CREATE INDEX idx_dogs_coat ON public.dogs(coat) WHERE (deleted_at IS NULL);
    END IF;
END $$;
