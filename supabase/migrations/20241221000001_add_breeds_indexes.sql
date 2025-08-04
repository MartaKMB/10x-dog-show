-- =============================================================================
-- Migration: Add Breeds Indexes
-- =============================================================================
-- Purpose: Add performance indexes for dictionary.breeds table
-- Date: 2024-12-21
-- =============================================================================

-- =============================================================================
-- 1. ADD PERFORMANCE INDEXES
-- =============================================================================

-- Indeks dla filtrowania po grupie FCI (najczęściej używany filtr)
CREATE INDEX IF NOT EXISTS idx_breeds_fci_group 
ON dictionary.breeds(fci_group) 
WHERE is_active = true;

-- Indeks złożony dla częstych zapytań (is_active + fci_group)
CREATE INDEX IF NOT EXISTS idx_breeds_active_group 
ON dictionary.breeds(is_active, fci_group);

-- Indeks dla wyszukiwania w nazwach (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_breeds_name_pl_search 
ON dictionary.breeds USING gin(to_tsvector('simple', name_pl)) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_breeds_name_en_search 
ON dictionary.breeds USING gin(to_tsvector('simple', name_en)) 
WHERE is_active = true;

-- Indeks dla numerów FCI (dla wyszukiwania po numerze)
CREATE INDEX IF NOT EXISTS idx_breeds_fci_number 
ON dictionary.breeds(fci_number) 
WHERE fci_number IS NOT NULL;

-- Indeks dla sortowania po nazwie
CREATE INDEX IF NOT EXISTS idx_breeds_name_pl_sort 
ON dictionary.breeds(name_pl) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_breeds_name_en_sort 
ON dictionary.breeds(name_en) 
WHERE is_active = true;

-- Indeks dla sortowania po dacie aktualizacji
CREATE INDEX IF NOT EXISTS idx_breeds_updated_at 
ON dictionary.breeds(updated_at DESC) 
WHERE is_active = true;

-- =============================================================================
-- 2. ADD TABLE AND COLUMN COMMENTS
-- =============================================================================

-- Komentarz do tabeli
COMMENT ON TABLE dictionary.breeds IS 'Słownik ras psów uznanych przez FCI z klasyfikacją grup G1-G10. Zawiera wszystkie oficjalnie uznane rasy psów z numerami FCI i nazwami w języku polskim i angielskim.';

-- Komentarze do kolumn
COMMENT ON COLUMN dictionary.breeds.id IS 'Unikalny identyfikator UUID rasy';
COMMENT ON COLUMN dictionary.breeds.name_pl IS 'Nazwa rasy w języku polskim';
COMMENT ON COLUMN dictionary.breeds.name_en IS 'Nazwa rasy w języku angielskim';
COMMENT ON COLUMN dictionary.breeds.fci_group IS 'Grupa FCI (G1-G10) - klasyfikacja ras według FCI';
COMMENT ON COLUMN dictionary.breeds.fci_number IS 'Oficjalny numer FCI rasy (opcjonalny, unikalny)';
COMMENT ON COLUMN dictionary.breeds.is_active IS 'Status aktywności rasy (true = aktywna, false = nieaktywna)';
COMMENT ON COLUMN dictionary.breeds.created_at IS 'Data utworzenia rekordu';
COMMENT ON COLUMN dictionary.breeds.updated_at IS 'Data ostatniej aktualizacji rekordu';

-- =============================================================================
-- 3. ADD CONSTRAINTS FOR DATA INTEGRITY
-- =============================================================================

-- Sprawdzenie długości nazw (maksymalnie 100 znaków)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_name_pl_length') THEN
        ALTER TABLE dictionary.breeds ADD CONSTRAINT check_name_pl_length CHECK (char_length(name_pl) <= 100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_name_en_length') THEN
        ALTER TABLE dictionary.breeds ADD CONSTRAINT check_name_en_length CHECK (char_length(name_en) <= 100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_name_pl_not_empty') THEN
        ALTER TABLE dictionary.breeds ADD CONSTRAINT check_name_pl_not_empty CHECK (trim(name_pl) != '');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_name_en_not_empty') THEN
        ALTER TABLE dictionary.breeds ADD CONSTRAINT check_name_en_not_empty CHECK (trim(name_en) != '');
    END IF;
END $$;

-- =============================================================================
-- 4. VERIFICATION QUERIES
-- =============================================================================

-- Sprawdzenie czy indeksy zostały utworzone
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'breeds' 
AND schemaname = 'dictionary'
ORDER BY indexname;

-- Sprawdzenie planów wykonania dla typowych zapytań
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM dictionary.breeds 
WHERE fci_group = 'G1' AND is_active = true 
ORDER BY name_pl 
LIMIT 10;

EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM dictionary.breeds 
WHERE is_active = true 
AND (name_pl ILIKE '%labrador%' OR name_en ILIKE '%labrador%')
ORDER BY name_pl;

-- Sprawdzenie statystyk indeksów
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan as index_scans,
--     idx_tup_read as tuples_read,
--     idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes 
-- WHERE tablename = 'breeds' 
-- AND schemaname = 'dictionary'
-- ORDER BY idx_scan DESC; 
