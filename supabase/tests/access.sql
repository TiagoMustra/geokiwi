-- Run with a privileged SQL connection AFTER the migration. All fixtures roll back.
begin;
insert into auth.users(id,email) values
 ('11111111-1111-4111-8111-111111111111','account-a@example.invalid'),
 ('22222222-2222-4222-8222-222222222222','account-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
insert into public.profiles(id,display_name) values('11111111-1111-4111-8111-111111111111','Kiwi A');
do $$
begin
 if (select count(*) from public.save_game_progress('11111111-1111-4111-8111-111111111111','{"geokiwi.stadium.record.v1":"100"}',0))<>1 then raise exception 'Initial write failed';end if;
 if (select count(*) from public.save_game_progress('11111111-1111-4111-8111-111111111111','{}',0))<>0 then raise exception 'Duplicate revision accepted';end if;
 if (select revision from public.save_game_progress('11111111-1111-4111-8111-111111111111','{"geokiwi.stadium.record.v1":"200"}',1))<>2 then raise exception 'CAS update failed';end if;
 if (select count(*) from public.game_progress)<>1 then raise exception 'Own snapshot not readable';end if;
 update public.profiles set display_name='Kiwi editado' where id='11111111-1111-4111-8111-111111111111';
 if (select display_name from public.profiles)<>'Kiwi editado' then raise exception 'Own name update failed';end if;
 if (select count(*) from public.save_game_progress('11111111-1111-4111-8111-111111111111','{}',1))<>0 then raise exception 'Stale update accepted';end if;
 begin
  perform public.save_game_progress('22222222-2222-4222-8222-222222222222','{}',0);
  raise exception 'Cross-account RPC accepted';
 exception when insufficient_privilege then null;end;
 begin
  insert into public.profiles(id,display_name) values('22222222-2222-4222-8222-222222222222','Other user');
  raise exception 'Cross-account profile insertion accepted';
 exception when insufficient_privilege then null;end;
 begin
  update public.game_progress set snapshot='{}';
  raise exception 'Direct update accepted';
 exception when insufficient_privilege then null;end;
 begin
  update public.profiles set id='22222222-2222-4222-8222-222222222222';
  raise exception 'Owner reassignment accepted';
 exception when insufficient_privilege then null;end;
end;
$$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$begin
 if (select count(*) from public.profiles)<>0 then raise exception 'Another profile is readable';end if;
 if (select count(*) from public.game_progress)<>0 then raise exception 'Another snapshot is readable';end if;
end;$$;
set local role anon;
do $$begin
 begin
  perform * from public.game_progress;
  raise exception 'Anonymous read accepted';
 exception when insufficient_privilege then null;end;
 begin
  perform public.save_game_progress('11111111-1111-4111-8111-111111111111','{}',0);
  raise exception 'Anonymous RPC accepted';
 exception when insufficient_privilege then null;end;
end;$$;
rollback;
