# Schemat bazy danych PostgreSQL - Klub Hovawarta Show (MVP)

## 1. Przegląd architektury

Uproszczony schemat bazy danych PostgreSQL zaprojektowany dla systemu zarządzania wystawami klubowymi hovawartów zgodnie z wymaganiami PRD. Struktura wspiera:

- System zarządzania wystawami klubowymi hovawartów
- CRUD operacje na psach, właścicielach i ocenach
- Standardowe oceny FCI w języku polskim
- Tytuły klubowe hovawartów
- Jedna rola użytkownika (zarząd klubu)
- Soft delete zgodny z RODO
- Row Level Security (RLS) dla bezpieczeństwa

## 2. Typy wyliczeniowe (ENUMs)

```sql
-- Typy podstawowe
CREATE TYPE public.user_role AS ENUM ('club_board');
CREATE TYPE public.show_status AS ENUM ('draft', 'open_for_registration', 'registration_closed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.dog_gender AS ENUM ('male', 'female');
CREATE TYPE public.dog_class AS ENUM ('baby', 'puppy', 'junior', 'intermediate', 'open', 'working', 'champion', 'veteran');

-- Typy ocen FCI w języku polskim
CREATE TYPE public.evaluation_grade AS ENUM ('doskonała', 'bardzo_dobra', 'dobra', 'zadowalająca', 'zdyskwalifikowana', 'nieobecna');
CREATE TYPE public.baby_puppy_grade AS ENUM ('bardzo_obiecujący', 'obiecujący', 'dość_obiecujący');

-- Tytuły klubowe hovawartów
CREATE TYPE public.club_title AS ENUM (
    'młodzieżowy_zwycięzca_klubu',
    'zwycięzca_klubu',
    'zwycięzca_klubu_weteranów',
    'najlepszy_reproduktor',
    'najlepsza_suka_hodowlana',
    'najlepsza_para',
    'najlepsza_hodowla',
    'zwycięzca_rasy',
    'zwycięzca_płci_przeciwnej',
    'najlepszy_junior',
    'najlepszy_weteran'
);

CREATE TYPE public.placement AS ENUM ('1st', '2nd', '3rd', '4th');
```

## 3. Tabele główne

### 3.1 System użytkowników

```sql
-- Użytkownicy systemu (zarząd klubu)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role public.user_role NOT NULL DEFAULT 'club_board',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE public.users IS 'Użytkownicy systemu - członkowie zarządu klubu hovawarta';
```

### 3.2 Wystawy klubowe

```sql
-- Wystawy klubowe hovawartów
CREATE TABLE public.shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    status public.show_status DEFAULT 'draft',
    show_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    location VARCHAR(200) NOT NULL,
    judge_name VARCHAR(200) NOT NULL,
    description TEXT,
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,

    CONSTRAINT valid_dates CHECK (registration_deadline <= show_date),
    CONSTRAINT valid_show_date CHECK (show_date >= CURRENT_DATE - INTERVAL '10 years')
);

COMMENT ON TABLE public.shows IS 'Wystawy klubowe hovawartów organizowane przez klub';
```

### 3.3 Właściciele psów

```sql
-- Właściciele psów (dane kontaktowe)
CREATE TABLE public.owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    kennel_name VARCHAR(200),
    gdpr_consent BOOLEAN DEFAULT false,
    gdpr_consent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE public.owners IS 'Właściciele psów hovawart - dane kontaktowe';
```

### 3.4 Psy hovawart

```sql
-- Psy hovawart
CREATE TABLE public.dogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    gender public.dog_gender NOT NULL,
    birth_date DATE NOT NULL,
    microchip_number VARCHAR(50) UNIQUE,
    kennel_name VARCHAR(200),
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,

    CONSTRAINT valid_birth_date CHECK (birth_date <= CURRENT_DATE),
    CONSTRAINT valid_microchip CHECK (microchip_number ~ '^[0-9]{15}$' OR microchip_number IS NULL)
);

COMMENT ON TABLE public.dogs IS 'Psy rasy hovawart zarejestrowane w systemie';
```

### 3.5 Rejestracje psów na wystawy

```sql
-- Rejestracje psów na wystawy
CREATE TABLE public.show_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    dog_class public.dog_class NOT NULL,
    catalog_number INTEGER,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(show_id, dog_id),
    UNIQUE(show_id, catalog_number)
);

COMMENT ON TABLE public.show_registrations IS 'Rejestracje psów na konkretne wystawy klubowe';
```

