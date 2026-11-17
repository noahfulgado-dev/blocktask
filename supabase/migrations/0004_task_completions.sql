-- ============================================================
-- BlockTask - 0004 per-member task completion
-- Each class member can mark their own completion. When every
-- current member has checked off, the task moves to Done.
-- ============================================================

alter table public.tasks
  add column if not exists auto_completed boolean not null default false;

create table if not exists public.task_completions (
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null,
  class_id uuid not null,
  completed_at timestamptz not null default now(),
  primary key (task_id, user_id),
  foreign key (class_id, user_id)
    references public.class_members (class_id, user_id)
    on delete cascade
);

create index if not exists task_completions_class_id_idx
  on public.task_completions (class_id);
create index if not exists task_completions_user_id_idx
  on public.task_completions (user_id);

-- Always derive the class from the task, never from the client.
create or replace function public.set_completion_class_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
begin
  select class_id into v_class_id
  from public.tasks
  where id = new.task_id;

  if v_class_id is null then
    raise exception 'Task not found';
  end if;

  new.class_id := v_class_id;
  return new;
end;
$$;

drop trigger if exists trg_task_completions_class on public.task_completions;
create trigger trg_task_completions_class
before insert on public.task_completions
for each row execute function public.set_completion_class_id();

-- Keep the task status in sync with the checklist.
create or replace function public.task_completions_sync_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task_id uuid;
  v_class_id uuid;
  v_members int;
  v_completed int;
  v_auto boolean;
  v_status public.task_status;
begin
  if tg_op = 'DELETE' then
    v_task_id := old.task_id;
    v_class_id := old.class_id;
  else
    v_task_id := new.task_id;
    v_class_id := new.class_id;
  end if;

  select count(*) into v_members
  from public.class_members
  where class_id = v_class_id;

  select count(*) into v_completed
  from public.task_completions
  where task_id = v_task_id;

  select auto_completed, status into v_auto, v_status
  from public.tasks
  where id = v_task_id;

  -- The task may have been deleted by a cascade.
  if not found then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  perform set_config('blocktask.completion_sync', 'on', true);

  if v_members > 0 and v_completed >= v_members then
    if v_status <> 'done' or not v_auto then
      update public.tasks
      set status = 'done', auto_completed = true
      where id = v_task_id;
    end if;
  elsif v_auto and v_status = 'done' then
    update public.tasks
    set status = 'in_progress', auto_completed = false
    where id = v_task_id;
  end if;

  perform set_config('blocktask.completion_sync', 'off', true);

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_task_completions_sync on public.task_completions;
create trigger trg_task_completions_sync
after insert or delete on public.task_completions
for each row execute function public.task_completions_sync_status();

-- A manual status change should turn off the auto-completion flag.
create or replace function public.tasks_clear_auto_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status
    and coalesce(current_setting('blocktask.completion_sync', true), 'off') <> 'on'
  then
    new.auto_completed := false;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_tasks_clear_auto_completed on public.tasks;
create trigger trg_tasks_clear_auto_completed
before update on public.tasks
for each row execute function public.tasks_clear_auto_completed();

-- Allow the completion sync trigger to update the task status even
-- when the current user could not change it directly.
create or replace function public.tasks_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(current_setting('blocktask.completion_sync', true), 'off') = 'on' then
    return new;
  end if;

  if public.is_class_admin(old.class_id)
    or old.created_by = auth.uid()
    or public.class_allows_member_edit_tasks(old.class_id)
  then
    return new;
  end if;

  if old.assigned_to = auth.uid() then
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

-- Row Level Security -----------------------------------------
alter table public.task_completions enable row level security;

drop policy if exists "task_completions_select_members" on public.task_completions;
create policy "task_completions_select_members"
on public.task_completions for select
to authenticated
using (public.is_class_member(class_id));

drop policy if exists "task_completions_insert_self" on public.task_completions;
create policy "task_completions_insert_self"
on public.task_completions for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_class_member(class_id)
);

drop policy if exists "task_completions_delete_self" on public.task_completions;
create policy "task_completions_delete_self"
on public.task_completions for delete
to authenticated
using (
  user_id = auth.uid()
  and public.is_class_member(class_id)
);

grant select, insert, delete on public.task_completions to authenticated;
revoke all on public.task_completions from anon;

-- Realtime ----------------------------------------------------
alter table public.task_completions replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'task_completions'
  ) then
    alter publication supabase_realtime add table public.task_completions;
  end if;
end $$;
