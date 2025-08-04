-- Move breeds table from dictionary schema to public schema for REST API access
-- This is needed because Supabase REST API only exposes tables in the public schema by default

-- Create the breeds table in public schema
CREATE TABLE public.breeds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name_pl varchar(100) NOT NULL,
    name_en varchar(100) NOT NULL,
    fci_group dog_shows.fci_group NOT NULL,
    fci_number integer UNIQUE,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Copy data from dictionary.breeds to public.breeds
INSERT INTO public.breeds (id, name_pl, name_en, fci_group, fci_number, is_active, created_at, updated_at)
SELECT id, name_pl, name_en, fci_group, fci_number, is_active, created_at, updated_at
FROM dictionary.breeds;

-- Create indexes on public.breeds
CREATE INDEX idx_breeds_fci_group ON public.breeds(fci_group);
CREATE INDEX idx_breeds_is_active ON public.breeds(is_active);
CREATE INDEX idx_breeds_name_pl ON public.breeds(name_pl);
CREATE INDEX idx_breeds_name_en ON public.breeds(name_en);
CREATE INDEX idx_breeds_search ON public.breeds USING gin(to_tsvector('simple', name_pl || ' ' || name_en));

-- Add constraints
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'breeds_name_pl_not_empty') THEN
        ALTER TABLE public.breeds ADD CONSTRAINT breeds_name_pl_not_empty CHECK (name_pl != '');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'breeds_name_en_not_empty') THEN
        ALTER TABLE public.breeds ADD CONSTRAINT breeds_name_en_not_empty CHECK (name_en != '');
    END IF;
END $$;

-- Add comments
COMMENT ON TABLE public.breeds IS 'Dog breeds dictionary - moved from dictionary schema for REST API access';
COMMENT ON COLUMN public.breeds.id IS 'Unique identifier for the breed';
COMMENT ON COLUMN public.breeds.name_pl IS 'Breed name in Polish';
COMMENT ON COLUMN public.breeds.name_en IS 'Breed name in English';
COMMENT ON COLUMN public.breeds.fci_group IS 'FCI group classification (G1-G10)';
COMMENT ON COLUMN public.breeds.fci_number IS 'FCI breed number (optional)';
COMMENT ON COLUMN public.breeds.is_active IS 'Whether the breed is currently active';

-- Enable RLS on public.breeds
ALTER TABLE public.breeds ENABLE ROW LEVEL SECURITY;

-- Create policies for public.breeds (read-only for now)
CREATE POLICY "Allow public read access to breeds" ON public.breeds
    FOR SELECT USING (true);

-- Update foreign key references to use public.breeds instead of dictionary.breeds
-- Note: This will be done in a separate migration to avoid conflicts

-- Verification query
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_breeds,
    COUNT(DISTINCT fci_group) as fci_groups
FROM public.breeds; 
