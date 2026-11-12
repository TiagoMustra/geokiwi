-- Run after 202611120001_profile_daily.sql. All fixtures roll back.
begin;
insert into auth.users(id,email) values
 ('91111111-1111-4111-8111-111111111111','profile-a@example.invalid'),
 ('92222222-2222-4222-8222-222222222222','profile-b@example.invalid'),
 ('93333333-3333-4333-8333-333333333333','profile-c@example.invalid');
insert into public.daily_completions(user_id,challenge_date)
 select '91111111-1111-4111-8111-111111111111'::uuid,(now() at time zone 'UTC')::date-n from generate_series(0,7) n
 union all select '91111111-1111-4111-8111-111111111111'::uuid,(now() at time zone 'UTC')::date-n from generate_series(30,49) n
 union all select '92222222-2222-4222-8222-222222222222'::uuid,(now() at time zone 'UTC')::date-n from generate_series(1,15) n
 union all select '93333333-3333-4333-8333-333333333333'::uuid,(now() at time zone 'UTC')::date-n from generate_series(2,4) n;
do $$begin
 begin
  insert into public.daily_completions(user_id,challenge_date) values('91111111-1111-4111-8111-111111111111',(now() at time zone 'UTC')::date);
  raise exception 'Same day counted twice';
 exception when unique_violation then null;end;
 begin
  insert into public.daily_completions(user_id,challenge_date) values('91111111-1111-4111-8111-111111111111',(now() at time zone 'UTC')::date+1);
  raise exception 'Future completion accepted';
 exception when check_violation then null;end;
end;$$;
set local role authenticated;
select set_config('request.jwt.claim.sub','91111111-1111-4111-8111-111111111111',true);
insert into public.profiles(id,display_name) values('91111111-1111-4111-8111-111111111111','Profile test');
update public.profiles set avatar_path='91111111-1111-4111-8111-111111111111/avatar.webp' where id='91111111-1111-4111-8111-111111111111';
insert into storage.objects(bucket_id,name) values('avatars','91111111-1111-4111-8111-111111111111/avatar.webp');
do $$begin
 if (select current_streak from public.get_my_daily_streak())<>8 then raise exception 'Active streak incorrect';end if;
 if (select best_streak from public.get_my_daily_streak())<>20 then raise exception 'Best streak incorrect';end if;
 if (select count(*) from public.daily_completions)<>28 then raise exception 'Daily isolation failed';end if;
 begin
  update public.profiles set avatar_path='92222222-2222-4222-8222-222222222222/avatar.webp' where id='91111111-1111-4111-8111-111111111111';
  raise exception 'Another user photo linked';
 exception when check_violation then null;end;
 begin
  insert into storage.objects(bucket_id,name) values('avatars','92222222-2222-4222-8222-222222222222/avatar.webp');
  raise exception 'Another user photo overwritten';
 exception when insufficient_privilege then null;end;
 begin
  insert into public.daily_completions(user_id) values('91111111-1111-4111-8111-111111111111');
  raise exception 'Client forged daily completion';
 exception when insufficient_privilege then null;end;
 begin
  delete from public.daily_completions where user_id='91111111-1111-4111-8111-111111111111';
  raise exception 'Client changed daily history';
 exception when insufficient_privilege then null;end;
end;$$;
select set_config('request.jwt.claim.sub','92222222-2222-4222-8222-222222222222',true);
do $$begin
 if (select current_streak from public.get_my_daily_streak())<>15 then raise exception 'Yesterday grace incorrect';end if;
 if exists(select 1 from storage.objects where bucket_id='avatars') then raise exception 'Another photo readable';end if;
 if exists(select 1 from public.profiles) then raise exception 'Another profile readable';end if;
end;$$;
select set_config('request.jwt.claim.sub','93333333-3333-4333-8333-333333333333',true);
do $$begin
 if (select current_streak from public.get_my_daily_streak())<>0 then raise exception 'Broken streak still active';end if;
 if (select best_streak from public.get_my_daily_streak())<>3 then raise exception 'Broken streak lost best';end if;
end;$$;
set local role anon;
do $$begin
 begin
  perform * from public.get_my_daily_streak();raise exception 'Anonymous streak RPC allowed';
 exception when insufficient_privilege then null;end;
end;$$;
rollback;
select 'PASS: avatar ownership, private photos, weekly streaks, gaps, duplicate dates and server-only completions' as result;
