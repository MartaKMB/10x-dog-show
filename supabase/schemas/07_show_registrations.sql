-- =============================================================================
-- Show Registrations Table for Hovawart Club Show System
-- =============================================================================
-- Purpose: Store dog registrations for specific club shows
-- Date: 2024-12-21
-- =============================================================================

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

-- indexes for registrations
create index idx_registrations_show_dog on public.show_registrations(show_id, dog_id);
create index idx_registrations_catalog on public.show_registrations(show_id, catalog_number);
create index idx_registrations_class on public.show_registrations(show_id, dog_class);

-- enable rls
alter table public.show_registrations enable row level security;

-- policies for club board members (full access)
create policy registrations_club_board_access on public.show_registrations
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );
