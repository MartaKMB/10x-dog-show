-- =============================================================================
-- Users Table for Hovawart Club Show System
-- =============================================================================
-- Purpose: Store club board members and their authentication data
-- Date: 2024-12-21
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

-- basic indexes for users
create index idx_users_email on public.users(email) where deleted_at is null;
create index idx_users_role on public.users(role) where deleted_at is null;

-- enable rls
alter table public.users enable row level security;

-- policies for club board members (full access)
create policy users_club_board_access on public.users
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );

-- policies to hide soft-deleted records
create policy hide_deleted_users on public.users
    for select using (deleted_at is null);
