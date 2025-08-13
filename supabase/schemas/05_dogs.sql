-- =============================================================================
-- Dogs Table for Hovawart Club Show System
-- =============================================================================
-- Purpose: Store information about Hovawart dogs registered in the system
-- Date: 2024-12-21
-- =============================================================================

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

-- indexes for dogs
create index idx_dogs_microchip on public.dogs(microchip_number) where deleted_at is null;
create index idx_dogs_birth_date on public.dogs(birth_date) where deleted_at is null;
create index idx_dogs_gender on public.dogs(gender) where deleted_at is null;

-- enable rls
alter table public.dogs enable row level security;

-- policies for club board members (full access)
create policy dogs_club_board_access on public.dogs
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );

-- policies to hide soft-deleted records
create policy hide_deleted_dogs on public.dogs
    for select using (deleted_at is null);
