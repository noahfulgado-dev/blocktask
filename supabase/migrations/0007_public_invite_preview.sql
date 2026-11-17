create or replace function public.preview_class_by_code(p_code text)
returns table (id uuid, name text, description text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select c.id, c.name, c.description
    from public.classes c
    where upper(c.invite_code) = upper(trim(p_code))
    limit 1;
end;
$$;

grant usage on schema public to anon;
grant execute on function public.preview_class_by_code(text) to anon, authenticated;
