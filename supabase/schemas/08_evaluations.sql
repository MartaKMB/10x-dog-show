-- =============================================================================
-- Evaluations Table for Hovawart Club Show System
-- =============================================================================
-- Purpose: Store dog evaluations from club shows with club titles
-- Date: 2024-12-21
-- =============================================================================

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

-- indexes for evaluations
create index idx_evaluations_show on public.evaluations(show_id);
create index idx_evaluations_dog on public.evaluations(dog_id);
create index idx_evaluations_grade on public.evaluations(grade);
create index idx_evaluations_club_title on public.evaluations(club_title);

-- enable rls
alter table public.evaluations enable row level security;

-- policies for club board members (full access)
create policy evaluations_club_board_access on public.evaluations
    for all using (
        exists (select 1 from public.users where id = auth.uid() and role = 'club_board')
    );
