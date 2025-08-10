-- =============================================================================
-- Owners Table for Hovawart Club Show System
-- =============================================================================
-- Purpose: Store dog owners contact information
-- Date: 2024-12-21
-- =============================================================================

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

-- indexes for owners
create index idx_owners_email on public.owners(email) where deleted_at is null;
create index idx_owners_gdpr_consent on public.owners(gdpr_consent, gdpr_consent_date) where deleted_at is null;

-- enable rls
alter table public.owners enable row level security;

-- policies for club board members (full access)
create policy owners_club_board_access on public.owners
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );

-- policies to hide soft-deleted records
create policy hide_deleted_owners on public.owners
    for select using (deleted_at is null);
