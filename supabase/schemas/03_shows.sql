-- =============================================================================
-- Shows Table for Hovawart Club Show System
-- =============================================================================
-- Purpose: Store information about dog shows organized by the club
-- Date: 2024-12-21
-- =============================================================================

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

-- indexes for shows
create index idx_shows_date on public.shows(show_date) where deleted_at is null;
create index idx_shows_status on public.shows(status) where deleted_at is null;

-- enable rls
alter table public.shows enable row level security;

-- policies for club board members (full access)
create policy shows_club_board_access on public.shows
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );

-- policies to hide soft-deleted records
create policy hide_deleted_shows on public.shows
    for select using (deleted_at is null);
