-- =============================================================================
-- Helper Functions for Hovawart Club Show System
-- =============================================================================
-- Purpose: Define utility functions for the system
-- Date: 2024-12-21
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

-- function to schedule data deletion after 3 years (gdpr compliance)
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

-- function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;
