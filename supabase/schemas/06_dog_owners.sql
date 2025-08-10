-- =============================================================================
-- Dog Owners Relationship Table for Hovawart Club Show System
-- =============================================================================
-- Purpose: Store many-to-many relationship between dogs and owners
-- Date: 2024-12-21
-- =============================================================================

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

-- composite indexes for relationships
create index idx_dog_owners_dog on public.dog_owners(dog_id);
create index idx_dog_owners_owner on public.dog_owners(owner_id);
create index idx_dog_owners_primary on public.dog_owners(owner_id, is_primary) where is_primary = true;

-- enable rls
alter table public.dog_owners enable row level security;

-- policies for club board members (full access)
create policy dog_owners_club_board_access on public.dog_owners
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );
