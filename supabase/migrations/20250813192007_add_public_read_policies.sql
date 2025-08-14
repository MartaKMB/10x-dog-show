drop policy "dogs_club_board_access" on "public"."dogs";

drop policy "owners_club_board_access" on "public"."owners";

drop policy "shows_club_board_access" on "public"."shows";

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


  create policy "dogs_club_board_write"
  on "public"."dogs"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = 'club_board'::user_role)))));



  create policy "dogs_public_read_club_write"
  on "public"."dogs"
  as permissive
  for select
  to public
using (true);



  create policy "owners_club_board_write"
  on "public"."owners"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = 'club_board'::user_role)))));



  create policy "owners_public_read_club_write"
  on "public"."owners"
  as permissive
  for select
  to public
using (true);



  create policy "shows_club_board_write"
  on "public"."shows"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = 'club_board'::user_role)))));



  create policy "shows_public_read_club_write"
  on "public"."shows"
  as permissive
  for select
  to public
using (true);



