-- ============================================================
-- BlockTask - 0002 helper functions, RPCs, RLS, realtime
-- ============================================================

-- ------------------------------------------------------------
-- Helper functions (security definer avoids RLS recursion)
-- ------------------------------------------------------------
create or replace function public.is_class_member(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_members
    where class_id = p_class_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_class_admin(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_members
    where class_id = p_class_id
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.class_allows_member_tasks(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select allow_member_tasks from public.classes where id = p_class_id),
    false
  );
$$;

create or replace function public.class_allows_member_edit_tasks(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select allow_member_edit_tasks from public.classes where id = p_class_id),
    false
  );
$$;

create or replace function public.shares_class(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_members me
    join public.class_members them on them.class_id = me.class_id
    where me.user_id = auth.uid()
      and them.user_id = p_user_id
  );
$$;

-- ------------------------------------------------------------
-- Guard: never leave a class without an admin
-- ------------------------------------------------------------
create or replace function public.class_members_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count int;
  parent_exists boolean;
begin
  if tg_op = 'DELETE' then
    select exists (select 1 from public.classes where id = old.class_id) into parent_exists;
    -- Parent class is being deleted (cascade) - allow the delete.
    if not parent_exists then
      return old;
    end if;

    if old.role = 'admin' then
      select count(*) into admin_count
      from public.class_members
      where class_id = old.class_id and role = 'admin';

      if admin_count <= 1 then
        raise exception 'Cannot remove the last admin of this class';
      end if;
    end if;

    return old;
  end if;

  if new.class_id <> old.class_id or new.user_id <> old.user_id then
    raise exception 'Membership class and user cannot be changed';
  end if;

  if old.role = 'admin' and new.role <> 'admin' then
    select count(*) into admin_count
    from public.class_members
    where class_id = old.class_id and role = 'admin';

    if admin_count <= 1 then
      raise exception 'Cannot demote the last admin of this class';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_class_members_guard on public.class_members;
create trigger trg_class_members_guard
before update or delete on public.class_members
for each row execute function public.class_members_guard();

-- ------------------------------------------------------------
-- Guard: assigned members may only change a task's status
-- (admins, creators, and classes that allow member edits can
-- change everything). RLS already filters who may update rows.
-- ------------------------------------------------------------
create or replace function public.tasks_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_class_admin(old.class_id)
    or old.created_by = auth.uid()
    or public.class_allows_member_edit_tasks(old.class_id)
  then
    return new;
  end if;

  if old.assigned_to = auth.uid() then
    -- Only the status field may differ.
    if new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.assigned_to is distinct from old.assigned_to
      or new.due_date is distinct from old.due_date
      or new.class_id is distinct from old.class_id
      or new.created_by is distinct from old.created_by
    then
      raise exception 'Assigned members can only change the task status';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_tasks_guard on public.tasks;
create trigger trg_tasks_guard
before update on public.tasks
for each row execute function public.tasks_guard();

-- ------------------------------------------------------------
-- RPC: create a class and make the creator an admin
-- ------------------------------------------------------------
create or replace function public.create_class(
  p_name text,
  p_description text default null,
  p_allow_member_tasks boolean default true,
  p_allow_member_edit_tasks boolean default false
)
returns public.classes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_class public.classes;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if p_name is null or char_length(trim(p_name)) = 0 then
    raise exception 'Class name is required';
  end if;

  insert into public.classes (
    name,
    description,
    created_by,
    allow_member_tasks,
    allow_member_edit_tasks
  )
  values (
    trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    v_user,
    coalesce(p_allow_member_tasks, true),
    coalesce(p_allow_member_edit_tasks, false)
  )
  returning * into v_class;

  insert into public.class_members (class_id, user_id, role)
  values (v_class.id, v_user, 'admin');

  return v_class;
end;
$$;

