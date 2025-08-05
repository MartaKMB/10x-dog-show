-- =============================================================================
-- Migration: Create Dog Show Management System Database Schema
-- =============================================================================
-- Purpose: Initial database schema for 10x Dog Show management system
-- Affected: Creates all core tables, enums, functions, triggers, and RLS policies
-- Author: System Migration
-- Date: 2024-12-20
-- Special Considerations: 
-- - Implements FCI standard with groups G1-G10 and standard classes
-- - Supports dog co-ownership (M:N relationship)
-- - Includes description versioning with full audit trail
-- - GDPR compliant with soft delete functionality
-- - Multi-language support (Polish/English)
-- =============================================================================

-- =============================================================================
-- 1. CREATE SCHEMAS
-- =============================================================================

-- main business logic schema
create schema if not exists dog_shows;

-- audit and history tracking schema
create schema if not exists audit;

-- reference data and dictionaries schema
create schema if not exists dictionary;

-- =============================================================================
-- 2. CREATE ENUMS
-- =============================================================================

-- user roles within the system
create type dog_shows.user_role as enum ('department_representative', 'secretary');

-- types of dog shows
create type dog_shows.show_type as enum ('national', 'international');

-- dog show statuses throughout lifecycle
create type dog_shows.show_status as enum ('draft', 'open_for_registration', 'registration_closed', 'in_progress', 'completed', 'cancelled');

-- dog gender classification
create type dog_shows.dog_gender as enum ('male', 'female');

-- fci standard dog classes
create type dog_shows.dog_class as enum ('baby', 'puppy', 'junior', 'intermediate', 'open', 'working', 'champion', 'veteran');

-- fci groups for breed classification
create type dog_shows.fci_group as enum ('G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10');

-- supported languages
create type dog_shows.language as enum ('pl', 'en');

-- evaluation grades for adult dogs
create type dog_shows.evaluation_grade as enum ('excellent', 'very_good', 'good', 'satisfactory', 'disqualified', 'absent');

-- evaluation grades for baby and puppy classes
create type dog_shows.baby_puppy_grade as enum ('very_promising', 'promising', 'quite_promising');

-- available titles that can be awarded
create type dog_shows.title_type as enum ('CWC', 'CACIB', 'res_CWC', 'res_CACIB');

-- placement in competition
create type dog_shows.placement as enum ('1st', '2nd', '3rd', '4th');

-- audit action types
create type audit.action_type as enum ('create', 'update', 'delete', 'login', 'logout', 'export', 'send_email');

-- entity types for audit trail
create type audit.entity_type as enum ('user', 'show', 'dog', 'owner', 'description', 'evaluation', 'registration');

-- =============================================================================
-- 3. DICTIONARY TABLES
-- =============================================================================

