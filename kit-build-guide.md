# Kit Build Guide — Evergreen Drip (Option A)

Everything you need to turn the scorecard into a live, per-subscriber email flow
in Kit (`aidojo.pro`). The app already tags + scores people; this connects the
emails. **Order:** build the 4 sequences first (Part 1), then the 2 automations
that trigger them (Part 2), then go live (Part 3).

- Tokens below use your verified custom-field keys — they'll render real values.
- Replace every `[LINK]` / `[OFFER TBD]` with your real booking link before going live.
- Sender: set Kit → Settings → Email → from-name to **Laurent Simon** (matches the signatures).

---

# PART 1 — The 4 sequences (already created via API ✅)

`scripts/create-sequences.mjs` already created all 4 sequences and 11 emails in
your Kit account (as **drafts**). In Kit → **Sequences**, for each email you only
need to: (1) replace `[LINK]` / `[OFFER TBD]` with your real booking URL, and
(2) **Publish** the email. The full copy is below for reference / editing.

(Re-run `node scripts/create-sequences.mjs` anytime — it is idempotent.)

---

## Sequence 1 — `Scorecard – Results`
*1 email. This is the instant results email for every completed scorecard.*

### Email 1 · Delay: **immediately** (0 days)
**Subject:** Your AI Readiness Score, {{ subscriber.first_name }}
**Preview:** Here's where {{ subscriber.company_name }} stands — and the one area to prioritize.
**Body:**
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

Want to talk through your results? Book a free 20-minute AI Readiness debrief: [LINK]

— Laurent Simon, AI Dojo
```

---

## Sequence 2 — `Scorecard – Abandon`
*2 emails. For people who start but don't finish.*

### Email 1 · Delay: **immediately** (0 days)
**Subject:** You're one step from your AI Readiness Score
**Preview:** Your spot is saved — it takes under 3 minutes to finish.
**Body:**
```
Hi {{ subscriber.first_name }},

You started the AI Leadership Readiness Scorecard but didn't quite finish. It
takes under 3 minutes, and at the end you'll get a personalized report showing
exactly where {{ subscriber.company_name }}'s leaders stand across Knowledge,
Mindset, Skills, and Leadership — plus the one area to prioritize first.

→ Finish your scorecard: [LINK]

— Laurent
```

### Email 2 · Delay: **2 days after previous**
**Subject:** Still curious how AI-ready your leaders are?
**Preview:** One stat most leadership teams underestimate.
**Body:**
```
Hi {{ subscriber.first_name }},

A quick thought before you go: the gap between companies isn't access to AI — it's
whether leaders know how to put it to work. That gap is widening fastest at the
leadership level.

Two more minutes tells you where {{ subscriber.company_name }} stands today and
the single highest-leverage place to start.

→ Finish your scorecard: [LINK]

— Laurent
```

---

## Sequence 3 — `Track A – Build the Foundations`
*4 emails. For lower tiers (AI Aware / AI Engaged). Goal: build confidence, book the debrief.*

### Email 1 · Delay: **2 days**
**Subject:** The fastest way to raise your AI readiness
**Preview:** Don't fix everything at once — start here.
**Body:**
```
Hi {{ subscriber.first_name }},

Most leadership teams try to fix everything at once. Don't. Your scorecard points
to {{ subscriber.lowest_category }} as the highest-leverage place to start.

Three concrete first moves for that area this month:
1. Name one owner and one 30-day goal for {{ subscriber.lowest_category }}.
2. Run a 30-minute "AI show-and-tell" so wins and questions surface in the open.
3. Publish a one-page "responsible-use" guardrail so people feel safe to try.

Want help prioritizing? Book a free debrief: [LINK]

— Laurent
```

### Email 2 · Delay: **3 days after previous** (Day 5)
**Subject:** Why AI readiness stalls (and how to unstick it)
**Preview:** Shared language beats more tools.
**Body:**
```
Hi {{ subscriber.first_name }},

Build shared language before tools. The simplest framing that lands with leaders:
AI won't replace your people — your people using AI will outpace those who don't.

A recurring 30-minute team "AI show-and-tell" turns curiosity into momentum faster
than any policy memo. Pick a day this week and put it on the calendar.

Book a debrief: [LINK]

— Laurent
```

### Email 3 · Delay: **4 days after previous** (Day 9)
**Subject:** Give your leaders permission to test and learn
**Preview:** Guardrails, not guesswork.
**Body:**
```
Hi {{ subscriber.first_name }},

The biggest predictor of a strong Mindset score is whether leaders feel safe to
experiment and fail fast. Create that safety with three guardrails:

• A sandbox: an approved tool + a few low-risk use cases to start.
• A use-case shortlist so people aren't staring at a blank box.
• A "responsible use" one-pager so the boundaries are obvious.

Book a debrief: [LINK]

— Laurent
```

### Email 4 · Delay: **5 days after previous** (Day 14)
**Subject:** Want a second pair of eyes on your results?
**Preview:** 20 minutes to map your next level.
**Body:**
```
Hi {{ subscriber.first_name }},

You've seen where {{ subscriber.company_name }} stands. If it's useful, let's
spend 20 minutes mapping the fastest path from {{ subscriber.ai_overall_tier }} to
the next level — focused on {{ subscriber.lowest_category }}.

