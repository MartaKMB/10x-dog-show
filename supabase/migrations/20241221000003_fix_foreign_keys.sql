-- Fix foreign key constraints after moving breeds table to public schema
-- This migration updates all foreign key references from dictionary.breeds to public.breeds

-- Drop existing foreign key constraints
ALTER TABLE dog_shows.dogs DROP CONSTRAINT IF EXISTS dogs_breed_id_fkey;
ALTER TABLE dog_shows.secretary_assignments DROP CONSTRAINT IF EXISTS secretary_assignments_breed_id_fkey;

-- Add new foreign key constraints pointing to public.breeds
ALTER TABLE dog_shows.dogs 
ADD CONSTRAINT dogs_breed_id_fkey 
FOREIGN KEY (breed_id) REFERENCES public.breeds(id) ON DELETE RESTRICT;

ALTER TABLE dog_shows.secretary_assignments 
ADD CONSTRAINT secretary_assignments_breed_id_fkey 
FOREIGN KEY (breed_id) REFERENCES public.breeds(id) ON DELETE CASCADE;

-- Verification
SELECT 
    'Foreign key constraints updated successfully' as status,
    COUNT(*) as total_breeds_in_public
FROM public.breeds; 
