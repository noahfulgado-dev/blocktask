-- ============================================================
-- BlockTask - 0003 signup domain restriction
--
-- Only @cvsu.edu.ph email addresses may create an account.
-- This is enforced server-side by the "Before User Created" auth
-- hook.
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

  if domain <> 'cvsu.edu.ph' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'Only @cvsu.edu.ph emails are allowed to sign up.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

-- The auth server needs usage on the schema and execute on the hook.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_restrict_signup_by_email_domain(jsonb) to supabase_auth_admin;

revoke execute on function public.hook_restrict_signup_by_email_domain(jsonb)
  from authenticated, anon, public;