Book here: [OFFER TBD LINK]

— Laurent Simon, AI Dojo
```

---

## Sequence 4 — `Track B – Scale the Advantage`
*4 emails. For higher tiers (AI Enabled / AI-First Leaders). Goal: scale org-wide; book a strategy call.*

### Email 1 · Delay: **2 days**
**Subject:** You're past the starting line — now scale it
**Preview:** The risk now is fragmentation, not adoption.
**Body:**
```
Hi {{ subscriber.first_name }},

Your readiness is strong ({{ subscriber.ai_overall_score }}/5). At this stage the
risk isn't adoption — it's fragmentation: wins trapped in pockets. Your lowest
area, {{ subscriber.lowest_category }}, is likely where scale is leaking.

This week: pick one win that's working in a single team and write down what it
would take to make it the default across two more.

Book a strategy call: [LINK]

— Laurent
```

### Email 2 · Delay: **3 days after previous** (Day 5)
**Subject:** The metric most AI-ready teams still miss
**Preview:** Adoption is easy to feel, hard to prove.
**Body:**
```
Hi {{ subscriber.first_name }},

Teams that score high on adoption often score lower on measurement. A common set
of AI impact metrics — time saved, quality, adoption rate, value created — is what
turns activity into a defensible advantage.

Pick two metrics and instrument one workflow this month. Proof compounds.

Book a strategy call: [LINK]

— Laurent
```

### Email 3 · Delay: **4 days after previous** (Day 9)
**Subject:** Turn your AI edge into an operating standard
**Preview:** Side projects fade. Standards stick.
**Body:**
```
Hi {{ subscriber.first_name }},

Embedding AI into everyday operations — not side projects — is what separates
AI-Enabled from AI-First. A short playbook:

• Standardize the prompts that work into shared, named templates.
• Codify responsible use so it's a default, not a debate.
• Name an owner per function so momentum has a home.

Book a strategy call: [LINK]

— Laurent
```

### Email 4 · Delay: **5 days after previous** (Day 14)
**Subject:** A strategy session on scaling your AI advantage
**Preview:** 30 minutes, a concrete plan.
**Body:**
```
Hi {{ subscriber.first_name }},

You're ahead of most. Let's spend 30 minutes on a concrete plan to scale across
functions and lock in the lead — starting with {{ subscriber.lowest_category }}.

Book here: [OFFER TBD LINK]

— Laurent Simon, AI Dojo
```

> Tip: the same email copy already lives in your **draft broadcasts** (Kit →
> Broadcasts) — you can copy the formatted body from there instead of retyping.

---

# PART 2 — Build the 2 automations

Kit → **Automations → + New automation → Start from scratch.**

## Automation 1 — `Scorecard – Results + Nurture`
Delivers the results email, then routes into Track A or B by tier.

1. **Trigger:** *Subscriber is added to tag* → **`Scorecard Completed`**
2. **+ Action → Subscribe to a sequence** → **`Scorecard – Results`**
3. **+ Condition** → *Has tag* → **`Tier: AI Enabled`**
   - To cover both high tiers, use the condition group "matches ANY":
     `Tier: AI Enabled` **OR** `Tier: AI-First Leaders`
4. On the **Yes** branch → **Subscribe to sequence** → **`Track B – Scale the Advantage`**
5. On the **No / Else** branch → **Subscribe to sequence** → **`Track A – Build the Foundations`**
6. Top-right toggle → **Live**.

```
[Tag: Scorecard Completed]
        ↓
[Sequence: Scorecard – Results]
        ↓
[Condition: Tier = AI Enabled OR AI-First Leaders ?]
     ├─ Yes → [Sequence: Track B]
     └─ No  → [Sequence: Track A]
```

## Automation 2 — `Scorecard – Abandonment`
Recovers people who started but didn't finish.

1. **Trigger:** *Subscriber is added to tag* → **`Scorecard Started`**
2. **+ Action → Delay** → **Wait 2 hours**
3. **+ Condition** → *Has tag* → **`Scorecard Completed`**
4. **Yes** branch → **End** (they finished — do nothing)
5. **No** branch → **Subscribe to sequence** → **`Scorecard – Abandon`**
6. Top-right toggle → **Live**.

```
[Tag: Scorecard Started]
        ↓
[Delay: 2 hours]
        ↓
[Condition: has tag Scorecard Completed ?]
     ├─ Yes → [End]
     └─ No  → [Sequence: Scorecard – Abandon]
```

---

# PART 3 — Go live checklist

- [ ] All 4 sequences created with the emails + delays above.
- [ ] Replaced every `[LINK]` / `[OFFER TBD]` with your real booking URL.
- [ ] Set Kit from-name to **Laurent Simon** (Settings → Email).
- [ ] Both automations built and toggled **Live**.
- [ ] Each sequence toggled **Live** (sequences have their own publish state).
- [ ] **Test:** complete the scorecard with your own email →
      - within ~1 min you get the **Results** email with real scores + report link,
      - you enter Track A or B based on your tier.
- [ ] **Test abandon:** start the scorecard, enter your email, stop → in ~2h you
      get the abandon email (or shorten the delay to test faster, then restore it).

Once these are live, the app + Kit run the whole funnel automatically: capture →
score → results → nurture, with abandonment recovery.
```
