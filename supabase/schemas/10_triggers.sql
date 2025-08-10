-- =============================================================================
-- Triggers for Hovawart Club Show System
-- =============================================================================
-- Purpose: Define triggers for automatic timestamp updates
-- Date: 2024-12-21
-- =============================================================================

-- apply updated_at triggers
create trigger update_users_updated_at before update on public.users
    for each row execute function update_updated_at_column();

create trigger update_shows_updated_at before update on public.shows
    for each row execute function update_updated_at_column();

create trigger update_dogs_updated_at before update on public.dogs
    for each row execute function update_updated_at_column();

create trigger update_owners_updated_at before update on public.owners
    for each row execute function update_updated_at_column();

create trigger update_evaluations_updated_at before update on public.evaluations
    for each row execute function update_updated_at_column();
