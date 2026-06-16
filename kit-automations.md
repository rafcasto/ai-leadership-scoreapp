# Kit Automations & Email Sequences — AI Leadership Readiness Scorecard

Copy-paste-ready build plan for **Kit → Automations → Visual automations** plus
the finished email copy. Personalization tokens below use the **exact custom-field
keys** already created in your account (verified by `scripts/setup-kit.mjs`):

`first_name` · `company_name` · `role_level` · `company_size` · `ai_overall_score`
· `ai_overall_tier` · `knowledge_score` · `mindset_score` · `skills_score` ·
`leadership_score` · `lowest_category` · `ai_interests` · `report_url`

Tags already created: `Source: AI Readiness Scorecard`, `Scorecard Started`,
`Scorecard Completed`, `Scorecard Abandoned`, `Tier: AI Aware/Engaged/Enabled/
AI-First Leaders`, `Focus: Knowledge/Mindset/Skills/Leadership`.

> **Heads up:** Visual automations and sequences are built in the Kit UI (they
> aren't API-creatable). The app already writes the fields + tags that trigger
> everything below. CTAs use the interim **"book a free debrief"** placeholder —
> search `[OFFER TBD]` / `[LINK]` and swap when your offer is defined.

---

## Step 0 — Create the 6 sequences first (Kit → Sequences → New)

Build these email sequences so the automations can reference them:

1. **Scorecard – Results (Email 0)** — 1 email, sent immediately
2. **Scorecard – Abandon** — 2 emails (Day 0 of entry, +2 days)
3. **Track A – Build the Foundations** — 4 emails (Days 2, 5, 9, 14)
4. **Track B – Scale the Advantage** — 4 emails (Days 2, 5, 9, 14)

(Full copy in the **Email content** section below. Set each email's delay in the
sequence editor's "Send" dropdown.)

---

## Automation 1 — Results delivery

**Kit → Automations → New automation → Start from scratch**

```
TRIGGER:   Tag added  →  "Scorecard Completed"
   │
   ├─ ACTION:   Subscribe to sequence  →  "Scorecard – Results (Email 0)"
   │
   ├─ CONDITION (Branch on tag):  has tag "Tier: AI Aware" OR "Tier: AI Engaged"?
   │     ├─ YES →  Subscribe to sequence "Track A – Build the Foundations"
   │     └─ NO  →  Subscribe to sequence "Track B – Scale the Advantage"
   │
   └─ END
```

Build notes:
- Add the trigger, then drag a **Sequence** step (Email 0).
- After it, add a **Condition** step. Kit conditions branch on a single tag, so
  use two stacked conditions or a "Tier" check: simplest is one condition
  `Tier: AI Enabled` **OR** `Tier: AI-First Leaders` → YES goes to **Track B**,
  the NO/else path goes to **Track A**.
- Toggle the automation **Live** (top-right) when done.

---

## Automation 2 — Abandonment recovery

```
TRIGGER:   Tag added  →  "Scorecard Started"
   │
   ├─ DELAY:   Wait 2 hours
   │
   ├─ CONDITION:  has tag "Scorecard Completed"?
   │     ├─ YES →  END  (they finished — do nothing)
   │     └─ NO  →  ACTION: Subscribe to sequence "Scorecard – Abandon"
   │
   └─ END
```

Build notes:
- The **Scorecard – Abandon** sequence holds both nudges (Day 0 + Day 2). If you
  prefer, put only Abandon #1 here and gate Abandon #2 behind a second
  `Wait 2 days` + `has tag Scorecard Completed?` condition.
- Optional: on completion, the app can drop `Scorecard Started`; the condition
  above already prevents double-sending, so it's not required.

---

## Automation 3 — Nurture branching

Already handled inside **Automation 1** (the Tier condition routes to Track A or
Track B). No separate automation needed unless you want nurture to start
independently of the results email — in that case clone the Tier condition with
trigger `Tag added → Scorecard Completed`.

---

# Email content

Voice: professional, warm, peer-to-peer for senior leaders. Signed *Laurent Simon, AI Dojo*. Replace `[LINK]` / `[OFFER TBD]` when your offer is set.

---

## Sequence: Scorecard – Results (Email 0) — immediate, all tiers

**Subject:** Your AI Readiness Score, {{ subscriber.first_name }}
**Subject (A/B option):** {{ subscriber.company_name }}'s AI readiness: {{ subscriber.ai_overall_score }}/5
**Preview:** Here's where {{ subscriber.company_name }} stands — and the one area to prioritize.

```
Hi {{ subscriber.first_name }},

Thanks for completing the AI Leadership Readiness Scorecard. Here's your snapshot:

Overall: {{ subscriber.ai_overall_score }}/5 — {{ subscriber.ai_overall_tier }}

  • Knowledge:  {{ subscriber.knowledge_score }}/5
  • Mindset:    {{ subscriber.mindset_score }}/5
  • Skills:     {{ subscriber.skills_score }}/5
  • Leadership: {{ subscriber.leadership_score }}/5

Your biggest opportunity right now is {{ subscriber.lowest_category }} — the area
where focused effort will move your readiness the fastest.

Your full personalized report (benchmark chart + recommendations for each area):
→ View your report: {{ subscriber.report_url }}

Over the next few days I'll send a short series with practical ways to raise your
score, starting with {{ subscriber.lowest_category }}.

[OFFER TBD — interim:] Want to talk through your results? Book a free 20-minute
AI Readiness debrief here: [LINK]

— Laurent Simon, AI Dojo
```

---

## Sequence: Scorecard – Abandon

### Abandon #1 — Day 0 of entry (i.e. ~2h after starting)
**Subject:** You're one step from your AI Readiness Score
**Preview:** Your spot is saved — it takes under 3 minutes to finish.

```
Hi {{ subscriber.first_name }},

You started the AI Leadership Readiness Scorecard but didn't quite finish. It
takes under 3 minutes, and at the end you'll get a personalized report showing
exactly where {{ subscriber.company_name }}'s leaders stand across Knowledge,
Mindset, Skills, and Leadership — plus the one area to prioritize first.

→ Finish your scorecard: [LINK]

— Laurent
```

### Abandon #2 — +2 days (optional)
**Subject:** Still curious how AI-ready your leaders are?
**Preview:** One stat most leadership teams underestimate.

```
Hi {{ subscriber.first_name }},

A quick thought before you go: "AI won't replace humans — but humans with AI will
replace humans without AI." The gap is opening fastest at the leadership level.

Two more minutes tells you where {{ subscriber.company_name }} stands today and
the single highest-leverage place to start.

→ Finish your scorecard: [LINK]

— Laurent
```

---

## Sequence: Track A — Build the Foundations
*Enters when `Tier: AI Aware` or `Tier: AI Engaged`. Goal: build confidence, book the debrief.*

### A1 — Day 2: Start where you scored lowest
**Subject:** The fastest way to raise your AI readiness
**Preview:** Don't fix everything at once — start here.

```
Hi {{ subscriber.first_name }},

Most leadership teams try to fix everything at once. Don't. Your scorecard points
to {{ subscriber.lowest_category }} as the highest-leverage place to start.

Three concrete first moves for that area this month:
  1. Name one owner and one 30-day goal for {{ subscriber.lowest_category }}.
  2. Run a 30-minute "AI show-and-tell" so wins and questions surface in the open.
  3. Publish a one-page "responsible-use" guardrail so people feel safe to try.

[OFFER TBD] Want help prioritizing? Book a free debrief: [LINK]

— Laurent
```

### A2 — Day 5: Knowledge & Mindset are a team sport
**Subject:** Why AI readiness stalls (and how to unstick it)
**Preview:** Shared language beats more tools.

```
Hi {{ subscriber.first_name }},

Build shared language before tools. The simplest framing that lands with leaders:
AI won't replace your people — your people using AI will outpace those who don't.

A recurring 30-minute team "AI show-and-tell" turns curiosity into momentum faster
than any policy memo. Pick a day this week and put it on the calendar.

[OFFER TBD CTA: book a debrief → LINK]

— Laurent
```

### A3 — Day 9: Make experimentation safe
**Subject:** Give your leaders permission to test and learn
**Preview:** Guardrails, not guesswork.

```
Hi {{ subscriber.first_name }},

The biggest predictor of a strong Mindset score is whether leaders feel safe to
experiment and fail fast. Create that safety with three guardrails:

  • A sandbox: an approved tool + a few low-risk use cases to start.
  • A use-case shortlist so people aren't staring at a blank box.
  • A "responsible use" one-pager so the boundaries are obvious.

[OFFER TBD CTA: book a debrief → LINK]

— Laurent
```

### A4 — Day 14: Invitation
**Subject:** Want a second pair of eyes on your results?
**Preview:** 20 minutes to map your next level.

```
Hi {{ subscriber.first_name }},

You've seen where {{ subscriber.company_name }} stands. If it's useful, let's
spend 20 minutes mapping the fastest path from {{ subscriber.ai_overall_tier }} to
the next level — focused on {{ subscriber.lowest_category }}.

Book here: [OFFER TBD LINK]

— Laurent Simon, AI Dojo
```

---

## Sequence: Track B — Scale the Advantage
*Enters when `Tier: AI Enabled` or `Tier: AI-First Leaders`. Goal: move from pockets to org-wide scale; book a strategy call.*

### B1 — Day 2: From pilots to scale
**Subject:** You're past the starting line — now scale it
**Preview:** The risk now is fragmentation, not adoption.

```
Hi {{ subscriber.first_name }},

Your readiness is strong ({{ subscriber.ai_overall_score }}/5). At this stage the
risk isn't adoption — it's fragmentation: wins trapped in pockets. Your lowest
area, {{ subscriber.lowest_category }}, is likely where scale is leaking.

This week: pick one win that's working in a single team and write down what it
would take to make it the default across two more.

[OFFER TBD CTA: book a strategy call → LINK]

— Laurent
```

### B2 — Day 5: Measure what matters
**Subject:** The metric most AI-ready teams still miss
**Preview:** Adoption is easy to feel, hard to prove.

```
Hi {{ subscriber.first_name }},

Teams that score high on adoption often score lower on measurement. A common set
of AI impact metrics — time saved, quality, adoption rate, value created — is what
turns activity into a defensible advantage.

Pick two metrics and instrument one workflow this month. Proof compounds.

[OFFER TBD CTA: book a strategy call → LINK]

— Laurent
```

### B3 — Day 9: Make it durable
**Subject:** Turn your AI edge into an operating standard
**Preview:** Side projects fade. Standards stick.

```
Hi {{ subscriber.first_name }},

Embedding AI into everyday operations — not side projects — is what separates
AI-Enabled from AI-First. A short playbook:

  • Standardize the prompts that work into shared, named templates.
  • Codify responsible use so it's a default, not a debate.
  • Name an owner per function so momentum has a home.

[OFFER TBD CTA: book a strategy call → LINK]

— Laurent
```

### B4 — Day 14: Invitation
**Subject:** A strategy session on scaling your AI advantage
**Preview:** 30 minutes, a concrete plan.

```
Hi {{ subscriber.first_name }},

You're ahead of most. Let's spend 30 minutes on a concrete plan to scale across
functions and lock in the lead — starting with {{ subscriber.lowest_category }}.

Book here: [OFFER TBD LINK]

— Laurent Simon, AI Dojo
```

---

## Build checklist

- [ ] Create the 4 sequences and paste the emails above; set per-email delays.
- [ ] **Automation 1** — trigger `Scorecard Completed` → Email 0 → Tier branch → Track A/B.
- [ ] **Automation 2** — trigger `Scorecard Started` → wait 2h → if not `Scorecard Completed` → Abandon sequence.
- [ ] Set all automations + sequences to **Live**.
- [ ] Send yourself a test (complete the scorecard with your email) and confirm the
      tokens render with real numbers and `report_url` opens your results page.
- [ ] When the offer is defined, replace every `[OFFER TBD]` / `[LINK]` and re-test A4/B4.
```