-- dog breeds with fci group assignment
create table dictionary.breeds (
    id uuid primary key default gen_random_uuid(),
    name_pl varchar(100) not null,
    name_en varchar(100) not null,
    fci_group dog_shows.fci_group not null,
    fci_number integer unique,
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- judges and their contact information
create table dictionary.judges (
    id uuid primary key default gen_random_uuid(),
    first_name varchar(100) not null,
    last_name varchar(100) not null,
    license_number varchar(50) unique,
    email varchar(255),
    phone varchar(20),
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone null,
    scheduled_for_deletion boolean default false
);

-- judge specializations for fci groups (many-to-many relationship)
create table dictionary.judge_specializations (
    id uuid primary key default gen_random_uuid(),
    judge_id uuid not null references dictionary.judges(id) on delete cascade,
    fci_group dog_shows.fci_group not null,
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    unique(judge_id, fci_group)
);

-- branches organizing shows
create table dictionary.branches (
    id uuid primary key default gen_random_uuid(),
    name varchar(200) not null,
    address text,
    city varchar(100),
    postal_code varchar(20),
    region varchar(100) not null,
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- =============================================================================
-- 4. MAIN BUSINESS TABLES
-- =============================================================================

-- dog shows with all relevant information
create table dog_shows.shows (
    id uuid primary key default gen_random_uuid(),
    name varchar(200) not null,
    show_type dog_shows.show_type not null,
    status dog_shows.show_status default 'draft',
    show_date date not null,
    registration_deadline date not null,
    branch_id uuid references dictionary.branches(id),
    organizer_id uuid not null references auth.users(id),
    max_participants integer,
    description text,
    entry_fee decimal(10,2),
    language dog_shows.language default 'pl',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone null,
    scheduled_for_deletion boolean default false,
    
    -- ensure registration deadline is before show date
    constraint valid_dates check (registration_deadline <= show_date)
);

-- dog owners (contact information, not system users)
create table dog_shows.owners (
    id uuid primary key default gen_random_uuid(),
    first_name varchar(100) not null,
    last_name varchar(100) not null,
    email varchar(255) not null,
    phone varchar(20),
    address text not null,
    city varchar(100) not null,
    postal_code varchar(20),
    country varchar(100) default 'Poland',
    kennel_name varchar(200),
    language dog_shows.language default 'pl',
    gdpr_consent boolean default false,
    gdpr_consent_date timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone null,
    scheduled_for_deletion boolean default false,
    
    -- validate email format
    constraint valid_email check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- dogs registered in the system
create table dog_shows.dogs (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    breed_id uuid not null references dictionary.breeds(id),
    gender dog_shows.dog_gender not null,
    birth_date date not null,
    microchip_number varchar(50) unique,
    kennel_club_number varchar(50) unique,
    kennel_name varchar(200),
    father_name varchar(100),
    mother_name varchar(100),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone null,
    scheduled_for_deletion boolean default false,
    
    -- ensure birth date is not in the future
    constraint valid_birth_date check (birth_date <= current_date),
    -- validate microchip number format (15 digits)
    constraint valid_microchip check (microchip_number ~ '^[0-9]{15}$')
);

-- dog co-ownership (many-to-many relationship between dogs and owners)
create table dog_shows.dog_owners (
    id uuid primary key default gen_random_uuid(),
    dog_id uuid not null references dog_shows.dogs(id) on delete cascade,
    owner_id uuid not null references dog_shows.owners(id) on delete cascade,
    is_primary boolean default false,
    created_at timestamp with time zone default now(),
    
    -- ensure unique dog-owner combinations
    unique(dog_id, owner_id)
);

-- dog registrations for specific shows
create table dog_shows.show_registrations (
    id uuid primary key default gen_random_uuid(),
    show_id uuid not null references dog_shows.shows(id) on delete cascade,
    dog_id uuid not null references dog_shows.dogs(id) on delete cascade,
    dog_class dog_shows.dog_class not null,
    catalog_number integer,
    registration_fee decimal(10,2),
    is_paid boolean default false,
    registered_at timestamp with time zone default now(),
    
    -- ensure unique registrations per show
    unique(show_id, dog_id),
    -- ensure unique catalog numbers per show
    unique(show_id, catalog_number)
);

-- judge assignments to shows and fci groups
create table dog_shows.show_judge_assignments (
    id uuid primary key default gen_random_uuid(),
    show_id uuid not null references dog_shows.shows(id) on delete cascade,
    judge_id uuid not null references dictionary.judges(id) on delete cascade,
    fci_group dog_shows.fci_group not null,
    created_at timestamp with time zone default now(),
    
    -- ensure unique judge-show-group combinations
    unique(show_id, judge_id, fci_group)
);

-- secretary assignments to shows and breeds
create table dog_shows.secretary_assignments (
    id uuid primary key default gen_random_uuid(),
    show_id uuid not null references dog_shows.shows(id) on delete cascade,
    secretary_id uuid not null references auth.users(id) on delete cascade,
    breed_id uuid not null references dictionary.breeds(id) on delete cascade,
    created_at timestamp with time zone default now(),
    
    -- ensure unique secretary-show-breed combinations
    unique(show_id, secretary_id, breed_id)
);

-- dog descriptions with versioning support
create table dog_shows.descriptions (
    id uuid primary key default gen_random_uuid(),
    show_id uuid not null references dog_shows.shows(id) on delete cascade,
    dog_id uuid not null references dog_shows.dogs(id) on delete cascade,
    judge_id uuid not null references dictionary.judges(id) on delete cascade,
    secretary_id uuid not null references auth.users(id) on delete cascade,
    content_pl text,
    content_en text,
    version integer default 1,
    is_final boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    finalized_at timestamp with time zone,
    
    -- ensure unique descriptions per show-dog-judge combination
    unique(show_id, dog_id, judge_id),
    -- ensure at least one language content is provided
    constraint content_required check (content_pl is not null or content_en is not null)
);

-- description version history for full audit trail
create table dog_shows.description_versions (
    id uuid primary key default gen_random_uuid(),
    description_id uuid not null references dog_shows.descriptions(id) on delete cascade,
    version integer not null,
    content_pl text,
    content_en text,
    changed_by uuid not null references auth.users(id),
    change_reason text,
    created_at timestamp with time zone default now(),
    
    -- ensure unique version numbers per description
    unique(description_id, version)
);

-- dog evaluations with grades and awards
create table dog_shows.evaluations (
    id uuid primary key default gen_random_uuid(),
    description_id uuid not null references dog_shows.descriptions(id) on delete cascade,
    dog_class dog_shows.dog_class not null,
    grade dog_shows.evaluation_grade,
    baby_puppy_grade dog_shows.baby_puppy_grade,
    title dog_shows.title_type,
    placement dog_shows.placement,
    points integer,
    is_best_in_group boolean default false,
    is_best_in_show boolean default false,
    judge_signature text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    -- ensure one evaluation per description
    unique(description_id),
    -- ensure correct grade type based on dog class
    constraint valid_grade_by_class check (
        (dog_class in ('baby', 'puppy') and baby_puppy_grade is not null and grade is null) or
        (dog_class not in ('baby', 'puppy') and grade is not null and baby_puppy_grade is null)
    )
);

-- pdf documents generated from descriptions
create table dog_shows.pdf_documents (
    id uuid primary key default gen_random_uuid(),
    description_id uuid not null references dog_shows.descriptions(id) on delete cascade,
    file_name varchar(255) not null,
    file_path text not null,
    file_size integer,
    language dog_shows.language not null,
    generated_at timestamp with time zone default now(),
    sent_at timestamp with time zone,
    sent_to_email varchar(255),
    
    -- ensure unique pdf per description and language
    unique(description_id, language)
);

-- =============================================================================
-- 5. AUDIT TABLES
-- =============================================================================

-- comprehensive audit log for all critical actions
create table audit.activity_log (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    action audit.action_type not null,
    entity_type audit.entity_type not null,
    entity_id uuid,
    old_values jsonb,
    new_values jsonb,
    metadata jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone default now()
);

-- gdpr compliance request tracking
create table audit.gdpr_requests (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references dog_shows.owners(id),
    request_type varchar(50) not null, -- 'delete', 'export', 'withdraw_consent'
    status varchar(50) default 'pending', -- 'pending', 'processing', 'completed', 'failed'
    requested_at timestamp with time zone default now(),
    processed_at timestamp with time zone,
    processed_by uuid references auth.users(id),
    notes text
);

-- automatic data deletion schedule (3-year gdpr retention)
create table audit.data_retention_schedule (
    id uuid primary key default gen_random_uuid(),
    entity_type audit.entity_type not null,
    entity_id uuid not null,
    retention_date date not null,
    deletion_scheduled_at timestamp with time zone,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone default now()
);

-- =============================================================================
-- 6. PERFORMANCE INDEXES
-- =============================================================================

-- basic user indexes (commented out due to auth.users permissions)
-- create index idx_users_email on auth.users(email) where deleted_at is null;
-- create index idx_users_role on auth.users(role) where deleted_at is null;

-- show-related indexes
create index idx_shows_date on dog_shows.shows(show_date) where deleted_at is null;
create index idx_shows_status on dog_shows.shows(status) where deleted_at is null;
create index idx_shows_organizer on dog_shows.shows(organizer_id) where deleted_at is null;

-- dog-related indexes
create index idx_dogs_breed on dog_shows.dogs(breed_id) where deleted_at is null;
create index idx_dogs_microchip on dog_shows.dogs(microchip_number) where deleted_at is null;
create index idx_dogs_kennel_number on dog_shows.dogs(kennel_club_number) where deleted_at is null;
create index idx_dogs_birth_date on dog_shows.dogs(birth_date) where deleted_at is null;

-- owner-related indexes
create index idx_owners_email on dog_shows.owners(email) where deleted_at is null;
create index idx_owners_gdpr_consent on dog_shows.owners(gdpr_consent, gdpr_consent_date) where deleted_at is null;

-- registration indexes
create index idx_registrations_show_dog on dog_shows.show_registrations(show_id, dog_id);
create index idx_registrations_catalog on dog_shows.show_registrations(show_id, catalog_number);
create index idx_registrations_class on dog_shows.show_registrations(show_id, dog_class);

-- description indexes
create index idx_descriptions_show on dog_shows.descriptions(show_id);
create index idx_descriptions_judge on dog_shows.descriptions(judge_id);
create index idx_descriptions_secretary on dog_shows.descriptions(secretary_id);
create index idx_descriptions_version on dog_shows.descriptions(version);
create index idx_descriptions_final on dog_shows.descriptions(is_final);

-- relationship indexes
create index idx_dog_owners_dog on dog_shows.dog_owners(dog_id);
create index idx_dog_owners_owner on dog_shows.dog_owners(owner_id);
create index idx_judge_specializations_judge on dictionary.judge_specializations(judge_id);
create index idx_secretary_assignments_show_secretary on dog_shows.secretary_assignments(show_id, secretary_id);

-- audit indexes
create index idx_activity_log_user on audit.activity_log(user_id);
create index idx_activity_log_entity on audit.activity_log(entity_type, entity_id);
create index idx_activity_log_created on audit.activity_log(created_at);
create index idx_gdpr_requests_owner on audit.gdpr_requests(owner_id);
create index idx_retention_schedule_date on audit.data_retention_schedule(retention_date);

-- =============================================================================
-- 7. HELPER FUNCTIONS
-- =============================================================================

-- function to automatically generate catalog numbers for show registrations
create or replace function dog_shows.generate_catalog_numbers(show_id_param uuid)
returns void as $$
declare
    rec record;
    counter integer := 1;
begin
    -- generate catalog numbers ordered by fci group, class, gender, and registration time
    for rec in 
        select sr.id, sr.dog_class, b.fci_group, d.gender
        from dog_shows.show_registrations sr
        join dog_shows.dogs d on sr.dog_id = d.id
        join dictionary.breeds b on d.breed_id = b.id
        where sr.show_id = show_id_param
        order by b.fci_group, sr.dog_class, d.gender, sr.registered_at
    loop
        update dog_shows.show_registrations 
        set catalog_number = counter
        where id = rec.id;
        counter := counter + 1;
    end loop;
end;
$$ language plpgsql;

-- function to validate dog class based on age at show date
create or replace function dog_shows.validate_dog_class(birth_date_param date, show_date_param date, class_param dog_shows.dog_class)
returns boolean as $$
declare
    age_months integer;
begin
    -- calculate age in months at show date
    age_months := extract(month from age(show_date_param, birth_date_param)) + 
                  extract(year from age(show_date_param, birth_date_param)) * 12;
    
    -- validate age ranges for each class according to fci rules
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

-- function to schedule automatic data deletion after 3 years (gdpr compliance)
create or replace function audit.schedule_data_deletion()
returns void as $$
begin
    -- schedule deletion of show data older than 3 years
    insert into audit.data_retention_schedule (entity_type, entity_id, retention_date)
    select 'show', id, (created_at + interval '3 years')::date
    from dog_shows.shows
    where deleted_at is null
    and created_at < now() - interval '3 years'
    and not exists (
        select 1 from audit.data_retention_schedule 
        where entity_type = 'show' and entity_id = dog_shows.shows.id
    );
end;
$$ language plpgsql;

-- =============================================================================
-- 8. TRIGGERS
-- =============================================================================

-- function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- apply updated_at triggers to relevant tables
create trigger update_shows_updated_at before update on dog_shows.shows
    for each row execute function update_updated_at_column();

create trigger update_dogs_updated_at before update on dog_shows.dogs
    for each row execute function update_updated_at_column();

create trigger update_owners_updated_at before update on dog_shows.owners
    for each row execute function update_updated_at_column();

create trigger update_descriptions_updated_at before update on dog_shows.descriptions
    for each row execute function update_updated_at_column();

create trigger update_evaluations_updated_at before update on dog_shows.evaluations
    for each row execute function update_updated_at_column();

-- function to create description version history
create or replace function dog_shows.create_description_version()
returns trigger as $$
begin
    if tg_op = 'update' then
        insert into dog_shows.description_versions (
            description_id, version, content_pl, content_en, changed_by, change_reason
        ) values (
            new.id, new.version, new.content_pl, new.content_en, 
            new.secretary_id, 'updated description'
        );
    end if;
    return new;
end;
$$ language plpgsql;

-- trigger for description versioning
create trigger create_description_version_trigger 
    after update on dog_shows.descriptions
    for each row execute function dog_shows.create_description_version();

-- function for comprehensive audit logging
create or replace function audit.log_activity()
returns trigger as $$
begin
    insert into audit.activity_log (
        user_id, action, entity_type, entity_id, old_values, new_values, metadata
    ) values (
        coalesce(nullif(current_setting('app.user_id', true), ''), auth.uid()::text)::uuid,
        case tg_op
            when 'insert' then 'create'::audit.action_type
            when 'update' then 'update'::audit.action_type
            when 'delete' then 'delete'::audit.action_type
        end,
        tg_table_name::audit.entity_type,
        coalesce(new.id, old.id),
        case when tg_op != 'insert' then to_jsonb(old) else null end,
        case when tg_op != 'delete' then to_jsonb(new) else null end,
        jsonb_build_object('table', tg_table_name, 'operation', tg_op)
    );
    return coalesce(new, old);
end;
$$ language plpgsql;

-- apply audit triggers to critical tables
create trigger audit_shows_trigger after insert or update or delete on dog_shows.shows
    for each row execute function audit.log_activity();

create trigger audit_dogs_trigger after insert or update or delete on dog_shows.dogs
    for each row execute function audit.log_activity();

create trigger audit_owners_trigger after insert or update or delete on dog_shows.owners
    for each row execute function audit.log_activity();

create trigger audit_descriptions_trigger after insert or update or delete on dog_shows.descriptions
    for each row execute function audit.log_activity();

-- =============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- enable rls on all main tables
alter table dog_shows.shows enable row level security;
alter table dog_shows.dogs enable row level security;
alter table dog_shows.owners enable row level security;
alter table dog_shows.descriptions enable row level security;
alter table dog_shows.show_registrations enable row level security;
alter table dog_shows.secretary_assignments enable row level security;
alter table dog_shows.evaluations enable row level security;
alter table dog_shows.pdf_documents enable row level security;

-- policy for department representatives: full access to their shows
create policy shows_department_representative_select on dog_shows.shows
    for select using (
        organizer_id = auth.uid() or
        exists (select 1 from auth.users where id = auth.uid() and role = 'department_representative')
    );

create policy shows_department_representative_insert on dog_shows.shows
    for insert with check (
        organizer_id = auth.uid() or
        exists (select 1 from auth.users where id = auth.uid() and role = 'department_representative')
    );

create policy shows_department_representative_update on dog_shows.shows
    for update using (
        organizer_id = auth.uid() or
        exists (select 1 from auth.users where id = auth.uid() and role = 'department_representative')
    );

create policy shows_department_representative_delete on dog_shows.shows
    for delete using (
        organizer_id = auth.uid() or
        exists (select 1 from auth.users where id = auth.uid() and role = 'department_representative')
    );

-- policy for secretaries: access only to assigned breeds
create policy descriptions_secretary_select on dog_shows.descriptions
    for select using (
        secretary_id = auth.uid() or
        exists (
            select 1 from dog_shows.secretary_assignments sa
            join dog_shows.dogs d on d.breed_id = sa.breed_id
            where sa.secretary_id = auth.uid()
            and sa.show_id = descriptions.show_id
            and d.id = descriptions.dog_id
        )
    );

create policy descriptions_secretary_insert on dog_shows.descriptions
    for insert with check (
        secretary_id = auth.uid() or
        exists (
            select 1 from dog_shows.secretary_assignments sa
            join dog_shows.dogs d on d.breed_id = sa.breed_id
            where sa.secretary_id = auth.uid()
            and sa.show_id = descriptions.show_id
            and d.id = descriptions.dog_id
        )
    );

create policy descriptions_secretary_update on dog_shows.descriptions
    for update using (
        secretary_id = auth.uid() or
        exists (
            select 1 from dog_shows.secretary_assignments sa
            join dog_shows.dogs d on d.breed_id = sa.breed_id
            where sa.secretary_id = auth.uid()
            and sa.show_id = descriptions.show_id
            and d.id = descriptions.dog_id
        )
    );

-- policy to hide soft-deleted records
create policy hide_deleted_shows on dog_shows.shows
    for select using (deleted_at is null);

create policy hide_deleted_dogs on dog_shows.dogs
    for select using (deleted_at is null);

create policy hide_deleted_owners on dog_shows.owners
    for select using (deleted_at is null);

-- policy for public access to reference data
create policy public_breeds_select on dictionary.breeds
    for select using (is_active = true);

create policy public_branches_select on dictionary.branches
    for select using (is_active = true);

create policy public_judges_select on dictionary.judges
    for select using (is_active = true and deleted_at is null);

-- enable rls on reference tables
alter table dictionary.breeds enable row level security;
alter table dictionary.branches enable row level security;
alter table dictionary.judges enable row level security;
alter table dictionary.judge_specializations enable row level security;

-- public access policy for judge specializations
create policy public_judge_specializations_select on dictionary.judge_specializations
    for select using (is_active = true);

-- =============================================================================
-- 10. INITIAL SEED DATA
-- =============================================================================

-- basic dog breeds with fci groups
insert into dictionary.breeds (name_pl, name_en, fci_group, fci_number) values
('Owczarek niemiecki', 'German Shepherd Dog', 'G1', 166),
('Labrador retriever', 'Labrador Retriever', 'G8', 122),
('Golden retriever', 'Golden Retriever', 'G8', 111),
('Buldog francuski', 'French Bulldog', 'G9', 101),
('Rottweiler', 'Rottweiler', 'G2', 147),
('Border collie', 'Border Collie', 'G1', 297),
('Husky syberyjski', 'Siberian Husky', 'G5', 270),
('Beagle', 'Beagle', 'G6', 161),
('Bokser', 'Boxer', 'G2', 144),
('Cocker spaniel angielski', 'English Cocker Spaniel', 'G8', 5);

-- example branches
insert into dictionary.branches (name, address, city, postal_code, region) values
('Oddział Warszawa', 'ul. Marywilska 44', 'Warszawa', '03-042', 'Mazowieckie'),
('Oddział Katowice', 'al. Korfantego 35', 'Katowice', '40-005', 'Śląskie'),
('Oddział Kraków', 'ul. Marii Konopnickiej 17', 'Kraków', '30-302', 'Małopolskie'),
('Oddział Wrocław', 'pl. Wróblewskiego 1', 'Wrocław', '51-618', 'Dolnośląskie'),
('Oddział Gdańsk', 'ul. Karowej 35', 'Gdańsk', '80-104', 'Pomorskie');

-- example judges
insert into dictionary.judges (first_name, last_name, license_number, email) values
('Jan', 'Kowalski', 'PL001', 'jan.kowalski@example.com'),
('Maria', 'Nowak', 'PL002', 'maria.nowak@example.com'),
('Piotr', 'Wiśniewski', 'PL003', 'piotr.wisniewski@example.com'),
('Anna', 'Wójcik', 'PL004', 'anna.wojcik@example.com'),
('Krzysztof', 'Kowalczyk', 'PL005', 'krzysztof.kowalczyk@example.com');

-- judge specializations
insert into dictionary.judge_specializations (judge_id, fci_group) 
select j.id, 'G1'::dog_shows.fci_group from dictionary.judges j where j.license_number = 'PL001';

insert into dictionary.judge_specializations (judge_id, fci_group) 
select j.id, 'G2'::dog_shows.fci_group from dictionary.judges j where j.license_number = 'PL001';

insert into dictionary.judge_specializations (judge_id, fci_group) 
select j.id, 'G8'::dog_shows.fci_group from dictionary.judges j where j.license_number = 'PL002';

insert into dictionary.judge_specializations (judge_id, fci_group) 
select j.id, 'G9'::dog_shows.fci_group from dictionary.judges j where j.license_number = 'PL002';

insert into dictionary.judge_specializations (judge_id, fci_group) 
select j.id, 'G5'::dog_shows.fci_group from dictionary.judges j where j.license_number = 'PL003';

insert into dictionary.judge_specializations (judge_id, fci_group) 
select j.id, 'G6'::dog_shows.fci_group from dictionary.judges j where j.license_number = 'PL003';

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================

-- migration completed successfully
-- all tables, indexes, functions, triggers, and rls policies created
-- seed data inserted for testing purposes
-- system ready for application deployment 
