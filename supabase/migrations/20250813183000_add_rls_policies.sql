-- =============================================================================
-- Migration: Add RLS policies for testing environment
-- =============================================================================
-- Purpose: Enable Row Level Security and add authorization policies
-- Date: 2025-08-13
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dog_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Create policies for users table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_club_board_access' AND tablename = 'users') THEN
        CREATE POLICY "users_club_board_access" ON public.users
            FOR ALL USING (
                EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hide_deleted_users' AND tablename = 'users') THEN
        CREATE POLICY "hide_deleted_users" ON public.users
            FOR SELECT USING (deleted_at IS NULL);
    END IF;
END $$;

-- Create policies for shows table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'shows_club_board_access' AND tablename = 'shows') THEN
        CREATE POLICY "shows_club_board_access" ON public.shows
            FOR ALL USING (
                EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hide_deleted_shows' AND tablename = 'shows') THEN
        CREATE POLICY "hide_deleted_shows" ON public.shows
            FOR SELECT USING (deleted_at IS NULL);
    END IF;
END $$;

-- Create policies for owners table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'owners_club_board_access' AND tablename = 'owners') THEN
        CREATE POLICY "owners_club_board_access" ON public.owners
            FOR ALL USING (
                EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hide_deleted_owners' AND tablename = 'owners') THEN
        CREATE POLICY "hide_deleted_owners" ON public.owners
            FOR SELECT USING (deleted_at IS NULL);
    END IF;
END $$;

-- Create policies for dogs table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dogs_club_board_access' AND tablename = 'dogs') THEN
        CREATE POLICY "dogs_club_board_access" ON public.dogs
            FOR ALL USING (
                EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hide_deleted_dogs' AND tablename = 'dogs') THEN
        CREATE POLICY "hide_deleted_dogs" ON public.dogs
            FOR SELECT USING (deleted_at IS NULL);
    END IF;
END $$;

-- Create policies for dog_owners table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dog_owners_club_board_access' AND tablename = 'dog_owners') THEN
        CREATE POLICY "dog_owners_club_board_access" ON public.dog_owners
            FOR ALL USING (
                EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
            );
    END IF;
END $$;

-- Create policies for show_registrations table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'registrations_club_board_access' AND tablename = 'show_registrations') THEN
        CREATE POLICY "registrations_club_board_access" ON public.show_registrations
            FOR ALL USING (
                EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
            );
    END IF;
END $$;

-- Create policies for evaluations table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'evaluations_club_board_access' AND tablename = 'evaluations') THEN
        CREATE POLICY "evaluations_club_board_access" ON public.evaluations
            FOR ALL USING (
                EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
            );
    END IF;
END $$;
