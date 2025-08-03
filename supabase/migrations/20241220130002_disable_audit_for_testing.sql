-- =============================================================================
-- Temporarily disable audit triggers for testing
-- =============================================================================

-- Disable audit triggers to avoid issues during testing
alter table dog_shows.shows disable trigger audit_shows_trigger;
alter table dog_shows.dogs disable trigger audit_dogs_trigger;
alter table dog_shows.owners disable trigger audit_owners_trigger;
alter table dog_shows.descriptions disable trigger audit_descriptions_trigger; 
