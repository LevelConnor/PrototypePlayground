# Prototype Hub

A small Next.js app that lets your content team paste vibe-coded HTML, get a
public URL in ~60 seconds, and have it auto-logged in your Notion hub.

```
Submitter
   │
   ▼
[ This app ]  ──────►  GitHub commit  ──►  Vercel auto-deploy  ──►  /p/{slug}
   │
   └──►  Notion API: new row in the Prototype Hub database
```

One repo, one Vercel project. The submission UI lives at `/`. Submitted
prototypes live at `/p/{slug}` (e.g. `prototypes.your-domain.com/p/live-college-match-feedback`).

---

## What you'll need

- A GitHub account that can create a repo
- A Vercel account (free tier is fine to start)
- A Notion workspace with the Prototype Hub database already set up
- Node 20+ locally (only needed if you want to run the app on your machine)

Total setup time: ~30 minutes if it's your first time, ~10 minutes thereafter.

---

## Step 1 — Create the GitHub repo

1. Create a new private repo, e.g. `levelall/prototype-hub`.
2. Drop these files in (clone the repo, copy them in, commit, push). Or
   create the repo from this folder with `git init && git remote add origin
   ... && git push -u origin main`.

The `public/prototypes/` folder is where every submitted prototype will live
as `index.html`. It starts empty (with a `.gitkeep`) — that's fine.

---

## Step 2 — Create a GitHub token

You need a token the app uses to commit files on submitters' behalf.

**Easiest option (personal access token):**

1. Go to https://github.com/settings/tokens
2. Click *Generate new token (classic)*
3. Scope: `repo` (full control of private repos)
4. Name: "Prototype Hub commits"
5. Copy the token. You'll paste it into Vercel as `GITHUB_TOKEN`.

**Tighter option (fine-grained token):** scope it to just the prototype-hub
repo with `Contents: Read and write` permission. Same env var.

The token is acting on behalf of *the app*, not any individual person. All
commits will appear under your account. That's fine — the Notion entry
records the actual submitter.

---

## Step 3 — Create the Notion integration

