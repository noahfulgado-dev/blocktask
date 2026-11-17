-- ============================================================
-- BlockTask - 0006 class reminder
-- A single admin-editable reminder note per class, synced live
-- to every member through Supabase Realtime.
-- ============================================================

alter table public.classes
  add column if not exists reminder text;

-- Real RLS already covers this column:
--   * classes_select_members lets any class member read it.
--   * classes_update_admin lets only admins write it.

-- Realtime ------------------------------------------------
alter table public.classes replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'classes'
  ) then
    alter publication supabase_realtime add table public.classes;
  end if;
end $$;
