-- =============================================================================
-- Schema: Public Read Access Policies
-- =============================================================================
-- Purpose: Allow public read access to shows and dogs for unauthenticated users
-- Date: 2025-01-XX
-- =============================================================================

-- Enable RLS on tables if not already enabled
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies for public read access
DROP POLICY IF EXISTS "shows_club_board_access" ON public.shows;
DROP POLICY IF EXISTS "dogs_club_board_access" ON public.dogs;
DROP POLICY IF EXISTS "owners_club_board_access" ON public.owners;

-- Create new policies that allow public read access but restrict write operations

-- Shows table: Public read, authenticated club_board write
CREATE POLICY "shows_public_read_club_write" ON public.shows
    FOR SELECT USING (true); -- Allow everyone to read shows

CREATE POLICY "shows_club_board_write" ON public.shows
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
    );

-- Dogs table: Public read, authenticated club_board write
CREATE POLICY "dogs_public_read_club_write" ON public.dogs
    FOR SELECT USING (true); -- Allow everyone to read dogs

CREATE POLICY "dogs_club_board_write" ON public.dogs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
    );

-- Owners table: Public read, authenticated club_board write
CREATE POLICY "owners_public_read_club_write" ON public.owners
    FOR SELECT USING (true); -- Allow everyone to read owners

CREATE POLICY "owners_club_board_write" ON public.owners
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
    );

-- Note: hide_deleted_* policies are already created in previous migrations
-- so we don't need to recreate them here

-- Grant necessary permissions for public read access
GRANT SELECT ON public.shows TO anon, authenticated;
GRANT SELECT ON public.dogs TO anon, authenticated;
GRANT SELECT ON public.owners TO anon, authenticated;

-- Grant usage on schema for public access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