1. Go to https://www.notion.so/profile/integrations
2. Click *New integration*. Name: "Prototype Hub". Type: Internal.
3. Under "Capabilities", check *Insert content*. (Read/Update aren't needed.)
4. Save. Copy the Internal Integration Secret. You'll paste it into Vercel as
   `NOTION_TOKEN`.
5. Open your Prototype Hub database in Notion. Click the `⋯` menu →
   *Connections* → *Connect to* → select "Prototype Hub". This is what gives
   the integration permission to add rows.
6. Copy the database ID. From the database URL:
   `notion.so/yourworkspace/THIS_PART?v=...` — that's the ID. You'll paste
   it into Vercel as `NOTION_DATABASE_ID`.

**Important:** The property names in the database must match what the app
sends. The default expectation is:

| Property | Type | Options (for selects) |
|---|---|---|
| Title | Title | — |
| Question explored | Text | — |
| Live link | URL | — |
| Tool | Select | Claude, Figma Make, ChatGPT, Lovable, v0, Bolt, Replit, Other |
| Tier | Select | Sketch, Shareable, Reference |
| Status | Select | Draft, Published, Archived |
| Access | Select | Public, Link only, Login required |
| Link stability | Select | Permanent, Probably stable, Ephemeral |
| Audience | Multi-select | Internal, Districts, Counselors, Students, Investors, Public |
| Owner email | Text | — |
| Published | Date | — |

If you renamed the Title property to "Name" (Notion's default), either
rename it back to "Title" or update `lib/notion.ts` line ~46. Same goes for
any other property name changes.

The select-type properties don't need their options pre-created — Notion
will create the option on first use. But pre-creating them gets you the
right colors.

---

## Step 4 — Deploy to Vercel

1. Go to https://vercel.com/new
2. Import the GitHub repo you created in step 1.
3. Framework: Next.js (auto-detected).
4. Before clicking Deploy, expand *Environment Variables* and paste in all
   the variables from `.env.example`:

   | Variable | Value |
   |---|---|
   | `SUBMIT_PASSWORD` | Pick a password your team will share via 1Password |
   | `AUTH_SECRET` | Run `openssl rand -hex 32` and paste the output |
   | `GITHUB_TOKEN` | Your token from step 2 |
   | `GITHUB_REPO` | `your-org/prototype-hub` |
   | `GITHUB_BRANCH` | `main` |
   | `NOTION_TOKEN` | Your token from step 3 |
   | `NOTION_DATABASE_ID` | Your database ID from step 3 |
   | `NEXT_PUBLIC_BASE_URL` | The Vercel URL — fill this in *after* the first deploy with the real domain |

5. Click Deploy. After ~1 minute you'll have a working URL.
6. Update `NEXT_PUBLIC_BASE_URL` to match the deployed URL (or your custom
   domain), then redeploy. This env var is what's used to construct the
   `/p/{slug}` link saved into Notion, so it has to match the live URL.

---

## Step 5 — Test

1. Visit your Vercel URL → you'll be redirected to `/login`.
2. Enter the password. You should land on the submission form.
3. Paste a tiny test prototype like:

   ```html
   <h1 style="font-family: serif; padding: 64px;">It works.</h1>
   ```

4. Title: "test prototype". Question: "Does the pipeline work?". Email: yours.
5. Submit. You should see a success message with a `/p/test-prototype` URL.
6. Wait 60 seconds, then open the URL. You should see your H1.
7. Check your Notion hub — there should be a new row with the live link
   filled in.

If any of those steps fail, see the troubleshooting section below.

---

## Local development

```bash
npm install
cp .env.example .env.local  # then fill in real values
npm run dev
```

Open http://localhost:3000.

Note: in local dev, GitHub commits will go to your real repo, which means
your laptop submissions become real production prototypes. Use a separate
`GITHUB_BRANCH=dev` env var locally if you want to keep dev separate, then
configure Vercel to only auto-deploy from `main`.

---

## How it works (file by file)

| File | Purpose |
|---|---|
| `app/page.tsx` | The submission form (client component) |
| `app/login/page.tsx` | The password form |
| `app/api/login/route.ts` | Validates password, sets signed cookie |
| `app/api/submit/route.ts` | The main pipeline: validate → commit → Notion |
| `middleware.ts` | Redirects unauthed visitors to `/login` |
| `lib/auth.ts` | HMAC-based cookie signing |
| `lib/github.ts` | Octokit wrapper — `pathExists`, `createFile` |
| `lib/notion.ts` | Notion client — `createHubEntry` |
| `lib/slug.ts` | Title → URL slug, with collision suffix |
| `next.config.js` | Rewrites `/p/{slug}` → `/prototypes/{slug}/index.html` |
| `app/globals.css` | Warm editorial styling |

---

## Customizing

**Change the form fields.** Edit `app/page.tsx` to add/remove fields, then
update `app/api/submit/route.ts` to validate them, and `lib/notion.ts` to
include them in the Notion row.

**Change the slug pattern.** Edit `lib/slug.ts`. Default is lowercase-kebab,
60 chars max, with a 6-char hex suffix on collision.

**Change the URL pattern.** Edit `next.config.js`. The default rewrites
`/p/{slug}` to `/prototypes/{slug}/index.html`. You could change it to just
serve at `/prototypes/{slug}/` if you prefer.

**Change the editorial styling.** All visual choices are in
`app/globals.css`. The font selections are in `app/layout.tsx`.

---

## Troubleshooting

**"Failed to publish to GitHub"**
- Check the Vercel function logs. Most common: token doesn't have `repo`
  scope, or `GITHUB_REPO` is misspelled.
- Verify the token works: `curl -H "Authorization: Bearer $TOKEN"
  https://api.github.com/user` should return your user info.

**"Notion sync failed"**
- Most common: the integration isn't connected to the database. Open the
  database, click `⋯` → Connections, and add the integration.
- Second most common: a property name mismatch. The error message will
  usually say which property. Either rename the property in Notion or
  update `lib/notion.ts`.

**Submitted but the URL 404s after a minute**
- Check Vercel's Deployments tab. There should be a deployment triggered
  by the commit. If it failed, click in to see why — usually a build error
  caused by something in the submitted HTML, but with permissive validation
  this should be rare.
- Check that the file actually appeared in GitHub at
  `public/prototypes/{slug}/index.html`.

**"Unauthorized" on submit even after logging in**
- The `AUTH_SECRET` env var changed between when the cookie was set and
  when it was validated. Sign out (clear cookies for the site) and back in.

---

## Security notes

- Permissive sanitization is in effect. Any submitter can publish arbitrary
  HTML/JS to your domain. This is fine for an internal tool with trusted
  submitters but means: don't share the password with anyone you wouldn't
  give push access to a normal repo.
- The auth model is "anyone with the password gets in." If you need
  per-user attribution beyond the email field on the form, switch to
  Google Workspace SSO via NextAuth. That's a 1-2 hour upgrade, not a
  rewrite.
- Submitted prototypes are served from your domain, which means cookies
  set by your other apps on that domain are NOT readable by them (different
  origin if you use a subdomain like `prototypes.your-domain.com`). If you
  serve from a path on your main domain, prototypes can read your main
  app's cookies — use a subdomain to avoid this.

---

## What this doesn't do (and what to add later)

- **Edit / delete.** No way to edit or remove a published prototype after
  the fact. To remove one, delete the file from GitHub manually and archive
  the Notion row.
- **Versioning.** Re-submitting with the same title creates a new prototype
  with a `-{hash}` suffix, not a new version.
- **Preview.** The form has no "preview before publish" button. Submitters
  see their prototype live after the deploy completes.
- **Slack notifications.** You said you wanted this initially, but the
  scope grew. Adding it is ~20 lines: a webhook URL env var and a `fetch`
  call at the end of `route.ts` after the Notion create succeeds.

These are all fine v2 additions — don't build them until you've used the
v1 enough to know which one matters most.
