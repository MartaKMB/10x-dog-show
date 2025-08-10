alter table "public"."dog_owners" enable row level security;

alter table "public"."dogs" enable row level security;

alter table "public"."evaluations" enable row level security;

alter table "public"."owners" enable row level security;

alter table "public"."show_registrations" enable row level security;

alter table "public"."shows" enable row level security;

alter table "public"."users" enable row level security;

create policy "dog_owners_club_board_access"
on "public"."dog_owners"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = 'club_board'::user_role)))));


create policy "dogs_club_board_access"
on "public"."dogs"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = 'club_board'::user_role)))));


create policy "hide_deleted_dogs"
on "public"."dogs"
as permissive
for select
to public
using ((deleted_at IS NULL));


create policy "evaluations_club_board_access"
on "public"."evaluations"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = 'club_board'::user_role)))));


create policy "hide_deleted_owners"
on "public"."owners"
as permissive
for select
to public
using ((deleted_at IS NULL));


create policy "owners_club_board_access"
on "public"."owners"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = 'club_board'::user_role)))));


create policy "registrations_club_board_access"
on "public"."show_registrations"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = 'club_board'::user_role)))));


create policy "hide_deleted_shows"
on "public"."shows"
as permissive
for select
to public
using ((deleted_at IS NULL));


create policy "shows_club_board_access"
on "public"."shows"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = 'club_board'::user_role)))));


create policy "hide_deleted_users"
on "public"."users"
as permissive
for select
to public
using ((deleted_at IS NULL));


create policy "users_club_board_access"
on "public"."users"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM users users_1
  WHERE ((users_1.id = auth.uid()) AND (users_1.role = 'club_board'::user_role)))));