-- ------------------------------------------------------------
-- RPC: preview a class from its invite code
-- ------------------------------------------------------------
create or replace function public.preview_class_by_code(p_code text)
returns table (id uuid, name text, description text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  return query
    select c.id, c.name, c.description
    from public.classes c
    where upper(c.invite_code) = upper(trim(p_code))
    limit 1;
end;
$$;

-- ------------------------------------------------------------
-- RPC: join a class with an invite code
-- ------------------------------------------------------------
create or replace function public.join_class_by_code(p_code text)
returns public.classes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_class public.classes;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_class
  from public.classes
  where upper(invite_code) = upper(trim(p_code));

  if not found then
    raise exception 'Invalid invite code';
  end if;

  insert into public.class_members (class_id, user_id, role)
  values (v_class.id, v_user, 'member')
  on conflict (class_id, user_id) do nothing;

  return v_class;
end;
$$;

-- ------------------------------------------------------------
-- RPC: change a member role (admin only)
-- ------------------------------------------------------------
create or replace function public.set_member_role(
  p_class_id uuid,
  p_user_id uuid,
  p_role public.member_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_class_admin(p_class_id) then
    raise exception 'Only admins can change roles';
  end if;

  update public.class_members
  set role = p_role
  where class_id = p_class_id and user_id = p_user_id;

  if not found then
    raise exception 'Member not found';
  end if;
end;
$$;

-- ------------------------------------------------------------
-- RPC: remove a member (admin can remove others, anyone can leave)
-- ------------------------------------------------------------
create or replace function public.remove_member(p_class_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean := public.is_class_admin(p_class_id);
  v_is_self boolean := (p_user_id = auth.uid());
begin
  if not v_is_admin and not v_is_self then
    raise exception 'Not allowed to remove this member';
  end if;

  delete from public.class_members
  where class_id = p_class_id and user_id = p_user_id;

  if not found then
    raise exception 'Member not found';
  end if;
end;
$$;

-- ------------------------------------------------------------
-- RPC: regenerate the invite code (admin only)
-- ------------------------------------------------------------
create or replace function public.regenerate_invite_code(p_class_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  if not public.is_class_admin(p_class_id) then
    raise exception 'Only admins can regenerate the invite code';
  end if;

  v_code := public.generate_invite_code();

  update public.classes
  set invite_code = v_code
  where id = p_class_id;

  return v_code;
end;
$$;

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.tasks enable row level security;

-- profiles ---------------------------------------------------
drop policy if exists "profiles_select_self_or_shared" on public.profiles;
create policy "profiles_select_self_or_shared"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.shares_class(id));

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- classes ----------------------------------------------------
drop policy if exists "classes_select_members" on public.classes;
create policy "classes_select_members"
on public.classes for select
to authenticated
using (public.is_class_member(id));

drop policy if exists "classes_update_admin" on public.classes;
create policy "classes_update_admin"
on public.classes for update
to authenticated
using (public.is_class_admin(id))
with check (public.is_class_admin(id));

drop policy if exists "classes_delete_creator" on public.classes;
create policy "classes_delete_creator"
on public.classes for delete
to authenticated
using (created_by = auth.uid());

-- class_members ----------------------------------------------
drop policy if exists "class_members_select_members" on public.class_members;
create policy "class_members_select_members"
on public.class_members for select
to authenticated
using (public.is_class_member(class_id));

drop policy if exists "class_members_delete_self_or_admin" on public.class_members;
create policy "class_members_delete_self_or_admin"
on public.class_members for delete
to authenticated
using (user_id = auth.uid() or public.is_class_admin(class_id));

-- tasks ------------------------------------------------------
drop policy if exists "tasks_select_members" on public.tasks;
create policy "tasks_select_members"
on public.tasks for select
to authenticated
using (public.is_class_member(class_id));

drop policy if exists "tasks_insert_allowed" on public.tasks;
create policy "tasks_insert_allowed"
on public.tasks for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    public.is_class_admin(class_id)
    or (
      public.is_class_member(class_id)
      and public.class_allows_member_tasks(class_id)
    )
  )
);

drop policy if exists "tasks_update_allowed" on public.tasks;
create policy "tasks_update_allowed"
on public.tasks for update
to authenticated
using (
  public.is_class_admin(class_id)
  or created_by = auth.uid()
  or assigned_to = auth.uid()
  or (
    public.is_class_member(class_id)
    and public.class_allows_member_edit_tasks(class_id)
  )
)
with check (
  public.is_class_admin(class_id)
  or created_by = auth.uid()
  or assigned_to = auth.uid()
  or (
    public.is_class_member(class_id)
    and public.class_allows_member_edit_tasks(class_id)
  )
);

drop policy if exists "tasks_delete_allowed" on public.tasks;
create policy "tasks_delete_allowed"
on public.tasks for delete
to authenticated
using (public.is_class_admin(class_id) or created_by = auth.uid());

-- ------------------------------------------------------------
-- Realtime
-- ------------------------------------------------------------
alter table public.tasks replica identity full;
alter table public.class_members replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'class_members'
  ) then
    alter publication supabase_realtime add table public.class_members;
  end if;
end $$;

-- ------------------------------------------------------------
-- Function permissions
-- ------------------------------------------------------------
grant usage on schema public to authenticated;

-- helper functions
grant execute on function public.is_class_member(uuid) to authenticated;
grant execute on function public.is_class_admin(uuid) to authenticated;
grant execute on function public.class_allows_member_tasks(uuid) to authenticated;
grant execute on function public.class_allows_member_edit_tasks(uuid) to authenticated;
grant execute on function public.shares_class(uuid) to authenticated;

revoke execute on function public.is_class_member(uuid) from anon, public;
revoke execute on function public.is_class_admin(uuid) from anon, public;
revoke execute on function public.class_allows_member_tasks(uuid) from anon, public;
revoke execute on function public.class_allows_member_edit_tasks(uuid) from anon, public;
revoke execute on function public.shares_class(uuid) from anon, public;

-- RPCs
grant execute on function public.create_class(text, text, boolean, boolean) to authenticated;
grant execute on function public.preview_class_by_code(text) to authenticated;
grant execute on function public.join_class_by_code(text) to authenticated;
grant execute on function public.set_member_role(uuid, uuid, public.member_role) to authenticated;
grant execute on function public.remove_member(uuid, uuid) to authenticated;
grant execute on function public.regenerate_invite_code(uuid) to authenticated;

revoke execute on function public.create_class(text, text, boolean, boolean) from anon, public;
revoke execute on function public.preview_class_by_code(text) from anon, public;
revoke execute on function public.join_class_by_code(text) from anon, public;
revoke execute on function public.set_member_role(uuid, uuid, public.member_role) from anon, public;
revoke execute on function public.remove_member(uuid, uuid) from anon, public;
revoke execute on function public.regenerate_invite_code(uuid) from anon, public;
