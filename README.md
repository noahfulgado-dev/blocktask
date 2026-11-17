# BlockTask

A shared task board for a CvSU block or section.

BlockTask gives every block one workspace where requirements, deadlines, and
group tasks live together. Sign-up is restricted to `@cvsu.edu.ph` addresses,
classes are joined with a short invite code, and the board updates live through
Supabase Realtime.

## Features

- **CvSU-only accounts** — email/password sign-up, enforced server-side by a
  Supabase `before_user_created` auth hook. The project owner's allowlisted
  Gmail account is also permitted.
- **Class workspaces** — create a class, invite blockmates with an 8-character
  code, and keep one board per block.
- **Admins and members** — admins manage members, roles, settings, and the
  invite code. Members get a board they can actually use.
- **Task board** — three columns (Pending, In progress, Done), assignees, due
  dates with overdue highlighting, and search.
- **Per-member completion** — everyone checks off their own part. The card shows
  who is done and `X of N`, and the task moves to Done automatically when every
  current member has completed it.
- **Live updates** — task edits, status changes, completions, and deletes appear
  for everyone in the class without a refresh.
- **Admin reminders** — a shared note box on the board that only admins can edit
  and everyone sees update live.
- **Row Level Security** — every table is protected in the database, so the
  anon key is safe in the browser. No service role key is used anywhere.

## Permissions

| Action | Admin | Member |
| --- | --- | --- |
| Change class settings / regenerate invite code | Yes | No |
| Edit the class reminder | Yes | No (read-only) |
| Delete the class | Creator only | No |
| Promote, demote, or remove members | Yes | No |
| Create tasks | Yes | If "members can add tasks" is on |
| Edit task title, details, assignee, due date | Yes | Own tasks, or any task if "members can edit any task" is on |
| Change task status | Yes | Own tasks and tasks assigned to them |
| Mark own completion | Yes | Yes (auto-Done when all current members are done) |
| Delete a task | Yes | Own tasks |
| Leave the class | Yes (unless last admin) | Yes |

## Stack

- Next.js 16 (App Router, Server Actions, Cache Components)
- React 19 + TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL, Auth, Row Level Security, Realtime)
- Radix UI primitives + `sonner` toasts + `lucide-react` icons

## Quick start

Requirements: Node.js 20+ and a Supabase project.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill in your Supabase project values:

   ```bash
   cp .env.local.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
   ```

3. Run the SQL migrations in `supabase/migrations/` in order (`0001` through
   `0006`) from the Supabase SQL Editor. Full instructions:
   **[SETUP-SUPABASE.md](./SETUP-SUPABASE.md)**.

4. Enable the signup hook:
   [SETUP-SUPABASE.md](./SETUP-SUPABASE.md) covers the hook, email settings,
   and redirect URLs.

5. Start the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
npx tsc --noEmit # type-check
```

## Project structure

```
app/
  (auth)/login, signup          auth pages
  auth/callback, auth/signout   email confirmation callback + logout
  dashboard                     list of the user's classes
  class/[classId]               task board
  class/[classId]/settings      admin settings, members, invite code, delete
  join/[code]                   invite-code landing page
  actions/                      server actions (classes, members)
components/                     UI, auth, class, tasks, members, settings
lib/                            Supabase clients, auth guards, types, helpers
proxy.ts                        session refresh + route protection
supabase/migrations/            schema, RPCs/RLS/realtime, signup hook
```

## Deploy

See **[SETUP-VERCEL.md](./SETUP-VERCEL.md)**. Remember to update Supabase's
Site URL and redirect URLs after the first deployment.
