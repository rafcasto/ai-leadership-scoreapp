# The AI Leadership Readiness Scorecard

A modern, self-hosted ScoreApp: a branded landing page → lead capture → 11-question
assessment → scored results with a 1–5 benchmark chart → downloadable PDF report,
plus an **admin** panel to edit every piece of copy (landing, questions, answers,
CTAs). Leads and scores are stored in **Supabase**; **Kit** handles lead
segmentation and the email sequence.

Built on the **JobHackers.Global / AI Dojo** design system (Poppins/Roboto, red
`#c2001f`, soft radii, red-glow CTAs).

---

## Stack

- **Vite + React + TypeScript** SPA → deploys to **Vercel**
- **Vercel serverless functions** (`/api/*`) — hold every secret (Supabase secret
  key, Kit key). Nothing sensitive reaches the browser.
- **Supabase** — `leads`, `submissions`, editable `site_content`, and **Supabase
  Auth** for the admin login
- **Kit (ConvertKit)** — subscriber custom fields + tags + automations
- **jsPDF + html2canvas** — the downloadable report

## Routes

| Path | What |
|------|------|
| `/` | Landing page (all copy is admin-editable) |
| `/quiz` | Lead form, then one question at a time |
| `/results/:id` | Tier, benchmark chart, biggest opportunity, recs, PDF download |
| `/admin` | **Private, unlinked** route — Supabase Auth login + dashboard + editor |

---

## Setup

### 1. Create the database tables (one time)
Open **Supabase → SQL Editor → New query**, paste the contents of
[`supabase/schema.sql`](supabase/schema.sql), and **Run**. Then verify:

```bash
node scripts/check-db.mjs
```

Default site/quiz content auto-seeds the first time the app loads.

### 1b. Create the admin user (one time) — already done ✅
```bash
node scripts/setup-admin.mjs
```
Creates a Supabase Auth user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` with
`app_metadata.role = "admin"`. Admin auth is handled by **Supabase Auth** — sign
in at `/admin` (an unlinked, private route). The serverless endpoints verify the
Supabase JWT and authorize on `role = admin` OR an `ADMIN_EMAIL` allowlist match.

### 2. Provision Kit (one time) — already done ✅
```bash
node scripts/setup-kit.mjs
```
Creates the 12 custom fields + 12 tags from the spec and verifies the field keys
match what the app writes. Re-runnable safely.

### 3. Install & run
```bash
npm install
vercel dev          # runs the SPA + /api functions together (recommended)
# or: npm run dev    # SPA only; /api needs `vercel dev` on :3000
```

Env lives in [`.env.local`](.env.local) (gitignored). On Vercel, add every
**non-`VITE_`** var under **Project → Settings → Environment Variables** (and the
two `VITE_SUPABASE_*` so the admin login works in the browser).

---

## How scoring works

Each category is normalized to a **0–100% → 1–5** average:
`category = (points earned ÷ max possible) × 5`. "Not sure" answers are **null**
and excluded from that category's max so uncertainty doesn't deflate the chart
(but a high "not sure" count is surfaced as its own insight).

- **Knowledge** = Q1 + Q3 (max 10)
- **Mindset** = Q4–Q6 (max 15)
- **Skills** = Q7 (skill count, banded to 5) + Q8 (max 10)
- **Leadership** = Q9–Q11 (max 15)
- **Overall** = average of the four → mapped to a tier (AI Aware / Engaged /
  Enabled / AI-First Leaders)

The logic lives in [`shared/scoring.ts`](shared/scoring.ts) and is covered by
[`test/scoring.test.ts`](test/scoring.test.ts) (17 assertions). Run it:

```bash
npx esbuild test/scoring.test.ts --bundle --platform=node --format=esm --outfile=/tmp/t.mjs && node /tmp/t.mjs
```

Server-side smoke test (content + Supabase Auth + Kit):

```bash
npx esbuild test/server-smoke.ts --bundle --platform=node --format=esm --packages=external --outfile=/tmp/s.mjs && node /tmp/s.mjs
```

## Kit data flow

- **On lead capture (before Q1):** upsert subscriber + tags `Source: AI Readiness
  Scorecard`, `Scorecard Started` → enables abandonment recovery.
- **On completion:** write `ai_overall_score`, the four category scores,
  `ai_overall_tier`, `lowest_category`, `report_url`, etc.; add `Scorecard
  Completed` + the one `Tier:` tag + the one `Focus:` tag.

Full step-by-step build plan (paste-ready emails + automations): [`kit-build-guide.md`](kit-build-guide.md). Reference spec: [`kit-automations.md`](kit-automations.md).
The 11 emails are also created as **draft broadcasts** in Kit via
[`scripts/create-broadcasts.mjs`](scripts/create-broadcasts.mjs).

## Admin

`/admin` is a **private, unlinked route** (not in the footer/nav). Sign in with the
Supabase Auth admin user (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). You can edit: landing
copy, hero metrics, credibility, pillars, the lead form, **every question and
answer (and points)**, results copy, tiers, and per-category recommendations.
Saving writes to `site_content`; the live site reads it immediately. The dashboard
shows lead/completion stats and recent submissions.

To add more admins: create the user in Supabase Auth and either set
`app_metadata.role = "admin"` or add their email to the `ADMIN_EMAIL` allowlist
(comma-separated).

## Security notes

- `site_content` is publicly readable (copy only); `leads` + `submissions` have no
  anon access and are reached only via the secret (service-role) key inside `/api`.
- Admin endpoints verify the **Supabase Auth JWT** and require an admin role /
  allowlisted email.
- The Kit and Supabase secret keys were shared in plain text — consider **rotating
  them** once you've confirmed everything works.
