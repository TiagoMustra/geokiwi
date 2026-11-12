-- Private profile photos and trusted daily-completion history. No client score writes.
begin;
alter table public.profiles add column avatar_path text;
alter table public.profiles add constraint profile_avatar_owned
 check (avatar_path is null or avatar_path = id::text || '/avatar.webp');
grant update(avatar_path) on public.profiles to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('avatars','avatars',false,524288,array['image/webp']);
create policy avatar_read_own on storage.objects for select to authenticated
 using(bucket_id='avatars' and name=(select auth.uid())::text||'/avatar.webp');
create policy avatar_insert_own on storage.objects for insert to authenticated
 with check(bucket_id='avatars' and name=(select auth.uid())::text||'/avatar.webp');
create policy avatar_update_own on storage.objects for update to authenticated
 using(bucket_id='avatars' and name=(select auth.uid())::text||'/avatar.webp')
 with check(bucket_id='avatars' and name=(select auth.uid())::text||'/avatar.webp');
create policy avatar_delete_own on storage.objects for delete to authenticated
 using(bucket_id='avatars' and name=(select auth.uid())::text||'/avatar.webp');

-- A future daily game must verify a completed attempt on the server before inserting.
-- Game saves and account metadata are never used as proof of daily completion.
create table public.daily_completions (
 user_id uuid not null references auth.users(id) on delete cascade,
 challenge_date date not null default (now() at time zone 'UTC')::date,
 completed_at timestamptz not null default now(),
 primary key(user_id,challenge_date),
 constraint daily_not_future check(challenge_date <= (now() at time zone 'UTC')::date)
);
alter table public.daily_completions enable row level security;
revoke all on public.daily_completions from public,anon,authenticated;
grant select on public.daily_completions to authenticated;
grant all on public.daily_completions to service_role;
create policy daily_read_own on public.daily_completions for select to authenticated
 using(user_id=(select auth.uid()));

create function public.get_my_daily_streak()
returns table(current_streak integer,best_streak integer,last_completed_date date)
language sql stable security invoker set search_path=''
as $$
 with days as (
  select challenge_date,challenge_date+(row_number() over(order by challenge_date desc))::integer as consecutive_group
  from public.daily_completions where user_id=(select auth.uid())
 ), runs as (
  select count(*)::integer as length,max(challenge_date) as last_day from days group by consecutive_group
 )
 select coalesce(max(length) filter(where last_day >= (now() at time zone 'UTC')::date-1),0),
 coalesce(max(length),0),max(last_day) from runs;
$$;
revoke all on function public.get_my_daily_streak() from public,anon;
grant execute on function public.get_my_daily_streak() to authenticated;
commit;
