-- ============================================================
-- BlockTask - 0005 allowlisted account
--
-- Keep the @cvsu.edu.ph restriction, but allow the project
-- owner's Gmail account to sign up as well.
-- ============================================================

create or replace function public.hook_restrict_signup_by_email_domain(event jsonb)
returns jsonb
language plpgsql
as $$
declare
  email text;
  domain text;
begin
  email := lower(coalesce(event -> 'user' ->> 'email', ''));
  domain := split_part(email, '@', 2);

  if email = 'zeqdev.1@gmail.com' or domain = 'cvsu.edu.ph' then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 400,
      'message', 'Only @cvsu.edu.ph emails are allowed to sign up.'
    )
  );
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_restrict_signup_by_email_domain(jsonb) to supabase_auth_admin;

revoke execute on function public.hook_restrict_signup_by_email_domain(jsonb)
  from authenticated, anon, public;
