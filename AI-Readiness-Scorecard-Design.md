# The AI Leadership Readiness Scorecard — ScoreApp Build Spec

*Adapted from "Learning to Lead in the Digital Age: The AI Readiness Reflection" (Harvard Business Impact) into a ScoreApp lead-generation scorecard.*

> **Decisions locked:** Audience = **individual leaders self-assessing their organization**. Offer/CTA = **placeholder for now** (to be defined later — see §7). Build target = **self-hosted ScoreApp on Vercel**, with **Kit** handling lead segmentation and email marketing (see §8–§10).

---

## 0. How this maps to a self-hosted ScoreApp (Vercel) + Kit

The source PDF is a paper self-reflection with raw point ranges per area (e.g., Knowledge 1–16). Your output image is the **category benchmark chart**, which plots each category as an **average on a 1–5 scale** (Never → Always), comparing the individual against the company average and the high/low quartiles.

So this build does two things the PDF doesn't:

1. **Normalizes every category to a 0–100% score, displayed as an average out of 5.** Category score = (points earned ÷ max possible points) × 5. This makes every category land on the same 1–5 axis regardless of how many questions or answer options it has — exactly what the chart needs.
2. **Captures the lead before results** so you keep every respondent even if they abandon, and feeds segmentation data (role, company size, AI interests) for follow-up.

**Division of labor:**
- **Vercel app** = landing page, questionnaire, scoring logic, the 1–5 benchmark chart, results page, PDF report.
- **Kit** = the lead database + segmentation (custom fields + tags) + all email marketing (results delivery, abandonment recovery, tier nurture). The Vercel app pushes each lead and their scores into Kit via the Kit API (§9).

The four categories keep the AI Maturity Pyramid order used in your chart: **Knowledge → Mindset → Skills → Leaders (Leadership).**

**Who takes it:** Each respondent is an **individual leader** scoring their own organization. The "company average" and "high/low quartile" lines on the benchmark chart are built by **aggregating all individual responses** (across everyone who has taken it, or filtered to a single client org), so each person sees how they compare to the wider pool.

---

## 1. Naming & concept hook

**Recommended name:** The AI Leadership Readiness Scorecard

**Concept hook (headline on landing page):** *Are your leaders ready to lead with AI?*

This is a "moving toward" hook (goal-oriented), which outperforms fear-based framing. Alternatives to A/B test:

- "What's your organization's AI Readiness Score?"
- "How AI-ready are your leaders? Find out in 3 minutes."
- "Learning to Lead in the Digital Age: the 3-minute AI Readiness Scorecard"

---

## 2. Landing page copy (the 3 Cs)

**Clarity**
> ### Are your leaders ready to lead with AI?
> Answer 11 quick questions to score your organization across the four areas that determine AI readiness — Knowledge, Mindset, Skills, and Leadership — and get a personalized report with your biggest opportunity and concrete next steps.

**Credibility**
> Based on the AI Maturity framework from Harvard Business Impact and HBS Professor Karim Lakhani's work on AI adoption. *"AI won't replace humans — but humans with AI will replace humans without AI."*

**Connection**
> Most middle and senior leaders know AI matters but aren't sure where their organization actually stands. This scorecard meets your leaders where they are today and shows the fastest path forward.

**CTA button:** Start the Scorecard → *(takes less than 3 minutes)*

**Optional bonus to lift completion:** "Finish to unlock your personalized AI Readiness Report (PDF) you can share with your leadership team."

---

## 3. Lead capture form (place BEFORE question 1)

| Field | Type | Required |
|-------|------|----------|
| First name | Text | Yes |
| Work email | Email | Yes |
| Company | Text | Yes |
| Role / level | Single choice: C-suite · VP/Director · Senior manager · Middle manager · Individual contributor · Other | Yes |
| Company size | Single choice: 1–50 · 51–250 · 251–1,000 · 1,001–5,000 · 5,000+ | Yes |
| Phone | Phone | Optional |

> Capturing email here (before Q1) is what makes abandonment recovery possible — the Vercel app should push the subscriber to Kit at this step, tagged `Scorecard Started`, then update them on completion. These fields double as **qualifying data** for sales and **segmentation** for follow-up.

---

## 4. The questionnaire