### 3.6 Oceny psów

```sql
-- Oceny psów z wystaw
CREATE TABLE public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
    dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
    dog_class public.dog_class NOT NULL,
    grade public.evaluation_grade,
    baby_puppy_grade public.baby_puppy_grade,
    club_title public.club_title,
    placement public.placement,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(show_id, dog_id),
    CONSTRAINT valid_grade_by_class CHECK (
        (dog_class IN ('baby', 'puppy') AND baby_puppy_grade IS NOT NULL AND grade IS NULL) OR
        (dog_class NOT IN ('baby', 'puppy') AND grade IS NOT NULL AND baby_puppy_grade IS NULL)
    )
);

COMMENT ON TABLE public.evaluations IS 'Oceny psów z wystaw klubowych z tytułami klubowymi';
```

## 4. Indeksy wydajnościowe

```sql
-- Indeksy podstawowe
CREATE INDEX idx_users_email ON public.users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON public.users(role) WHERE deleted_at IS NULL;

-- Indeksy dla wystaw
CREATE INDEX idx_shows_date ON public.shows(show_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_shows_status ON public.shows(status) WHERE deleted_at IS NULL;

-- Indeksy dla psów
CREATE INDEX idx_dogs_microchip ON public.dogs(microchip_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_dogs_birth_date ON public.dogs(birth_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_dogs_gender ON public.dogs(gender) WHERE deleted_at IS NULL;

-- Indeksy dla właścicieli
CREATE INDEX idx_owners_email ON public.owners(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_owners_gdpr_consent ON public.owners(gdpr_consent, gdpr_consent_date) WHERE deleted_at IS NULL;

-- Indeksy dla rejestracji
CREATE INDEX idx_registrations_show_dog ON public.show_registrations(show_id, dog_id);
CREATE INDEX idx_registrations_catalog ON public.show_registrations(show_id, catalog_number);
CREATE INDEX idx_registrations_class ON public.show_registrations(show_id, dog_class);

-- Indeksy dla ocen
CREATE INDEX idx_evaluations_show ON public.evaluations(show_id);
CREATE INDEX idx_evaluations_dog ON public.evaluations(dog_id);
CREATE INDEX idx_evaluations_grade ON public.evaluations(grade);
CREATE INDEX idx_evaluations_club_title ON public.evaluations(club_title);

-- Indeksy kompozytowe
CREATE INDEX idx_dog_owners_dog ON public.dog_owners(dog_id);
CREATE INDEX idx_dog_owners_owner ON public.dog_owners(owner_id);
CREATE INDEX idx_dog_owners_primary ON public.dog_owners(owner_id, is_primary) WHERE is_primary = true;
```

## 5. Funkcje pomocnicze

```sql
-- Funkcja automatycznego generowania numerów katalogu
CREATE OR REPLACE FUNCTION public.generate_catalog_numbers(show_id_param UUID)
RETURNS VOID AS $$
DECLARE
    rec RECORD;
    counter INTEGER := 1;
BEGIN
    FOR rec IN
        SELECT sr.id, sr.dog_class, d.gender
        FROM public.show_registrations sr
        JOIN public.dogs d ON sr.dog_id = d.id
        WHERE sr.show_id = show_id_param
        ORDER BY sr.dog_class, d.gender, sr.registered_at
    LOOP
        UPDATE public.show_registrations
        SET catalog_number = counter
        WHERE id = rec.id;
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Funkcja walidacji wieku względem klasy
CREATE OR REPLACE FUNCTION public.validate_dog_class(birth_date_param DATE, show_date_param DATE, class_param public.dog_class)
RETURNS BOOLEAN AS $$
DECLARE
    age_months INTEGER;
BEGIN
    age_months := EXTRACT(MONTH FROM AGE(show_date_param, birth_date_param)) +
                  EXTRACT(YEAR FROM AGE(show_date_param, birth_date_param)) * 12;

    RETURN CASE
        WHEN class_param = 'baby' THEN age_months BETWEEN 4 AND 6
        WHEN class_param = 'puppy' THEN age_months BETWEEN 6 AND 9
        WHEN class_param = 'junior' THEN age_months BETWEEN 9 AND 18
        WHEN class_param = 'intermediate' THEN age_months BETWEEN 15 AND 24
        WHEN class_param = 'open' THEN age_months >= 15
        WHEN class_param = 'working' THEN age_months >= 15
        WHEN class_param = 'champion' THEN age_months >= 15
        WHEN class_param = 'veteran' THEN age_months >= 96
        ELSE false
    END;
END;
$$ LANGUAGE plpgsql;

-- Funkcja automatycznego usuwania danych po 3 latach (RODO)
CREATE OR REPLACE FUNCTION public.schedule_data_deletion()
RETURNS VOID AS $$
BEGIN
    -- Oznacz wystawy starsze niż 3 lata do usunięcia
    UPDATE public.shows
    SET deleted_at = NOW()
    WHERE deleted_at IS NULL
    AND show_date < CURRENT_DATE - INTERVAL '3 years';

    -- Oznacz oceny z wystaw starszych niż 3 lata do usunięcia
    UPDATE public.evaluations
    SET deleted_at = NOW()
    WHERE deleted_at IS NULL
    AND show_id IN (
        SELECT id FROM public.shows
        WHERE show_date < CURRENT_DATE - INTERVAL '3 years'
    );
END;
$$ LANGUAGE plpgsql;
```

