-- =============================================================================
-- Migration: Create Hovawart Club Show MVP Database
-- =============================================================================
-- Purpose: Create simplified database schema for Hovawart Club Show MVP
-- Affected: Creates all tables, enums, functions, triggers, and RLS policies
-- Author: System Migration
-- Date: 2024-12-21
-- Special Considerations: 
-- - Single breed system (Hovawart only)
-- - Polish language only
-- - Single user role (club_board)
-- - Club shows only (no international/national)
-- - Simplified structure for MVP
-- =============================================================================

-- =============================================================================
-- 1. CREATE NEW SIMPLIFIED ENUMS
-- =============================================================================

-- simplified user role (only club board)
create type public.user_role as enum ('club_board');

-- show statuses (simplified for Hovawart MVP)
create type public.show_status as enum ('draft', 'completed');

-- dog gender
create type public.dog_gender as enum ('male', 'female');

-- dog classes
create type public.dog_class as enum ('baby', 'puppy', 'junior', 'intermediate', 'open', 'working', 'champion', 'veteran');

-- dog coat colors (maści hovawarta)
create type public.dog_coat as enum ('czarny', 'czarny_podpalany', 'blond');

-- evaluation grades in polish
create type public.evaluation_grade as enum ('doskonała', 'bardzo_dobra', 'dobra', 'zadowalająca', 'zdyskwalifikowana', 'nieobecna');

-- baby/puppy grades in polish
create type public.baby_puppy_grade as enum ('bardzo_obiecujący', 'obiecujący', 'dość_obiecujący');