**Scoring legend:** Best/most-mature answer = full points; least-mature = lowest. "Not sure / don't know" answers are scored **null** (excluded from that category's average) so uncertainty doesn't artificially deflate the chart — but flag a high count of "not sure" as its own insight.

Each category below lists its questions, answer options, and points. Category score = (sum of points ÷ max possible) × 5, shown on the 1–5 chart.

---

### CATEGORY 1 — KNOWLEDGE
*Baseline understanding of AI, gen AI, available tools, use cases, and responsible/ethical use.*

**Q1. How well would you say most leaders in your organization understand what AI is and what it's capable of?** *(single choice)*

| Answer | Points |
|--------|--------|
| Very well | 5 |
| Somewhat well | 4 |
| Mixed | 3 |
| Not very well | 2 |
| Not at all | 1 |
| Not sure / don't know | null |

**Q2. What are your top interests in using AI today?** *(multi-select — NOT scored; used for segmentation & follow-up content)*
Improve efficiency · Automate processes/functions · Augment creativity · Use advanced data/predictive analytics · Reduce costs · Enhance user experience (e.g., personalization) · None of the above

**Q3. How well versed are your company's leaders in your AI ethics and responsible-use policies?** *(single choice)*

| Answer | Points |
|--------|--------|
| Very well — most could quote them | 5 |
| Somewhat well — most know what they can/can't do | 4 |
| Basically aware — most know we have policies and where to find them | 3 |
| Not aware — most could benefit from brushing up | 1 |
| Not sure / don't know — "do we even have a policy?" | null |

**Optional Q3b (recommended, strengthens reliability):** "How confident are your leaders in identifying a good AI use case from a poor one?" — Very / Somewhat / Mixed / Not very / Not at all (5→1).

*Knowledge max = 10 pts (Q1 + Q3). Displayed = points ÷ 10 × 5.*

---

### CATEGORY 2 — MINDSET
*AI curiosity, experimentation, growth/disruptor mindset.*

**Q4. On HBS Professor Karim Lakhani's scale — from "skeptic" to "cyborg" — where would most leaders in your organization fall?** *(single choice)*

| Answer | Points |
|--------|--------|
| Cyborg — basically half droid | 5 |
| Explorer — actively experimenting | 4 |
| Dabbler — testing with free trials | 3 |
| Searcher — considering opportunities | 2 |
| Skeptic — 100% people-powered | 1 |

**Q5. When it comes to AI, how comfortable are your leaders with testing to learn and failing fast?** *(single choice)*

| Answer | Points |
|--------|--------|
| Very comfortable | 5 |
| Somewhat comfortable | 4 |
| Somewhat uncomfortable | 2 |
| Very uncomfortable | 1 |
| Not sure / don't know | null |

**Q6. How proactive are your leaders at anticipating the impact of next-generation AI technologies before they become mainstream?** *(single choice)*

| Answer | Points |
|--------|--------|
| Very proactive | 5 |
| Somewhat proactive | 4 |
| Somewhat reactive | 2 |
| Very reactive | 1 |
| Not sure / don't know | null |

*Mindset max = 15 pts (Q4–Q6). Displayed = points ÷ 15 × 5.*

---

### CATEGORY 3 — SKILLS
*Testing and applying gen AI tools to create value, safely and at scale.*

**Q7. Which AI collaboration skills are the majority of your leaders proficient in (i.e., currently use to create value)?** *(multi-select — scored by count)*

Each selected skill = 1 point (max 6): Intelligent interrogation/prompting · Contextualizing information · Curating and structuring information · Exercising critical thinking/judgment · Responsible use/ethics · Data input and feedback loops. ("None of the above" = 0 and clears the rest.)

| Skills selected | Points (of 5) |
|-----------------|---------------|
| 6 | 5 |
| 5 | 4 |
| 3–4 | 3 |
| 1–2 | 2 |
| None | 1 |

**Q8. How would you describe your leaders' ability to use generative AI tools to derive meaningful outcomes at scale — incorporating enablers like customer-centricity, design thinking, and change leadership?** *(single choice)*

| Answer | Points |
|--------|--------|
| Guiding the organization through transformational change with their expertise | 5 |
| Regularly contribute to early successes but need to strengthen efforts to scale | 4 |
| Need support integrating these tools with broader strategies (design thinking, customer-centricity) | 2 |
| Need guidance to test and apply gen AI tools safely and effectively | 1 |

*Skills max = 10 pts (Q7 banded to 5 + Q8 to 5). Displayed = points ÷ 10 × 5.*

---

### CATEGORY 4 — LEADERS (Leadership)
*Staying at the forefront, embedding AI in operations, measuring impact.*

**Q9. How actively does your organization support risk-taking and experimentation on digital/AI initiatives?** *(single choice)*

| Answer | Points |
|--------|--------|
| Leaders have ample executive support for creative risk-taking in the digital space | 5 |
| Individual leaders are willing, but must overcome organizational resistance to experimentation | 3 |
| No penalty for sticking with the tried and true, so people tend to do that | 2 |
| Our organization has policies in place to prevent AI experimentation | 1 |
| Not sure / don't know | null |

**Q10. How extensively is AI embedded in leaders' everyday operational practices?** *(single choice)*

| Answer | Points |
|--------|--------|
| Strategically integrated into all aspects of their operations | 5 |
| Leaders empower certain teams/individuals to use AI tools without interference | 4 |
| Using some AI tools and technologies in parts of their operations | 3 |
| Leaders are unaware of the level of individual AI use on their teams | 1 |
| Not sure / don't know | null |

**Q11. Do your leaders use a common set of metrics to evaluate the use and impact of AI in your business?** *(single choice)*

| Answer | Points |
|--------|--------|
| Yes | 5 |
| Maybe | 3 |
| No | 1 |
| Don't know | null |

*Leadership max = 15 pts (Q9–Q11). Displayed = points ÷ 15 × 5.*

---

## 5. Results page

**Show:**

1. **Overall AI Readiness tier** (custom 4-tier, below) — headline + one-paragraph meaning.
2. **Category chart** — the 1–5 benchmark view (Knowledge, Mindset, Skills, Leaders) with the respondent vs. the aggregate company average vs. the high/low quartile, exactly like your image.
3. **"Your biggest opportunity"** — auto-surface the lowest-scoring category (the PDF's core instruction: *prioritize action where the score is lowest*) and show that category's tier recommendation.
4. **Per-category Low/Medium/High recommendation** text (from §6).
5. **Tier-appropriate CTA** (§7).
6. **Downloadable PDF report** with their name, the chart, and recommendations.

### Custom overall tiers (mapped to the maturity pyramid)

| Tier | Avg across categories | Meaning |
|------|----------------------|---------|
| **AI Aware** | 1.0 – 2.2 | Foundations are forming. The priority is building shared AI knowledge and a safe space to experiment. |
| **AI Engaged** | 2.3 – 3.2 | Curiosity is real but uneven. Time to convert interest into repeatable skills and clearer policy. |
| **AI Enabled** | 3.3 – 4.1 | Leaders are applying AI in real work. Focus on scaling wins and embedding metrics. |
| **AI-First Leaders** | 4.2 – 5.0 | AI is woven into how leaders operate. Push the frontier and institutionalize the advantage. |

> Custom tiers like these increase engagement vs. plain Low/Medium/High. The sweet spot for conversion is **AI Engaged / AI Enabled** — "strong foundations with room to improve."

---

## 6. Per-category dynamic recommendations

Use these bands per category (1–5 display): **Low 1.0–2.4 · Medium 2.5–3.7 · High 3.8–5.0.** Copy adapted from the source PDF.

**Knowledge**
- *High:* Strong foundation of AI knowledge. Advance with deeper integration across functions and continuous education on emerging trends and ethics.
- *Medium:* You understand AI but should strengthen areas like ethics or applying AI in new ways. Consider targeted training and raising AI literacy.
- *Low:* Opportunity to build foundational AI knowledge. Prioritize education so leaders understand both the potential and the ethical implications.

**Mindset**
- *High:* Forward-thinking AI mindset. Keep pushing boundaries with more innovative applications and encourage experimentation with new tools.
- *Medium:* Willing to engage, but would benefit from a culture that embraces experimentation and learning from failure.
- *Low:* Mindset may be cautious or reactive. Build comfort with testing and adapting by starting with small pilots.

**Skills**
- *High:* Strong AI collaboration skills. Maintain the edge with advanced applications and upskilling in responsible use and data-input techniques.
- *Medium:* Solid grasp of collaborating with AI; improve critical thinking and feedback loops via advanced workshops.
- *Low:* Key collaboration skills may be missing. Invest in training on AI integration, data analysis, and responsible use.

**Leaders / Leadership**
- *High:* Fostering AI leadership well. Keep empowering risk-taking and integrate AI metrics into all decision-making.
- *Medium:* Making progress; reinforce support for experimentation and embed AI more fully into everyday operations.
- *Low:* May lack robust AI leadership. Build a culture that supports risk-taking and develop a common set of metrics to evaluate AI's impact.

---

## 7. CTAs by tier  🔒 *PLACEHOLDER — offer to be defined*

> **No offer defined yet.** The placeholders below keep the funnel complete so the scorecard can launch; swap in your real offer when ready. Until then, a safe universal CTA is to **book a free AI Readiness debrief call** (low-commitment, works for every tier) or simply **deliver the PDF report**.

| Tier | Placeholder CTA |
|------|-----------------|
| AI Aware (low) | `[OFFER TBD]` — e.g., free intro resource / webinar on the 4 building blocks of AI-ready leadership |
| AI Engaged | `[OFFER TBD]` — e.g., book a 20-min AI Readiness debrief call + send the report |
| AI Enabled | `[OFFER TBD]` — e.g., book a strategy call on scaling AI wins across the org |
| AI-First Leaders | `[OFFER TBD]` — e.g., direct consultation / advanced engagement / peer cohort |

**Interim default CTA button (all tiers):** "Get your AI Readiness Report" → deliver PDF, then "Book a free debrief call."

---

## 8. Kit segmentation — data model

Set these up in Kit first; the Vercel app writes to them (§9), and the email sequences read from them (§10).

### 8.1 Custom fields (Subscribers → Custom fields)
Create these so each lead's scores and profile travel with them. Use exactly these keys in the Vercel API calls so personalization (`{{ subscriber.key }}`) works.

| Field key | Example value | Purpose |
|-----------|---------------|---------|
| `company_name` | Acme Corp | Personalization |
| `role_level` | VP/Director | Qualification / routing |
| `company_size` | 251–1,000 | Qualification / routing |
| `ai_overall_score` | 3.6 | Overall 1–5 average |
| `ai_overall_tier` | AI Enabled | Drives nurture track |
| `knowledge_score` | 4.0 | Category chart + email copy |
| `mindset_score` | 3.4 | Category chart + email copy |
| `skills_score` | 2.8 | Category chart + email copy |
| `leadership_score` | 4.3 | Category chart + email copy |
| `lowest_category` | Skills | "Your biggest opportunity" personalization |
| `ai_interests` | Improve efficiency, Reduce costs | Content personalization (from Q2) |
| `report_url` | https://… | Link to their PDF report |

### 8.2 Tags (Subscribers → Tags)
Tags drive automation and let you broadcast to a slice later.

- **Source:** `Source: AI Readiness Scorecard`
- **Status:** `Scorecard Started`, `Scorecard Completed`, `Scorecard Abandoned`
- **Tier (one of):** `Tier: AI Aware`, `Tier: AI Engaged`, `Tier: AI Enabled`, `Tier: AI-First Leaders`
- **Biggest opportunity (one of):** `Focus: Knowledge`, `Focus: Mindset`, `Focus: Skills`, `Focus: Leadership`

> Rule of thumb: **fields store values; tags trigger journeys.** Tier and Focus are stored as *both* (a field for copy, a tag for automation).

---

## 9. Kit ↔ Vercel integration (how data gets in)

### 9.0 Credentials & secrets — IMPORTANT
- The Kit API key is **not** stored in this document on purpose. It lives in **`.env.local`** in this project (which is gitignored via `.gitignore`) as `KIT_API_KEY`.
- On Vercel, also add it under **Project → Settings → Environment Variables** as `KIT_API_KEY` (Production + Preview). Do **not** prefix it with `NEXT_PUBLIC_` — that would expose it to the browser.
- Only ever read `KIT_API_KEY` inside a **serverless / route handler** (server side). Never call the Kit API from client-side code.
- Treat the key as sensitive: anyone with it can read/modify your Kit account. Because it has been shared in plain text, consider **rotating it in Kit** (Settings → Developer/API) once setup is confirmed working.

Your Vercel ScoreApp calls the Kit API at two moments:

**Moment 1 — Email captured (before Q1):**
1. Create/upsert the subscriber with `first_name`, email, and the profile fields.
2. Add tags `Source: AI Readiness Scorecard` + `Scorecard Started`.

**Moment 2 — Scorecard completed (results page):**
1. Update the subscriber's score fields (`ai_overall_score`, the four category scores, `lowest_category`, `ai_overall_tier`, `report_url`).
2. Add tags `Scorecard Completed` + the one `Tier:` tag + the one `Focus:` tag.
3. (Optional) Remove `Scorecard Started` so abandonment logic doesn't fire.

**API shape (Kit v4 — confirm exact endpoints/headers in current Kit API docs before coding):**
- Auth header: `X-Kit-Api-Key: <KIT_API_KEY>` (read from `process.env.KIT_API_KEY`)
- Create/update subscriber (with custom fields) → `POST https://api.kit.com/v4/subscribers`
- Tag a subscriber → `POST https://api.kit.com/v4/tags/{tag_id}/subscribers`
- List custom fields / tags (to get IDs) → `GET https://api.kit.com/v4/custom_fields`, `GET https://api.kit.com/v4/tags`

> Practical note: fetch and hard-code your tag IDs once (they don't change), and reference custom fields by their keys. Send scores as strings or numbers consistently with how you created the fields.

### Automations to build in Kit (Automations → Visual automations)
1. **Results delivery:** Trigger = tag `Scorecard Completed` added → send Email 0 (results) → then enter the matching nurture track based on the `Tier:` tag.
2. **Abandonment recovery:** Trigger = tag `Scorecard Started` added → wait 2 hours → *filter:* if tag `Scorecard Completed` is **not** present → send the Abandon email → wait 2 days → if still not completed, send Abandon #2 (optional).
3. **Nurture branching:** Two sequences (Track A and Track B in §10). Use the tier tag to decide which a subscriber enters.

---

## 10. Email sequences (drafts)

Voice: professional, warm, peer-to-peer for senior leaders. CTAs use the **interim placeholder** ("book a free AI Readiness debrief call") until your offer is set — search for `[OFFER TBD]` to swap later. Personalization tokens use the Kit field keys from §8.1.

### Email 0 — Results delivery (immediate, all tiers)
**Subject:** Your AI Readiness Score, {{ subscriber.first_name }}
**Preview:** Here's where {{ subscriber.company_name }} stands — and the one area to prioritize.

> Hi {{ subscriber.first_name }},
>
> Thanks for completing the AI Leadership Readiness Scorecard. Here's your snapshot:
>
> **Overall: {{ subscriber.ai_overall_score }}/5 — {{ subscriber.ai_overall_tier }}**
>
> - Knowledge: {{ subscriber.knowledge_score }}/5
> - Mindset: {{ subscriber.mindset_score }}/5
> - Skills: {{ subscriber.skills_score }}/5
> - Leadership: {{ subscriber.leadership_score }}/5
>
> Your biggest opportunity right now is **{{ subscriber.lowest_category }}** — the area where focused effort will move your readiness the fastest.
>
> Your full personalized report (with the benchmark chart and recommendations for each area) is here:
> **→ View your report:** {{ subscriber.report_url }}
>
> Over the next few days I'll send a short series with practical ways to raise your score, starting with {{ subscriber.lowest_category }}.
>
> [OFFER TBD — interim:] If you'd like to talk through your results, you can book a free 20-minute AI Readiness debrief here: **[LINK]**
>
> — Rafael, Digital Pathways

---

### Abandon email — incomplete starts
**Subject:** You're one step from your AI Readiness Score
**Preview:** Your progress is saved — pick up where you left off.

> Hi {{ subscriber.first_name }},
>
> You started the AI Leadership Readiness Scorecard but didn't quite finish. It takes under 3 minutes, and at the end you'll get a personalized report showing exactly where {{ subscriber.company_name }}'s leaders stand across Knowledge, Mindset, Skills, and Leadership — plus the one area to prioritize first.
>
> **→ Finish your scorecard:** [LINK]
>
> — Rafael

*(Optional Abandon #2, +2 days):* Subject — "Still curious how AI-ready your leaders are?" Short nudge + the single most surprising stat from the framework (e.g., "humans with AI replace humans without AI") + same link.

---

### Nurture TRACK A — "Build the Foundations"
*For `Tier: AI Aware` and `Tier: AI Engaged`. Goal: build confidence and book the debrief call.*

**A1 (Day 2) — Start where you scored lowest**
Subject: The fastest way to raise your AI readiness
> Hi {{ subscriber.first_name }} — most leadership teams try to fix everything at once. Don't. Your scorecard points to **{{ subscriber.lowest_category }}** as the highest-leverage place to start. Here are three concrete first moves for that area this month… *(insert the 3 steps for that category — see §6 recommendations).* [OFFER TBD CTA]

**A2 (Day 5) — Knowledge & Mindset are a team sport**
Subject: Why AI readiness stalls (and how to unstick it)
> Build shared language before tools. One short framing: AI won't replace your people — but your people using AI will outpace those who don't. A simple 30-minute "AI show-and-tell" per team turns curiosity into momentum… [OFFER TBD CTA]

**A3 (Day 9) — Make experimentation safe**
Subject: Give your leaders permission to test and learn
> The single biggest predictor of mindset scores is whether leaders feel safe to experiment and fail fast. Here's how to create that safety with guardrails (a sandbox, a use-case shortlist, and a "responsible use" one-pager)… [OFFER TBD CTA]

**A4 (Day 14) — Invitation**
Subject: Want a second pair of eyes on your results?
> You've seen where {{ subscriber.company_name }} stands. If it's useful, let's spend 20 minutes mapping the fastest path from **{{ subscriber.ai_overall_tier }}** to the next level. **Book here:** [OFFER TBD LINK]

---

### Nurture TRACK B — "Scale the Advantage"
*For `Tier: AI Enabled` and `Tier: AI-First Leaders`. Goal: move from pockets of success to org-wide scale; book a strategy call.*

**B1 (Day 2) — From pilots to scale**
Subject: You're past the starting line — now scale it
> Hi {{ subscriber.first_name }} — your readiness is strong ({{ subscriber.ai_overall_score }}/5). The risk at this stage isn't adoption, it's *fragmentation*: wins trapped in pockets. Your lowest area, **{{ subscriber.lowest_category }}**, is likely where scale is leaking. Here's how to close it… [OFFER TBD CTA]

**B2 (Day 5) — Measure what matters**
Subject: The metric most AI-ready teams still miss
> Leaders who score high on adoption often score lower on *measurement*. A common set of AI impact metrics (time saved, quality, adoption rate, value created) is what turns activity into a defensible advantage… [OFFER TBD CTA]

**B3 (Day 9) — Make it durable**
Subject: Turn your AI edge into an operating standard
> Embedding AI into everyday operations — not side projects — is what separates AI-Enabled from AI-First. A short playbook: standardize prompts, codify responsible-use, and name an owner per function… [OFFER TBD CTA]

**B4 (Day 14) — Invitation**
Subject: A strategy session on scaling your AI advantage
> You're ahead of most. Let's spend 30 minutes on a concrete plan to scale across functions and lock in the lead. **Book here:** [OFFER TBD LINK]

---

> When your offer is defined, replace every `[OFFER TBD]` / `[LINK]` and tune A4/B4 to the real conversion event. The sequence structure won't need to change.

---

## 11. Self-score against the Scorecard Marketing method

**Current design: 9 / 10.**

To reach 10/10, close these gaps:
1. **Define the offer/CTA** (§7) — still a placeholder, so the funnel has no concrete conversion event yet. Single biggest lever.
2. **A/B test 3–5 concept hooks** with your audience before locking the landing page.
3. **Add one extra scored question to Knowledge and Skills** (each has only 2 scored items) for steadier averages.
4. **Pilot with 5–10 leaders** before launch to validate question clarity and scoring bands.

---

## 12. Status & next steps

**Locked:**
- Audience: individual leaders self-assessing their organization.
- Build: self-hosted ScoreApp on Vercel + Kit for segmentation/email.
- Offer/CTA: placeholder for now (§7).
- Kit API key: stored in `.env.local` (gitignored) as `KIT_API_KEY` — see §9.0.

**Open / when you're ready:**
1. Define the real offer → finalize §7 CTAs and the `[OFFER TBD]` lines in §10.
2. Decide whether to add the optional Knowledge (Q3b) and an extra Skills question.
3. In Kit: create the custom fields (§8.1) and tags (§8.2), then build the three automations (§9).
4. In Vercel: add `KIT_API_KEY` env var and wire the two Kit API calls (§9).