## 6. Triggery

```sql
-- Trigger aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Zastosowanie triggerów updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON public.shows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON public.dogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON public.owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON public.evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 7. Row Level Security (RLS) Policies

```sql
-- Włączenie RLS dla tabel
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Polityki dla użytkowników (zarząd klubu ma pełny dostęp)
CREATE POLICY users_club_board_access ON public.users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
    );

-- Polityki dla wystaw (zarząd klubu ma pełny dostęp)
CREATE POLICY shows_club_board_access ON public.shows
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
    );

-- Polityki dla psów (zarząd klubu ma pełny dostęp)
CREATE POLICY dogs_club_board_access ON public.dogs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
    );

-- Polityki dla właścicieli (zarząd klubu ma pełny dostęp)
CREATE POLICY owners_club_board_access ON public.owners
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
    );

-- Polityki dla rejestracji (zarząd klubu ma pełny dostęp)
CREATE POLICY registrations_club_board_access ON public.show_registrations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
    );

-- Polityki dla ocen (zarząd klubu ma pełny dostęp)
CREATE POLICY evaluations_club_board_access ON public.evaluations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'club_board')
    );

-- Polityki dla soft delete (ukrywanie usuniętych rekordów)
CREATE POLICY hide_deleted_users ON public.users
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY hide_deleted_shows ON public.shows
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY hide_deleted_dogs ON public.dogs
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY hide_deleted_owners ON public.owners
    FOR SELECT USING (deleted_at IS NULL);
```

## 8. Widoki (Views)

```sql
-- Widok psów z danymi właścicieli
CREATE VIEW public.dogs_with_owners AS
SELECT
    d.id,
    d.name,
    d.gender,
    d.birth_date,
    d.microchip_number,
    d.kennel_name,
    d.father_name,
    d.mother_name,
    array_agg(
        json_build_object(
            'id', o.id,
            'name', o.first_name || ' ' || o.last_name,
            'email', o.email,
            'phone', o.phone,
            'kennel_name', o.kennel_name,
            'is_primary', do.is_primary
        )
    ) as owners
FROM public.dogs d
JOIN public.dog_owners do ON d.id = do.dog_id
JOIN public.owners o ON do.owner_id = o.id
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.name, d.gender, d.birth_date, d.microchip_number, d.kennel_name, d.father_name, d.mother_name;

-- Widok pełnych informacji o wystawach
CREATE VIEW public.show_details AS
SELECT
    s.id,
    s.name,
    s.status,
    s.show_date,
    s.registration_deadline,
    s.location,
    s.judge_name,
    s.description,
    s.max_participants,
    COUNT(sr.id) as registered_dogs,
    COUNT(e.id) as evaluated_dogs
FROM public.shows s
LEFT JOIN public.show_registrations sr ON s.id = sr.show_id
LEFT JOIN public.evaluations e ON s.id = e.show_id
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.name, s.status, s.show_date, s.registration_deadline, s.location, s.judge_name, s.description, s.max_participants;

-- Widok ocen z pełnymi informacjami
CREATE VIEW public.evaluation_details AS
SELECT
    e.id,
    e.show_id,
    s.name as show_name,
    s.show_date,
    e.dog_id,
    d.name as dog_name,
    d.gender,
    d.birth_date,
    e.dog_class,
    e.grade,
    e.baby_puppy_grade,
    e.club_title,
    e.placement,
    e.created_at,
    array_agg(
        json_build_object(
            'id', o.id,
            'name', o.first_name || ' ' || o.last_name,
            'email', o.email,
            'is_primary', do.is_primary
        )
    ) as owners
