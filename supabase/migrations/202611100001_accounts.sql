-- GeoKiwi account foundation. Scores here are private save data, never ranked results.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(btrim(display_name)) between 2 and 24 and display_name !~ '[[:cntrl:]]'),
 created_at timestamptz not null default now()
);
create table public.game_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(snapshot)='object' and octet_length(snapshot::text)<=2097152),
 revision bigint not null default 1 check (revision>0),
 updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.game_progress enable row level security;
revoke all on public.profiles,public.game_progress from anon,authenticated;
grant select on public.profiles,public.game_progress to authenticated;
grant insert(id,display_name),update(display_name) on public.profiles to authenticated;
create policy profiles_read_own on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid())=id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy progress_read_own on public.game_progress for select to authenticated using ((select auth.uid())=user_id);
-- No direct client INSERT/UPDATE/DELETE grant on game_progress. This RPC implements CAS.
create function public.save_game_progress(p_user_id uuid,p_snapshot jsonb,p_expected_revision bigint)
returns table(revision bigint)
language plpgsql security definer set search_path=''
as $$
begin
 if p_user_id is null or auth.uid() is null or auth.uid()<>p_user_id then raise exception 'Not authorized' using errcode='42501';end if;
 if p_expected_revision is null or p_expected_revision<0 or p_snapshot is null or jsonb_typeof(p_snapshot)<>'object' or octet_length(p_snapshot::text)>2097152 then raise exception 'Invalid progress';end if;
 if exists(select 1 from jsonb_each(p_snapshot) as entry where jsonb_typeof(entry.value)<>'string' or char_length(entry.key)>200) then raise exception 'Invalid progress values';end if;
 if (select count(*) from jsonb_object_keys(p_snapshot))>200 then raise exception 'Too many progress keys';end if;
 if p_expected_revision=0 then
  return query insert into public.game_progress as gp(user_id,snapshot) values(p_user_id,p_snapshot)
    on conflict(user_id) do nothing returning gp.revision;
 else
  return query update public.game_progress as gp set snapshot=p_snapshot,revision=gp.revision+1,updated_at=now()
    where gp.user_id=p_user_id and gp.revision=p_expected_revision returning gp.revision;
 end if;
end;
$$;
revoke all on function public.save_game_progress(uuid,jsonb,bigint) from public,anon;
grant execute on function public.save_game_progress(uuid,jsonb,bigint) to authenticated;
commit;
