# Schemat bazy danych PostgreSQL - 10x Dog Show

## 1. Przegląd architektury

Schemat bazy danych PostgreSQL zaprojektowany dla systemu zarządzania wystawami psów zgodnie z wymaganiami PRD i notatkami z sesji planowania. Struktura wspiera:

- System FCI z grupami G1-G10 i standardowymi klasami
- Współwłasność psów (relacja M:N Dogs ↔ Owners)
- Wersjonowanie opisów z pełnym audytem
- Soft delete zgodny z RODO
- Row Level Security (RLS) dla bezpieczeństwa
- Wielojęzyczność (polski/angielski)

## 2. Struktura schematów

```sql
-- Główne schematy
CREATE SCHEMA auth;           -- Autentykacja i autoryzacja
CREATE SCHEMA dog_shows;      -- Główna logika biznesowa
CREATE SCHEMA audit;          -- Audyt i historia zmian
CREATE SCHEMA dictionary;     -- Słowniki i dane referencyjne
```

## 3. Typy wyliczeniowe (ENUMs)

```sql
-- Typy podstawowe
CREATE TYPE dog_shows.user_role AS ENUM ('department_representative', 'secretary');
CREATE TYPE dog_shows.show_type AS ENUM ('national', 'international');
CREATE TYPE dog_shows.show_status AS ENUM ('draft', 'open_for_registration', 'registration_closed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE dog_shows.dog_gender AS ENUM ('male', 'female');
CREATE TYPE dog_shows.dog_class AS ENUM ('baby', 'puppy', 'junior', 'intermediate', 'open', 'working', 'champion', 'veteran');
CREATE TYPE dog_shows.fci_group AS ENUM ('G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10');
CREATE TYPE dog_shows.language AS ENUM ('pl', 'en');

-- Typy ocen
CREATE TYPE dog_shows.evaluation_grade AS ENUM ('excellent', 'very_good', 'good', 'satisfactory', 'disqualified', 'absent');
CREATE TYPE dog_shows.baby_puppy_grade AS ENUM ('very_promising', 'promising', 'quite_promising');
CREATE TYPE dog_shows.title_type AS ENUM ('CWC', 'CACIB', 'res_CWC', 'res_CACIB');
CREATE TYPE dog_shows.placement AS ENUM ('1st', '2nd', '3rd', '4th');

-- Typy audytu
CREATE TYPE audit.action_type AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'export', 'send_email');
CREATE TYPE audit.entity_type AS ENUM ('user', 'show', 'dog', 'owner', 'description', 'evaluation', 'registration');
```

## 4. Tabele główne

### 4.1 System użytkowników (Schema: auth)

```sql
-- Użytkownicy systemu (Tabela zarządzana przez Supabase Auth)
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role dog_shows.user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    language dog_shows.language DEFAULT 'pl',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    scheduled_for_deletion BOOLEAN DEFAULT false
);

-- Sesje użytkowników
CREATE TABLE auth.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

### 4.2 Słowniki referencyjne (Schema: dictionary)

```sql
-- Rasy psów z przypisaniem do grup FCI
CREATE TABLE dictionary.breeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_pl VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    fci_group dog_shows.fci_group NOT NULL,
    fci_number INTEGER UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sędziowie i ich specjalizacje
CREATE TABLE dictionary.judges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    scheduled_for_deletion BOOLEAN DEFAULT false
);

-- Specjalizacje sędziów (M:N z grupami FCI)
CREATE TABLE dictionary.judge_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judge_id UUID NOT NULL REFERENCES dictionary.judges(id) ON DELETE CASCADE,
    fci_group dog_shows.fci_group NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(judge_id, fci_group)
);

-- Oddziały organizujące wystawy
CREATE TABLE dictionary.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    region VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.3 Główna logika biznesowa (Schema: dog_shows)

