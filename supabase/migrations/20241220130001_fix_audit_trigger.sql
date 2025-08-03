-- =============================================================================
-- Fix Audit Trigger - Map table names to entity_type enum correctly
-- =============================================================================

-- Drop existing audit triggers
drop trigger if exists audit_shows_trigger on dog_shows.shows;
drop trigger if exists audit_dogs_trigger on dog_shows.dogs;
drop trigger if exists audit_owners_trigger on dog_shows.owners;
drop trigger if exists audit_descriptions_trigger on dog_shows.descriptions;

-- Drop existing audit function
drop function if exists audit.log_activity();

-- Recreate audit function with proper table name mapping
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
        case tg_table_name
            when 'shows' then 'show'::audit.entity_type
            when 'dogs' then 'dog'::audit.entity_type
            when 'owners' then 'owner'::audit.entity_type
            when 'descriptions' then 'description'::audit.entity_type
            when 'evaluations' then 'evaluation'::audit.entity_type
            when 'show_registrations' then 'registration'::audit.entity_type
            else 'user'::audit.entity_type
        end,
        coalesce(new.id, old.id),
        case when tg_op != 'insert' then to_jsonb(old) else null end,
        case when tg_op != 'delete' then to_jsonb(new) else null end,
        jsonb_build_object('table', tg_table_name, 'operation', tg_op)
    );
    return coalesce(new, old);
end;
$$ language plpgsql;

-- Recreate audit triggers
create trigger audit_shows_trigger after insert or update or delete on dog_shows.shows
    for each row execute function audit.log_activity();

create trigger audit_dogs_trigger after insert or update or delete on dog_shows.dogs
    for each row execute function audit.log_activity();

create trigger audit_owners_trigger after insert or update or delete on dog_shows.owners
    for each row execute function audit.log_activity();

create trigger audit_descriptions_trigger after insert or update or delete on dog_shows.descriptions
    for each row execute function audit.log_activity(); 