-- hovawart club titles
create type public.club_title as enum (
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

-- placement
create type public.placement as enum ('1st', '2nd', '3rd', '4th');

-- =============================================================================
-- 2. CREATE SIMPLIFIED TABLES
-- =============================================================================

-- users table (club board members)
create table public.users (
    id uuid primary key default gen_random_uuid(),
    email varchar(255) unique not null,
    password_hash varchar(255) not null,
    first_name varchar(100) not null,
    last_name varchar(100) not null,
    role public.user_role not null default 'club_board',
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone null,
    
    constraint valid_email check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

comment on table public.users is 'Użytkownicy systemu - członkowie zarządu klubu hovawarta';

-- shows table (simplified)
create table public.shows (
    id uuid primary key default gen_random_uuid(),
    name varchar(200) not null,
    status public.show_status default 'draft',
    show_date date not null,
    registration_deadline date not null,
    location varchar(200) not null,
    judge_name varchar(200) not null,
    description text,
    max_participants integer,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone null,
    
    constraint valid_dates check (registration_deadline <= show_date),
    constraint valid_show_date check (show_date >= current_date - interval '10 years')
);

comment on table public.shows is 'Wystawy klubowe hovawartów organizowane przez klub';

-- owners table (simplified)
create table public.owners (
    id uuid primary key default gen_random_uuid(),
    first_name varchar(100) not null,
    last_name varchar(100) not null,
    email varchar(255) not null,
    phone varchar(20),
    address text not null,
    city varchar(100) not null,
    postal_code varchar(20),
    kennel_name varchar(200),
    gdpr_consent boolean default false,
    gdpr_consent_date timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone null,
    
    constraint valid_email check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

comment on table public.owners is 'Właściciele psów hovawart - dane kontaktowe';

-- dogs table (simplified - hovawart only)
create table public.dogs (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    gender public.dog_gender not null,
    birth_date date not null,
    coat public.dog_coat not null default 'czarny',
    microchip_number varchar(50) unique,
    kennel_name varchar(200),
    father_name varchar(100),
    mother_name varchar(100),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone null,
    
    constraint valid_birth_date check (birth_date <= current_date),
    constraint valid_microchip check (microchip_number ~ '^[0-9]{15}$' or microchip_number is null)
);

comment on table public.dogs is 'Psy rasy hovawart zarejestrowane w systemie';

-- dog owners relationship table
create table public.dog_owners (
    id uuid primary key default gen_random_uuid(),
    dog_id uuid not null references public.dogs(id) on delete cascade,
    owner_id uuid not null references public.owners(id) on delete cascade,
    is_primary boolean default false,
    created_at timestamp with time zone default now(),
    
    unique(dog_id, owner_id)
);

comment on table public.dog_owners is 'Relacja wiele-do-wielu między psami a właścicielami';

-- show registrations table
create table public.show_registrations (
    id uuid primary key default gen_random_uuid(),
    show_id uuid not null references public.shows(id) on delete cascade,
    dog_id uuid not null references public.dogs(id) on delete cascade,
    dog_class public.dog_class not null,
    catalog_number integer,
    registered_at timestamp with time zone default now(),
    
    unique(show_id, dog_id),
    unique(show_id, catalog_number)
);

comment on table public.show_registrations is 'Rejestracje psów na konkretne wystawy klubowe';

-- evaluations table (simplified)
create table public.evaluations (
    id uuid primary key default gen_random_uuid(),
    show_id uuid not null references public.shows(id) on delete cascade,
    dog_id uuid not null references public.dogs(id) on delete cascade,
    dog_class public.dog_class not null,
    grade public.evaluation_grade,
    baby_puppy_grade public.baby_puppy_grade,
    club_title public.club_title,
    placement public.placement,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    unique(show_id, dog_id),
    constraint valid_grade_by_class check (
        (dog_class in ('baby', 'puppy') and baby_puppy_grade is not null and grade is null) or
        (dog_class not in ('baby', 'puppy') and grade is not null and baby_puppy_grade is null)
    )
);

comment on table public.evaluations is 'Oceny psów z wystaw klubowych z tytułami klubowymi';

-- =============================================================================
-- 3. CREATE PERFORMANCE INDEXES
-- =============================================================================

-- basic indexes for users
create index idx_users_email on public.users(email) where deleted_at is null;
create index idx_users_role on public.users(role) where deleted_at is null;

-- indexes for shows
create index idx_shows_date on public.shows(show_date) where deleted_at is null;
create index idx_shows_status on public.shows(status) where deleted_at is null;

-- indexes for dogs
create index idx_dogs_microchip on public.dogs(microchip_number) where deleted_at is null;
create index idx_dogs_birth_date on public.dogs(birth_date) where deleted_at is null;
create index idx_dogs_gender on public.dogs(gender) where deleted_at is null;
create index idx_dogs_coat on public.dogs(coat) where deleted_at is null;

-- indexes for owners
create index idx_owners_email on public.owners(email) where deleted_at is null;
create index idx_owners_gdpr_consent on public.owners(gdpr_consent, gdpr_consent_date) where deleted_at is null;

-- indexes for registrations
create index idx_registrations_show_dog on public.show_registrations(show_id, dog_id);
create index idx_registrations_catalog on public.show_registrations(show_id, catalog_number);
create index idx_registrations_class on public.show_registrations(show_id, dog_class);

-- indexes for evaluations
create index idx_evaluations_show on public.evaluations(show_id);
create index idx_evaluations_dog on public.evaluations(dog_id);
create index idx_evaluations_grade on public.evaluations(grade);
create index idx_evaluations_club_title on public.evaluations(club_title);

-- composite indexes for relationships
create index idx_dog_owners_dog on public.dog_owners(dog_id);
create index idx_dog_owners_owner on public.dog_owners(owner_id);
create index idx_dog_owners_primary on public.dog_owners(owner_id, is_primary) where is_primary = true;

-- =============================================================================
-- 4. CREATE HELPER FUNCTIONS
-- =============================================================================

-- function to generate catalog numbers
create or replace function public.generate_catalog_numbers(show_id_param uuid)
returns void as $$
declare
    rec record;
    counter integer := 1;
begin
    for rec in
        select sr.id, sr.dog_class, d.gender
        from public.show_registrations sr
        join public.dogs d on sr.dog_id = d.id
        where sr.show_id = show_id_param
        order by sr.dog_class, d.gender, sr.registered_at
    loop
        update public.show_registrations
        set catalog_number = counter
        where id = rec.id;
        counter := counter + 1;
    end loop;
end;
$$ language plpgsql;

-- function to validate dog class based on age
create or replace function public.validate_dog_class(birth_date_param date, show_date_param date, class_param public.dog_class)
returns boolean as $$
declare
    age_months integer;
begin
    age_months := extract(month from age(show_date_param, birth_date_param)) +
                  extract(year from age(show_date_param, birth_date_param)) * 12;

    return case
        when class_param = 'baby' then age_months between 4 and 6
        when class_param = 'puppy' then age_months between 6 and 9
        when class_param = 'junior' then age_months between 9 and 18
        when class_param = 'intermediate' then age_months between 15 and 24
        when class_param = 'open' then age_months >= 15
        when class_param = 'working' then age_months >= 15
        when class_param = 'champion' then age_months >= 15
        when class_param = 'veteran' then age_months >= 96
        else false
    end;
end;
$$ language plpgsql;

-- function to automatically delete data after 3 years (GDPR compliance)
create or replace function public.schedule_data_deletion()
returns void as $$
begin
    -- mark shows older than 3 years for deletion
    update public.shows
    set deleted_at = now()
    where deleted_at is null
    and show_date < current_date - interval '3 years';

    -- mark evaluations from shows older than 3 years for deletion
    update public.evaluations
    set deleted_at = now()
    where deleted_at is null
    and show_id in (
        select id from public.shows
        where show_date < current_date - interval '3 years'
    );
end;
$$ language plpgsql;

-- =============================================================================
-- 5. CREATE TRIGGERS
-- =============================================================================

-- trigger to update updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- apply updated_at triggers
create trigger update_users_updated_at before update on public.users
    for each row execute function update_updated_at_column();

create trigger update_shows_updated_at before update on public.shows
    for each row execute function update_updated_at_column();

create trigger update_dogs_updated_at before update on public.dogs
    for each row execute function update_updated_at_column();

create trigger update_owners_updated_at before update on public.owners
    for each row execute function update_updated_at_column();

create trigger update_evaluations_updated_at before update on public.evaluations
    for each row execute function update_updated_at_column();

-- =============================================================================
-- 6. CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- enable rls on all tables
alter table public.users enable row level security;
alter table public.shows enable row level security;
alter table public.dogs enable row level security;
alter table public.owners enable row level security;
alter table public.show_registrations enable row level security;
alter table public.evaluations enable row level security;
alter table public.dog_owners enable row level security;

-- policies for club board members (full access)
create policy users_club_board_access on public.users
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );

create policy shows_club_board_access on public.shows
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );

create policy dogs_club_board_access on public.dogs
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );

create policy owners_club_board_access on public.owners
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );

create policy registrations_club_board_access on public.show_registrations
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );

create policy evaluations_club_board_access on public.evaluations
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );

create policy dog_owners_club_board_access on public.dog_owners
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );

-- policies to hide soft-deleted records
create policy hide_deleted_users on public.users
    for select using (deleted_at is null);

create policy hide_deleted_shows on public.shows
    for select using (deleted_at is null);

create policy hide_deleted_dogs on public.dogs
    for select using (deleted_at is null);

create policy hide_deleted_owners on public.owners
    for select using (deleted_at is null);

-- =============================================================================
-- 7. INSERT SEED DATA - REMOVED TO AVOID DUPLICATES WITH seed.sql
-- =============================================================================

-- Seed data is now handled by supabase/seed.sql
-- This prevents duplicate data insertion

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================

-- migration completed successfully
-- created simplified hovawart club mvp database
-- all tables, indexes, functions, triggers, and rls policies created
-- seed data will be inserted by supabase/seed.sql
-- system ready for hovawart club show mvp deployment 