```sql
-- Wystawy
CREATE TABLE dog_shows.shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    show_type dog_shows.show_type NOT NULL,
    status dog_shows.show_status DEFAULT 'draft',
    show_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    branch_id UUID REFERENCES dictionary.branches(id),
    organizer_id UUID NOT NULL REFERENCES auth.users(id),
    max_participants INTEGER,
    description TEXT,
    entry_fee DECIMAL(10,2),
    language dog_shows.language DEFAULT 'pl',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    scheduled_for_deletion BOOLEAN DEFAULT false,

    CONSTRAINT valid_dates CHECK (registration_deadline <= show_date)
);

-- Właściciele psów (dane kontaktowe, nie użytkownicy systemu)
CREATE TABLE dog_shows.owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Poland',
    kennel_name VARCHAR(200),
    language dog_shows.language DEFAULT 'pl',
    gdpr_consent BOOLEAN DEFAULT false,
    gdpr_consent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    scheduled_for_deletion BOOLEAN DEFAULT false,

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Psy
CREATE TABLE dog_shows.dogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    breed_id UUID NOT NULL REFERENCES dictionary.breeds(id),
    gender dog_shows.dog_gender NOT NULL,
    birth_date DATE NOT NULL,
    microchip_number VARCHAR(50) UNIQUE,
    kennel_club_number VARCHAR(50) UNIQUE,
    kennel_name VARCHAR(200),
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    scheduled_for_deletion BOOLEAN DEFAULT false,

    CONSTRAINT valid_birth_date CHECK (birth_date <= CURRENT_DATE),
    CONSTRAINT valid_microchip CHECK (microchip_number ~ '^[0-9]{15}$')
);

-- Współwłasność psów (M:N Dogs ↔ Owners)
CREATE TABLE dog_shows.dog_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES dog_shows.dogs(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES dog_shows.owners(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(dog_id, owner_id)
);

-- Rejestracje psów na wystawy
CREATE TABLE dog_shows.show_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES dog_shows.shows(id) ON DELETE CASCADE,
    dog_id UUID NOT NULL REFERENCES dog_shows.dogs(id) ON DELETE CASCADE,
    dog_class dog_shows.dog_class NOT NULL,
    catalog_number INTEGER,
    registration_fee DECIMAL(10,2),
    is_paid BOOLEAN DEFAULT false,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(show_id, dog_id),
    UNIQUE(show_id, catalog_number)
);

-- Przypisania sędziów do wystaw i grup
CREATE TABLE dog_shows.show_judge_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES dog_shows.shows(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES dictionary.judges(id) ON DELETE CASCADE,
    fci_group dog_shows.fci_group NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(show_id, judge_id, fci_group)
);

-- Przypisania sekretarzy do wystaw i ras
CREATE TABLE dog_shows.secretary_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES dog_shows.shows(id) ON DELETE CASCADE,
    secretary_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    breed_id UUID NOT NULL REFERENCES dictionary.breeds(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(show_id, secretary_id, breed_id)
);

-- Opisy psów
CREATE TABLE dog_shows.descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES dog_shows.shows(id) ON DELETE CASCADE,
    dog_id UUID NOT NULL REFERENCES dog_shows.dogs(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES dictionary.judges(id) ON DELETE CASCADE,
    secretary_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_pl TEXT,
    content_en TEXT,
    version INTEGER DEFAULT 1,
    is_final BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finalized_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(show_id, dog_id, judge_id),
    CONSTRAINT content_required CHECK (content_pl IS NOT NULL OR content_en IS NOT NULL)
);

-- Wersje opisów (pełne wersjonowanie)
CREATE TABLE dog_shows.description_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description_id UUID NOT NULL REFERENCES dog_shows.descriptions(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    content_pl TEXT,
    content_en TEXT,
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(description_id, version)
);

-- Oceny psów
CREATE TABLE dog_shows.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description_id UUID NOT NULL REFERENCES dog_shows.descriptions(id) ON DELETE CASCADE,
    dog_class dog_shows.dog_class NOT NULL,
    grade dog_shows.evaluation_grade,
    baby_puppy_grade dog_shows.baby_puppy_grade,
    title dog_shows.title_type,
    placement dog_shows.placement,
    points INTEGER,
    is_best_in_group BOOLEAN DEFAULT false,
    is_best_in_show BOOLEAN DEFAULT false,
    judge_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(description_id),
    CONSTRAINT valid_grade_by_class CHECK (
        (dog_class IN ('baby', 'puppy') AND baby_puppy_grade IS NOT NULL AND grade IS NULL) OR
        (dog_class NOT IN ('baby', 'puppy') AND grade IS NOT NULL AND baby_puppy_grade IS NULL)
    )
);

-- Dokumenty PDF
CREATE TABLE dog_shows.pdf_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description_id UUID NOT NULL REFERENCES dog_shows.descriptions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    language dog_shows.language NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    sent_to_email VARCHAR(255),

    UNIQUE(description_id, language)
);
```

### 4.4 System audytu (Schema: audit)

