drop index if exists "public"."idx_dogs_coat";

alter table "public"."dog_owners" enable row level security;

alter table "public"."dogs" enable row level security;

alter table "public"."evaluations" enable row level security;

alter table "public"."owners" alter column "address" drop not null;

alter table "public"."owners" alter column "city" drop not null;

alter table "public"."owners" enable row level security;

alter table "public"."show_registrations" enable row level security;

alter table "public"."shows" enable row level security;

alter table "public"."users" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.schedule_data_deletion()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;


  create policy "dog_owners_local_dev_access"
  on "public"."dog_owners"
  as permissive
  for all
  to public
using (true);



  create policy "dogs_local_dev_access"
  on "public"."dogs"
  as permissive
  for all
  to public
using (true);



  create policy "hide_deleted_dogs"
  on "public"."dogs"
  as permissive
  for select
  to public
using ((deleted_at IS NULL));



  create policy "evaluations_local_dev_access"
  on "public"."evaluations"
  as permissive
  for all
  to public
using (true);



  create policy "hide_deleted_owners"
  on "public"."owners"
  as permissive
  for select
  to public
using ((deleted_at IS NULL));



  create policy "owners_local_dev_access"
  on "public"."owners"
  as permissive
  for all
  to public
using (true);



  create policy "registrations_club_board_access"
  on "public"."show_registrations"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = 'club_board'::user_role)))));



  create policy "show_registrations_local_dev_access"
  on "public"."show_registrations"
  as permissive
  for all
  to public
using (true);



  create policy "hide_deleted_shows"
  on "public"."shows"
  as permissive
  for select
  to public
using ((deleted_at IS NULL));



  create policy "shows_local_dev_access"
  on "public"."shows"
  as permissive
  for all
  to public
using (true);



  create policy "hide_deleted_users"
  on "public"."users"
  as permissive
  for select
  to public
using ((deleted_at IS NULL));



  create policy "users_local_dev_access"
  on "public"."users"
  as permissive
  for all
  to public
using (true);



