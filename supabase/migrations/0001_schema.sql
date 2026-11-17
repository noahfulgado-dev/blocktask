-- ============================================================
-- BlockTask - 0001 schema
-- Shared task board for a block or section.
-- Run this in the Supabase SQL Editor or via `supabase db push`.
-- ============================================================

-- Enum types -------------------------------------------------
do $$
begin
  create type public.member_role as enum ('admin', 'member');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_status as enum ('pending', 'in_progress', 'done');
exception
  when duplicate_object then null;
end $$;

-- Utility: short, human friendly invite code ----------------
create or replace function public.generate_invite_code()
returns text
language sql
volatile
as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

-- Utility: keep updated_at in sync --------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles (1:1 with auth.users) ----------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Classes / block workspaces --------------------------------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  description text,
  invite_code text not null unique default public.generate_invite_code(),
  created_by uuid not null references auth.users(id) on delete cascade,
  allow_member_tasks boolean not null default true,
  allow_member_edit_tasks boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Membership + role -----------------------------------------
create table if not exists public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (class_id, user_id)
);

-- Tasks ------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text,
  status public.task_status not null default 'pending',
  assigned_to uuid references auth.users(id) on delete set null,
  due_date date,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes ----------------------------------------------------
create index if not exists class_members_class_id_idx on public.class_members (class_id);
create index if not exists class_members_user_id_idx on public.class_members (user_id);
create index if not exists classes_invite_code_idx on public.classes (invite_code);
create index if not exists classes_created_by_idx on public.classes (created_by);
create index if not exists tasks_class_id_idx on public.tasks (class_id);
create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);
create index if not exists tasks_status_idx on public.tasks (status);

-- updated_at triggers ---------------------------------------
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_classes_updated_at on public.classes;
create trigger trg_classes_updated_at
before update on public.classes
for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- Auto-create a profile whenever a user signs up ------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
