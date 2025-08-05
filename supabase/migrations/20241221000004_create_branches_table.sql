-- Create branches table in public schema for REST API access
-- This is needed because Supabase REST API only exposes tables in the public schema by default

-- Create the branches table in public schema
CREATE TABLE public.branches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(200) NOT NULL,
    address text,
    city varchar(100),
    postal_code varchar(20),
    region varchar(100) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes on public.branches
CREATE INDEX idx_branches_region ON public.branches(region);
CREATE INDEX idx_branches_is_active ON public.branches(is_active);
CREATE INDEX idx_branches_name ON public.branches(name);
CREATE INDEX idx_branches_city ON public.branches(city);

-- Add constraints
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'branches_name_not_empty') THEN
        ALTER TABLE public.branches ADD CONSTRAINT branches_name_not_empty CHECK (name != '');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'branches_region_not_empty') THEN
        ALTER TABLE public.branches ADD CONSTRAINT branches_region_not_empty CHECK (region != '');
    END IF;
END $$;

-- Add comments
COMMENT ON TABLE public.branches IS 'Dog show organization branches - for REST API access';
COMMENT ON COLUMN public.branches.id IS 'Unique identifier for the branch';
COMMENT ON COLUMN public.branches.name IS 'Branch name';
COMMENT ON COLUMN public.branches.address IS 'Branch address (optional)';
COMMENT ON COLUMN public.branches.city IS 'Branch city (optional)';
COMMENT ON COLUMN public.branches.postal_code IS 'Branch postal code (optional)';
COMMENT ON COLUMN public.branches.region IS 'Branch region';
COMMENT ON COLUMN public.branches.is_active IS 'Whether the branch is active';

-- Insert sample data
INSERT INTO public.branches (name, address, city, postal_code, region, is_active) VALUES
('Oddział Warszawa', 'ul. Marszałkowska 1', 'Warszawa', '00-001', 'Mazowieckie', true),
('Oddział Kraków', 'ul. Floriańska 15', 'Kraków', '31-019', 'Małopolskie', true),
('Oddział Poznań', 'ul. Św. Marcin 80', 'Poznań', '61-809', 'Wielkopolskie', true),
('Oddział Wrocław', 'ul. Rynek 1', 'Wrocław', '50-101', 'Dolnośląskie', true),
('Oddział Gdańsk', 'ul. Długi Targ 1', 'Gdańsk', '80-828', 'Pomorskie', true),
('Oddział Łódź', 'ul. Piotrkowska 104', 'Łódź', '90-926', 'Łódzkie', true),
('Oddział Katowice', 'ul. Mariacka 5', 'Katowice', '40-001', 'Śląskie', true),
('Oddział Lublin', 'ul. Krakowskie Przedmieście 1', 'Lublin', '20-002', 'Lubelskie', true),
('Oddział Białystok', 'ul. Lipowa 1', 'Białystok', '15-427', 'Podlaskie', true),
('Oddział Rzeszów', 'ul. 3 Maja 13', 'Rzeszów', '35-030', 'Podkarpackie', true);

-- Add updated_at trigger
CREATE TRIGGER update_branches_updated_at 
    BEFORE UPDATE ON public.branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
