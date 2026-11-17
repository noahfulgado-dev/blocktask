# Deploying to Vercel

BlockTask is a standard Next.js app and runs on Vercel with no special server
setup. The database, auth, and realtime all live in Supabase.

## 1. Push the project to GitHub

Create a repository and push this folder. `.env.local` is ignored, so your keys
are not committed.

```bash
git init
git add .
git commit -m "Initial BlockTask"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/blocktask.git
git push -u origin main
```

## 2. Import the repo in Vercel

1. Go to https://vercel.com/new and import the repository.
2. Framework preset: **Next.js** (usually detected automatically).
3. Leave the build command as `next build` and the output settings as default.
4. Before clicking Deploy, add environment variables.

## 3. Add environment variables

Add these for **Production**, **Preview**, and **Development**:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon/public key |

Do **not** add a service role key. The app never uses one.

`NEXT_PUBLIC_*` values are baked into the client bundle at build time, so they
must exist before the build runs. If you change them later, trigger a new
deployment.

## 4. Deploy and note the URL

Click **Deploy**. When it finishes, copy the production URL, for example
`https://blocktask.vercel.app`.

## 5. Update Supabase URLs

In **Authentication → URL Configuration**:

- **Site URL:** `https://blocktask.vercel.app`
- **Redirect URLs:** add
  - `https://blocktask.vercel.app/auth/callback`
  - `https://*-YOUR_TEAM.vercel.app/auth/callback` if you want preview
    deployments to support login (Supabase supports `*` wildcards)

Keep the localhost entries if you still develop locally.

## 6. Verify in production

1. Open the Vercel URL.
2. Sign up with a `@cvsu.edu.ph` email. With email confirmation enabled, the
   link should return you to the Vercel domain.
3. Log in, create a class, and open the board.
4. Add a task from one browser and confirm it appears in another.
5. Mark a completion from two accounts and confirm the `X of N` count updates
   live and the task auto-moves to Done.
6. Confirm a non-CvSU email is rejected.

## Custom domain

If you add a custom domain in Vercel:

1. Update **Site URL** and **Redirect URLs** in Supabase to the custom domain.
2. Redeploy if you also changed environment variables.

## Troubleshooting

- **Login redirects to localhost** — the Supabase Site URL or redirect URL list
  still points at localhost. Update both and redeploy if needed.
- **Env changes do not apply** — `NEXT_PUBLIC_*` values are compiled in. Redeploy
  after changing them.
- **Proxy/session issues** — BlockTask uses `proxy.ts` (Next.js 16's replacement
  for `middleware.ts`). Vercel runs it automatically; no extra configuration is
  required.