FROM public.evaluations e
JOIN public.shows s ON e.show_id = s.id
JOIN public.dogs d ON e.dog_id = d.id
JOIN public.dog_owners do ON d.id = do.dog_id
JOIN public.owners o ON do.owner_id = o.id
WHERE s.deleted_at IS NULL AND d.deleted_at IS NULL
GROUP BY e.id, e.show_id, s.name, s.show_date, e.dog_id, d.name, d.gender, d.birth_date, e.dog_class, e.grade, e.baby_puppy_grade, e.club_title, e.placement, e.created_at;
```

## 9. Dane podstawowe (Seeds)

```sql
-- Domyślny użytkownik admin (zarząd klubu)
INSERT INTO public.users (email, password_hash, first_name, last_name, role) VALUES
('admin@klub-hovawarta.pl', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvYPcGvIjZxNe5.', 'Admin', 'Klubu Hovawarta', 'club_board');

-- Przykładowe psy hovawart
INSERT INTO public.dogs (name, gender, birth_date, microchip_number, kennel_name) VALUES
('Hovawart z Przykładu', 'male', '2020-03-15', '123456789012345', 'Hodowla Przykładowa'),
('Hovawartka z Przykładu', 'female', '2019-07-22', '987654321098765', 'Hodowla Przykładowa');

-- Przykładowy właściciel
INSERT INTO public.owners (first_name, last_name, email, phone, address, city, postal_code, kennel_name, gdpr_consent, gdpr_consent_date) VALUES
('Jan', 'Kowalski', 'jan.kowalski@example.com', '+48123456789', 'ul. Przykładowa 1', 'Warszawa', '00-001', 'Hodowla Przykładowa', true, NOW());

-- Przykładowa wystawa
INSERT INTO public.shows (name, status, show_date, registration_deadline, location, judge_name, description) VALUES
('Wystawa Klubowa Hovawartów 2024', 'draft', '2024-06-15', '2024-06-01', 'Warszawa, ul. Wystawowa 1', 'dr Jan Sędzia', 'Doroczna wystawa klubowa hovawartów');
```

## 10. Relacje między tabelami

### Relacje jeden-do-wielu:

- `users` → `shows` (organizator wystawy)
- `shows` → `show_registrations` (rejestracje na wystawę)
- `shows` → `evaluations` (oceny z wystawy)
- `dogs` → `show_registrations` (rejestracje psa)
- `dogs` → `evaluations` (oceny psa)
- `owners` → `dog_owners` (własność psów)

### Relacje wiele-do-wielu:

- `dogs` ↔ `owners` (przez tabelę `dog_owners`)

### Relacje jeden-do-jednego:

- `show_registrations` → `evaluations` (jedna ocena na rejestrację)

## 11. Uwagi projektowe

### Bezpieczeństwo:

- Wszystkie klucze główne to UUID dla zwiększenia bezpieczeństwa
- Implementacja RLS zapewnia dostęp tylko dla zarządu klubu
- Soft delete z automatycznym usuwaniem po 3 latach zgodnie z RODO
- Walidacja danych na poziomie bazy danych

### Wydajność:

- Indeksy zoptymalizowane pod częste zapytania (wystawy, psy, oceny)
- Kompozytowe indeksy dla złożonych filtrów
- Widoki dla często używanych zapytań

### Skalowalność:

- Schemat pozwala na łatwe dodawanie nowych funkcjonalności
- Struktura wspiera rozszerzenie o opisy psów w przyszłości
- Możliwość dodania nowych tytułów klubowych

### Zgodność z RODO:

- Mechanizm automatycznego usuwania danych po 3 latach
- Śledzenie zgód GDPR
- Soft delete z możliwością odzyskania danych

### Uproszczenia dla MVP:

- Usunięto system FCI grup (tylko hovawarty)
- Usunięto wielojęzyczność (tylko polski)
- Usunięto opisy psów (będą dodane w fazie 2)
- Usunięto system sekretarzy (jedna rola - zarząd)
- Usunięto oddziały (wszystkie wystawy klubowe)

Ten schemat zapewnia solidną podstawę dla MVP aplikacji Klub Hovawarta Show, spełniając wszystkie wymagania funkcjonalne określone w PRD przy zachowaniu prostoty i możliwości rozbudowy w przyszłości.
