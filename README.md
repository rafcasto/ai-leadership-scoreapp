# The AI Leadership Readiness Scorecard

A modern, self-hosted ScoreApp: a branded landing page → lead capture → 11-question
assessment → scored results with a 1–5 benchmark chart → downloadable PDF report,
plus an **admin** panel to edit every piece of copy (landing, questions, answers,
CTAs). Leads and scores are stored in **Supabase**; **Kit** handles lead
segmentation and the email sequence.

Built on the **JobHackers.Global** design system (Poppins/Roboto, red `#c2001f`,
soft radii, red-glow CTAs).

---

## Stack

- **Vite + React + TypeScript** SPA → deploys to **Vercel**
- **Vercel serverless functions** (`/api/*`) — hold every secret (Supabase secret
  key, Kit key, admin password). Nothing sensitive reaches the browser.
- **Supabase** — `leads`, `submissions`, and editable `site_content`
- **Kit (ConvertKit)** — subscriber custom fields + tags + automations
- **jsPDF + html2canvas** — the downloadable report

## Routes

| Path | What |
|------|------|
| `/` | Landing page (all copy is admin-editable) |
| `/quiz` | Lead form, then one question at a time |
| `/results/:id` | Tier, benchmark chart, biggest opportunity, recs, PDF download |
| `/admin` | Login + dashboard + content/question editor |

---

## Setup (3 steps)

### 1. Create the database tables (one time)
Open **Supabase → SQL Editor → New query**, paste the contents of
[`supabase/schema.sql`](supabase/schema.sql), and **Run**. Then verify:

```bash
node scripts/check-db.mjs
```

Default site/quiz content auto-seeds the first time the app loads.

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
**non-`VITE_`** var under **Project → Settings → Environment Variables**.

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

## Kit data flow

- **On lead capture (before Q1):** upsert subscriber + tags `Source: AI Readiness
  Scorecard`, `Scorecard Started` → enables abandonment recovery.
- **On completion:** write `ai_overall_score`, the four category scores,
  `ai_overall_tier`, `lowest_category`, `report_url`, etc.; add `Scorecard
  Completed` + the one `Tier:` tag + the one `Focus:` tag.

Build these in **Kit → Automations → Visual automations**:
1. **Results delivery** — trigger `Scorecard Completed` → send Email 0 → enter the
   nurture track based on the `Tier:` tag.
2. **Abandonment** — trigger `Scorecard Started` → wait 2h → if not `Scorecard
   Completed`, send the abandon email.
3. **Nurture branching** — Track A (Aware/Engaged), Track B (Enabled/First).

Email drafts + tokens are in `AI-Readiness-Scorecard-Design.md` §10.

## Admin

Go to `/admin`, sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. You can edit:
landing copy, hero metrics, credibility, pillars, the lead form, **every question
and answer (and points)**, results copy, tiers, and per-category recommendations.
Saving writes to `site_content`; the live site reads it immediately. The dashboard
shows lead/completion stats and recent submissions.

## Security notes

- `site_content` is publicly readable (copy only); `leads` + `submissions` have no
  anon access and are reached only via the service-role key inside `/api`.
- Admin endpoints require a signed (HMAC) session token.
- The Kit and Supabase secret keys were shared in plain text — consider **rotating
  them** once you've confirmed everything works.
