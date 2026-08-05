
create or replace function public.get_admin_beta_metrics()
returns table (
  total_users bigint,
  candidate_accounts bigint,
  employer_accounts bigint,
  both_accounts bigint,
  open_candidates bigint,
  new_users_7d bigint,
  total_matches bigint,
  new_matches bigint,
  active_alerts bigint,
  unlocked_contacts bigint,
  free_unlocks bigint,
  paid_unlocks bigint,
  pending_unlocks bigint
)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Musisz być zalogowany.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles
    where profiles.id = current_user_id
      and profiles.is_admin is true
  ) then
    raise exception 'Brak uprawnień administratora.'
      using errcode = '42501';
  end if;

  return query
  select
    (
      select count(*)::bigint
      from public.profiles
    ) as total_users,
    (
      select count(*)::bigint
      from public.profiles
      where coalesce(profiles.account_type, 'candidate') =
        'candidate'
    ) as candidate_accounts,
    (
      select count(*)::bigint
      from public.profiles
      where profiles.account_type = 'employer'
    ) as employer_accounts,
    (
      select count(*)::bigint
      from public.profiles
      where profiles.account_type = 'both'
    ) as both_accounts,
    (
      select count(*)::bigint
      from public.profiles
      where coalesce(profiles.account_type, 'candidate') in
        ('candidate', 'both')
        and profiles.open_to_job_offers is true
    ) as open_candidates,
    (
      select count(*)::bigint
      from public.profiles
      where profiles.created_at >= now() - interval '7 days'
    ) as new_users_7d,
    (
      select count(*)::bigint
      from public.candidate_matches
    ) as total_matches,
    (
      select count(*)::bigint
      from public.candidate_matches
      where candidate_matches.status = 'new'
    ) as new_matches,
    (
      select count(*)::bigint
      from public.employer_alerts
      where employer_alerts.active is true
    ) as active_alerts,
    (
      select count(*)::bigint
      from public.contact_unlocks
      where contact_unlocks.status = 'unlocked'
    ) as unlocked_contacts,
    (
      select count(*)::bigint
      from public.contact_unlocks
      where contact_unlocks.status = 'unlocked'
        and contact_unlocks.unlock_method = 'free'
    ) as free_unlocks,
    (
      select count(*)::bigint
      from public.contact_unlocks
      where contact_unlocks.status = 'unlocked'
        and contact_unlocks.unlock_method = 'payment'
    ) as paid_unlocks,
    (
      select count(*)::bigint
      from public.contact_unlocks
      where contact_unlocks.status = 'pending'
    ) as pending_unlocks;
end;
$function$;

revoke all on function public.get_admin_beta_metrics()
from public;

grant execute
on function public.get_admin_beta_metrics()
to authenticated;