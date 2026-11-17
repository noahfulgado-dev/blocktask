# Connecting Supabase

This guide takes you from an empty Supabase account to a working local
BlockTask install. Do the steps in order.

## 1. Create the Supabase project

1. Go to https://supabase.com/dashboard and create a new project.
2. Pick a name (for example `blocktask`), a strong database password, and the
   region closest to you.
3. Wait for provisioning to finish.

## 2. Copy the API keys into `.env.local`

1. Open **Project Settings → API**.
2. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public** key
3. In the project folder, copy `.env.local.example` to `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

4. Paste the values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

> Never put the `service_role` key in this app. BlockTask only needs the anon
> key because Row Level Security enforces every rule in the database.

Restart `npm run dev` after changing env values.

## 3. Run the migrations

In the Supabase dashboard, open **SQL Editor** and run these files in order.
Run each file as a separate query, and wait for each to finish before starting
the next one.

1. `supabase/migrations/0001_schema.sql`
   - Enums, tables (`profiles`, `classes`, `class_members`, `tasks`), indexes,
     `updated_at` triggers, and the `handle_new_user` trigger that creates a
     profile after sign-up.
2. `supabase/migrations/0002_functions_rls.sql`
   - Helper functions, RPCs (`create_class`, `preview_class_by_code`,
     `join_class_by_code`, `set_member_role`, `remove_member`,
     `regenerate_invite_code`), Row Level Security policies, guards, function
     grants, and Realtime publication for `tasks` and `class_members`.
3. `supabase/migrations/0003_auth_hook.sql`
   - The `hook_restrict_signup_by_email_domain` function and its grants.
4. `supabase/migrations/0004_task_completions.sql`
   - The `task_completions` table, per-member completion policies, automatic
     Done/undo status sync, `tasks.auto_completed`, and Realtime for
     completions. Run this after `0002` because it replaces `tasks_guard`.
5. `supabase/migrations/0005_allowlisted_email.sql`
   - Keeps the CvSU-only hook, but allows `zeqdev.1@gmail.com` to sign up too.
6. `supabase/migrations/0006_class_reminder.sql`
   - Adds the shared `classes.reminder` text and Realtime for `classes`, so
     admin reminders appear live for every member.
7. `supabase/migrations/0007_public_invite_preview.sql`
   - Lets signed-out visitors preview a class from its invite code so shared
     invite links can show the class name and Open Graph image before login.

### Optional: use the Supabase CLI instead

If you have the Supabase CLI installed and linked to your project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

`supabase/config.toml` already declares the auth hook for local development.

## 4. Enable the signup restriction hook

This is the part that makes sign-up CvSU-only. It applies to email/password
sign-ups. The allowlisted account `zeqdev.1@gmail.com` is exempt.

1. Open **Authentication → Hooks** (in some dashboard versions this is
   **Authentication → Auth Hooks**).
2. Find **Before User Created** and choose **Postgres** as the hook type.
3. Select the function `public.hook_restrict_signup_by_email_domain`.
4. Save and enable the hook.

The function rejects any email whose domain is not exactly `cvsu.edu.ph` with
the message:

> Only @cvsu.edu.ph emails are allowed to sign up.

The app also checks the domain in the sign-up form, but the hook is the actual
security boundary.

If the function does not appear in the list, run this in the SQL Editor and try
again:

```sql
notify pgrst, 'reload schema';
```

### Troubleshooting the hook

- **Sign-up fails with "Database error saving new user"** — the hook is enabled
  but the grants did not run. Re-run `0003_auth_hook.sql`.
- **Non-CvSU emails can still sign up** — the hook is not enabled, or the wrong
  function was selected.

## 5. Configure email and redirect URLs

1. Open **Authentication → Providers → Email**.
2. Make sure Email is enabled.
3. Decide whether to require email confirmation:
   - **Enabled (recommended):** users get a confirmation link before their first
     login. BlockTask shows a "check your inbox" screen after sign-up.
   - **Disabled:** users are signed in immediately after sign-up.
4. Open **Authentication → URL Configuration**.
5. Set:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** add `http://localhost:3000/auth/callback`
6. If you keep confirmation enabled, Supabase's built-in email sender is rate
   limited and meant for testing. For real use, configure custom SMTP in
   **Authentication → Emails / SMTP Settings**.

The `emailRedirectTo` used by the app is:

```
http://localhost:3000/auth/callback?next=/dashboard
```

Supabase matches it against the allowed redirect URLs, so the exact URL must be
covered by the entries above.

## 6. Verify everything

1. Restart the dev server.
2. Open http://localhost:3000 and go to **Sign up**.
3. Try a non-CvSU address first (for example a random Gmail). You should see
   "Only @cvsu.edu.ph emails are allowed to sign up."
4. Sign up with a `@cvsu.edu.ph` address or the allowlisted
   `zeqdev.1@gmail.com`, then confirm the email.
5. Log in, create a class, and copy its invite code.
6. Open the invite link or use **Join class** with a second account.
7. Add a task in one browser and watch it appear in the other.
8. Mark your completion in each browser. The card should show `X of N`, and the
   task should move to Done automatically when the last current member checks
   off. Uncheck to move it back to In progress.

## What the migrations set up

- `profiles` mirrors `auth.users` and is filled by a trigger on sign-up.
- `classes` holds the workspace, invite code, two permission flags, and the
  shared admin reminder shown on the board.
- `class_members` links users to classes with an `admin` or `member` role.
- `tasks` holds the board items.
- `task_completions` stores each member's own check-off; a trigger moves the task
  to Done when every current member is complete and back to In progress when an
  auto-completed check is undone.
- RLS allows reads only for class members, and writes through the rules shown in
  the README permission table.
- Inserts into `classes` and `class_members` are not allowed directly; they go
  through security-definer RPCs so roles and invite codes cannot be forged.
- `class_members_guard` prevents removing or demoting the last admin.
- `tasks_guard` limits assigned members to changing only the task status.
- The signup hook accepts `@cvsu.edu.ph` addresses plus the allowlisted
  `zeqdev.1@gmail.com` account.