```sql
-- Audyt krytycznych akcji
CREATE TABLE audit.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action audit.action_type NOT NULL,
    entity_type audit.entity_type NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GDPR compliance tracking
CREATE TABLE audit.gdpr_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES dog_shows.owners(id),
    request_type VARCHAR(50) NOT NULL, -- 'delete', 'export', 'withdraw_consent'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Automatyczne usuwanie danych (3-letni okres RODO)
CREATE TABLE audit.data_retention_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type audit.entity_type NOT NULL,
    entity_id UUID NOT NULL,
    retention_date DATE NOT NULL,
    deletion_scheduled_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. Indeksy wydajnościowe

```sql
-- Indeksy podstawowe
CREATE INDEX idx_users_email ON auth.users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON auth.users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_sessions_token ON auth.user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON auth.user_sessions(expires_at);

-- Indeksy dla wystaw
CREATE INDEX idx_shows_date ON dog_shows.shows(show_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_shows_status ON dog_shows.shows(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_shows_organizer ON dog_shows.shows(organizer_id) WHERE deleted_at IS NULL;

-- Indeksy dla psów
CREATE INDEX idx_dogs_breed ON dog_shows.dogs(breed_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_dogs_microchip ON dog_shows.dogs(microchip_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_dogs_kennel_number ON dog_shows.dogs(kennel_club_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_dogs_birth_date ON dog_shows.dogs(birth_date) WHERE deleted_at IS NULL;

-- Indeksy dla właścicieli
CREATE INDEX idx_owners_email ON dog_shows.owners(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_owners_gdpr_consent ON dog_shows.owners(gdpr_consent, gdpr_consent_date) WHERE deleted_at IS NULL;

-- Indeksy dla rejestracji
CREATE INDEX idx_registrations_show_dog ON dog_shows.show_registrations(show_id, dog_id);
CREATE INDEX idx_registrations_catalog ON dog_shows.show_registrations(show_id, catalog_number);
CREATE INDEX idx_registrations_class ON dog_shows.show_registrations(show_id, dog_class);

-- Indeksy dla opisów
CREATE INDEX idx_descriptions_show ON dog_shows.descriptions(show_id);
CREATE INDEX idx_descriptions_judge ON dog_shows.descriptions(judge_id);
CREATE INDEX idx_descriptions_secretary ON dog_shows.descriptions(secretary_id);
CREATE INDEX idx_descriptions_version ON dog_shows.descriptions(version);
CREATE INDEX idx_descriptions_final ON dog_shows.descriptions(is_final);

-- Indeksy kompozytowe
CREATE INDEX idx_dog_owners_dog ON dog_shows.dog_owners(dog_id);
CREATE INDEX idx_dog_owners_owner ON dog_shows.dog_owners(owner_id);
CREATE INDEX idx_judge_specializations_judge ON dictionary.judge_specializations(judge_id);
CREATE INDEX idx_secretary_assignments_show_secretary ON dog_shows.secretary_assignments(show_id, secretary_id);

-- Indeksy audytu
CREATE INDEX idx_activity_log_user ON audit.activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON audit.activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON audit.activity_log(created_at);
CREATE INDEX idx_gdpr_requests_owner ON audit.gdpr_requests(owner_id);
CREATE INDEX idx_retention_schedule_date ON audit.data_retention_schedule(retention_date);
```

## 6. Funkcje pomocnicze

```sql
-- Funkcja automatycznego generowania numerów katalogu
CREATE OR REPLACE FUNCTION dog_shows.generate_catalog_numbers(show_id_param UUID)
RETURNS VOID AS $$
DECLARE
    rec RECORD;
    counter INTEGER := 1;
BEGIN
    FOR rec IN
        SELECT sr.id, sr.dog_class, b.fci_group, d.gender
        FROM dog_shows.show_registrations sr
        JOIN dog_shows.dogs d ON sr.dog_id = d.id
        JOIN dictionary.breeds b ON d.breed_id = b.id
        WHERE sr.show_id = show_id_param
        ORDER BY b.fci_group, sr.dog_class, d.gender, sr.registered_at
    LOOP
        UPDATE dog_shows.show_registrations
        SET catalog_number = counter
        WHERE id = rec.id;
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Funkcja walidacji wieku względem klasy
CREATE OR REPLACE FUNCTION dog_shows.validate_dog_class(birth_date_param DATE, show_date_param DATE, class_param dog_shows.dog_class)
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

-- Funkcja automatycznego usuwania danych po 3 latach
CREATE OR REPLACE FUNCTION audit.schedule_data_deletion()
RETURNS VOID AS $$
BEGIN
    -- Zaplanuj usunięcie danych wystaw starszych niż 3 lata
    INSERT INTO audit.data_retention_schedule (entity_type, entity_id, retention_date)
    SELECT 'show', id, (created_at + INTERVAL '3 years')::DATE
    FROM dog_shows.shows
    WHERE deleted_at IS NULL
    AND created_at < NOW() - INTERVAL '3 years'
    AND NOT EXISTS (
        SELECT 1 FROM audit.data_retention_schedule
        WHERE entity_type = 'show' AND entity_id = dog_shows.shows.id
    );
END;
$$ LANGUAGE plpgsql;
```

## 7. Triggery

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON dog_shows.shows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON dog_shows.dogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON dog_shows.owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_descriptions_updated_at BEFORE UPDATE ON dog_shows.descriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger wersjonowania opisów
CREATE OR REPLACE FUNCTION dog_shows.create_description_version()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO dog_shows.description_versions (
            description_id, version, content_pl, content_en, changed_by, change_reason
        ) VALUES (
            NEW.id, NEW.version, NEW.content_pl, NEW.content_en,
            NEW.updated_by, 'Updated description'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger audytu
CREATE OR REPLACE FUNCTION audit.log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.activity_log (
        user_id, action, entity_type, entity_id, old_values, new_values, metadata
    ) VALUES (
        COALESCE(NEW.updated_by, OLD.updated_by),
        CASE TG_OP
            WHEN 'INSERT' THEN 'create'::audit.action_type
            WHEN 'UPDATE' THEN 'update'::audit.action_type
            WHEN 'DELETE' THEN 'delete'::audit.action_type
        END,
        TG_TABLE_NAME::audit.entity_type,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
        jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## 8. Row Level Security (RLS) Policies

```sql
-- Włączenie RLS dla tabel
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_shows.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_shows.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_shows.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_shows.descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_shows.show_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_shows.secretary_assignments ENABLE ROW LEVEL SECURITY;

-- Polityki dla użytkowników
CREATE POLICY users_view_own ON auth.users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY users_update_own ON auth.users
    FOR UPDATE USING (id = auth.uid());

-- Polityki dla przedstawicieli oddziału (pełny dostęp do swoich wystaw)
CREATE POLICY shows_department_representative ON dog_shows.shows
    FOR ALL USING (
        organizer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND role = 'department_representative')
    );

-- Polityki dla sekretarzy (dostęp tylko do przypisanych ras)
CREATE POLICY descriptions_secretary_access ON dog_shows.descriptions
    FOR ALL USING (
        secretary_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM dog_shows.secretary_assignments sa
            JOIN dog_shows.dogs d ON d.breed_id = sa.breed_id
            WHERE sa.secretary_id = auth.uid()
            AND sa.show_id = descriptions.show_id
            AND d.id = descriptions.dog_id
        )
    );

-- Polityki dla właścicieli psów (tylko własne psy)
CREATE POLICY dogs_owner_access ON dog_shows.dogs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM dog_shows.dog_owners do
            JOIN dog_shows.owners o ON do.owner_id = o.id
            WHERE do.dog_id = dogs.id
            AND o.email = auth.jwt() ->> 'email'
        )
    );

-- Polityki dla soft delete (ukrywanie usuniętych rekordów)
CREATE POLICY hide_deleted_users ON auth.users
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY hide_deleted_shows ON dog_shows.shows
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY hide_deleted_dogs ON dog_shows.dogs
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY hide_deleted_owners ON dog_shows.owners
    FOR SELECT USING (deleted_at IS NULL);
```

## 9. Widoki (Views)

```sql
-- Widok aktywnych psów z danymi właścicieli
CREATE VIEW dog_shows.active_dogs_with_owners AS
SELECT
    d.id,
    d.name,
    d.gender,
    d.birth_date,
    d.microchip_number,
    d.kennel_club_number,
    b.name_pl as breed_name_pl,
    b.name_en as breed_name_en,
    b.fci_group,
    array_agg(
        json_build_object(
            'id', o.id,
            'name', o.first_name || ' ' || o.last_name,
            'email', o.email,
            'is_primary', do.is_primary
        )
    ) as owners
FROM dog_shows.dogs d
JOIN dictionary.breeds b ON d.breed_id = b.id
JOIN dog_shows.dog_owners do ON d.id = do.dog_id
JOIN dog_shows.owners o ON do.owner_id = o.id
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.name, d.gender, d.birth_date, d.microchip_number, d.kennel_club_number, b.name_pl, b.name_en, b.fci_group;

-- Widok pełnych informacji o wystawach
CREATE VIEW dog_shows.show_details AS
SELECT
    s.id,
    s.name,
    s.show_type,
    s.status,
    s.show_date,
    s.registration_deadline,
    b.name as branch_name,
    b.region as branch_region,
    u.first_name || ' ' || u.last_name as organizer_name,
    COUNT(sr.id) as registered_dogs,
    s.max_participants,
    s.language
FROM dog_shows.shows s
LEFT JOIN dictionary.branches b ON s.branch_id = b.id
LEFT JOIN auth.users u ON s.organizer_id = u.id
LEFT JOIN dog_shows.show_registrations sr ON s.id = sr.show_id
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.name, s.show_type, s.status, s.show_date, s.registration_deadline, b.name, b.region, u.first_name, u.last_name, s.max_participants, s.language;

-- Widok opisów z pełnymi informacjami
CREATE VIEW dog_shows.description_details AS
SELECT
    d.id,
    d.show_id,
    s.name as show_name,
    d.dog_id,
    dog.name as dog_name,
    b.name_pl as breed_name_pl,
    b.name_en as breed_name_en,
    d.judge_id,
    j.first_name || ' ' || j.last_name as judge_name,
    d.secretary_id,
    u.first_name || ' ' || u.last_name as secretary_name,
    d.content_pl,
    d.content_en,
    d.version,
    d.is_final,
    d.created_at,
    d.updated_at,
    e.grade,
    e.baby_puppy_grade,
    e.title,
    e.placement,
    e.points
FROM dog_shows.descriptions d
JOIN dog_shows.shows s ON d.show_id = s.id
JOIN dog_shows.dogs dog ON d.dog_id = dog.id
JOIN dictionary.breeds b ON dog.breed_id = b.id
JOIN dictionary.judges j ON d.judge_id = j.id
JOIN auth.users u ON d.secretary_id = u.id
LEFT JOIN dog_shows.evaluations e ON d.id = e.description_id
WHERE s.deleted_at IS NULL AND dog.deleted_at IS NULL;
```

## 10. Dane podstawowe (Seeds)

```sql
-- Podstawowe dane słownikowe
INSERT INTO dictionary.breeds (name_pl, name_en, fci_group, fci_number) VALUES
('Owczarek niemiecki', 'German Shepherd Dog', 'G1', 166),
('Labrador retriever', 'Labrador Retriever', 'G8', 122),
('Golden retriever', 'Golden Retriever', 'G8', 111),
('Buldog francuski', 'French Bulldog', 'G9', 101),
('Rottweiler', 'Rottweiler', 'G2', 147);

-- Przykładowe oddziały
INSERT INTO dictionary.branches (name, address, city, postal_code, region) VALUES
('Oddział Warszawa', 'ul. Marszałkowska 1', 'Warszawa', '00-001', 'Mazowieckie'),
('Oddział Katowice', 'ul. Mariacka 15', 'Katowice', '40-001', 'Śląskie'),
('Oddział Kraków', 'ul. Floriańska 5', 'Kraków', '31-019', 'Małopolskie');

-- Domyślny użytkownik admin
INSERT INTO auth.users (email, password_hash, first_name, last_name, role) VALUES
('admin@dogshow.pl', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvYPcGvIjZxNe5.', 'Admin', 'System', 'department_representative');
```

## 11. Uwagi projektowe

### Bezpieczeństwo:

- Wszystkie klucze główne to UUID dla zwiększenia bezpieczeństwa
- Implementacja RLS zapewnia izolację danych między użytkownikami
- Soft delete z opcją oznaczania do usunięcia zgodnie z RODO
- Audyt wszystkich krytycznych operacji
- Walidacja danych na poziomie bazy danych

### Wydajność:

- Indeksy zoptymalizowane pod częste zapytania
- Kompozytowe indeksy dla złożonych filtrów
- Partycjonowanie możliwe dla dużych tabel (descriptions, activity_log)
- Widoki materialized dla raportów (w przyszłości)

### Skalowalność:

- Schemat pozwala na łatwe dodawanie nowych funkcjonalności
- Struktura wspiera wielojęzyczność
- Możliwość rozszerzenia o nowe typy wystaw i klasy
- Elastyczna struktura audytu

### Zgodność z RODO:

- Mechanizm automatycznego usuwania danych po 3 latach
- Śledzenie zgód GDPR
- Możliwość eksportu i usuwania danych użytkowników
- Audyt dostępu do danych osobowych

Ten schemat zapewnia solidną podstawę dla aplikacji 10x Dog Show, spełniając wszystkie wymagania funkcjonalne i niefunkcjonalne określone w PRD i notatkach z sesji planowania.
