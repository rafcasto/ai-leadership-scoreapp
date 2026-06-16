// Creates the 11 scorecard emails as DRAFT broadcasts in Kit (no send date).
// Idempotent: skips any broadcast whose subject already exists.
//   node scripts/create-broadcasts.mjs
import { readFileSync } from "fs";

function loadEnv() {
  try {
    const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of txt.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      if (!(k in process.env)) process.env[k] = t.slice(i + 1).trim();
    }
  } catch {}
}
loadEnv();

const KEY = process.env.KIT_API_KEY;
if (!KEY) { console.error("Missing KIT_API_KEY"); process.exit(1); }
const BASE = "https://api.kit.com/v4";

async function kit(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "X-Kit-Api-Key": KEY, ...(init.headers || {}) },
  });
  const body = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

// ---- email building helpers (simple, email-safe HTML) ----
const RED = "#c2001f";
const INK = "#191c27";
function wrap(parts) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:${INK}">${parts.join("")}</div>`;
}
const p = (s) => `<p style="margin:0 0 16px">${s}</p>`;
const scores = () =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px">
    <tr><td style="padding:2px 0;color:#3a3f4d">Knowledge</td><td style="padding:2px 0 2px 18px;font-weight:bold">{{ subscriber.knowledge_score }}/5</td></tr>
    <tr><td style="padding:2px 0;color:#3a3f4d">Mindset</td><td style="padding:2px 0 2px 18px;font-weight:bold">{{ subscriber.mindset_score }}/5</td></tr>
    <tr><td style="padding:2px 0;color:#3a3f4d">Skills</td><td style="padding:2px 0 2px 18px;font-weight:bold">{{ subscriber.skills_score }}/5</td></tr>
    <tr><td style="padding:2px 0;color:#3a3f4d">Leadership</td><td style="padding:2px 0 2px 18px;font-weight:bold">{{ subscriber.leadership_score }}/5</td></tr>
  </table>`;
const btn = (label, href) =>
  `<p style="margin:24px 0"><a href="${href}" style="background:${RED};color:#fff;text-decoration:none;font-weight:bold;padding:13px 24px;border-radius:10px;display:inline-block">${label}</a></p>`;
const ul = (items) =>
  `<ul style="margin:0 0 16px;padding-left:20px">${items.map((i) => `<li style="margin:0 0 8px">${i}</li>`).join("")}</ul>`;
const sig = (full = false) =>
  p(`— Laurent${full ? " Simon, AI Dojo" : ", AI Dojo"}`);

// ---- the 11 emails ----
const EMAILS = [
  {
    name: "[Scorecard] Results — Email 0",
    audience: "Send via automation on tag 'Scorecard Completed' (all tiers).",
    subject: "Your AI Readiness Score, {{ subscriber.first_name }}",
    preview: "Here's where {{ subscriber.company_name }} stands — and the one area to prioritize.",
    content: wrap([
      p("Hi {{ subscriber.first_name }},"),
      p("Thanks for completing the AI Leadership Readiness Scorecard. Here's your snapshot:"),
      p(`<strong style="font-size:18px">Overall: {{ subscriber.ai_overall_score }}/5 — {{ subscriber.ai_overall_tier }}</strong>`),
      scores(),
      p("Your biggest opportunity right now is <strong>{{ subscriber.lowest_category }}</strong> — the area where focused effort will move your readiness the fastest."),
      p("Your full personalized report (benchmark chart + recommendations for each area) is here:"),
      btn("View your report →", "{{ subscriber.report_url }}"),
      p("Over the next few days I'll send a short series with practical ways to raise your score, starting with {{ subscriber.lowest_category }}."),
      p(`<em style="color:#6b7280">[OFFER TBD — interim:] Want to talk through your results? Book a free 20-minute AI Readiness debrief here:</em> <a href="[LINK]" style="color:${RED}">[LINK]</a>`),
      sig(true),
    ]),
  },
  {
    name: "[Scorecard] Abandon #1",
    audience: "Send via automation on tag 'Scorecard Started' when 'Scorecard Completed' is NOT present (~2h).",
    subject: "You're one step from your AI Readiness Score",
    preview: "Your spot is saved — it takes under 3 minutes to finish.",
    content: wrap([
      p("Hi {{ subscriber.first_name }},"),
      p("You started the AI Leadership Readiness Scorecard but didn't quite finish. It takes under 3 minutes, and at the end you'll get a personalized report showing exactly where {{ subscriber.company_name }}'s leaders stand across Knowledge, Mindset, Skills, and Leadership — plus the one area to prioritize first."),
      btn("Finish your scorecard →", "[LINK]"),
      sig(),
    ]),
  },
  {
    name: "[Scorecard] Abandon #2",
    audience: "Optional, +2 days after Abandon #1 if still not completed.",
    subject: "Still curious how AI-ready your leaders are?",
    preview: "One stat most leadership teams underestimate.",
    content: wrap([
      p("Hi {{ subscriber.first_name }},"),
      p('A quick thought before you go: "AI won\'t replace humans — but humans with AI will replace humans without AI." The gap is opening fastest at the leadership level.'),
      p("Two more minutes tells you where {{ subscriber.company_name }} stands today and the single highest-leverage place to start."),
      btn("Finish your scorecard →", "[LINK]"),
      sig(),
    ]),
  },
  {
    name: "[Track A] A1 — Start where you scored lowest",
    audience: "Tier: AI Aware OR AI Engaged. Day 2.",
    subject: "The fastest way to raise your AI readiness",
    preview: "Don't fix everything at once — start here.",
    content: wrap([
      p("Hi {{ subscriber.first_name }},"),
      p("Most leadership teams try to fix everything at once. Don't. Your scorecard points to <strong>{{ subscriber.lowest_category }}</strong> as the highest-leverage place to start."),
      p("Three concrete first moves for that area this month:"),
      ul([
        "Name one owner and one 30-day goal for {{ subscriber.lowest_category }}.",
        'Run a 30-minute "AI show-and-tell" so wins and questions surface in the open.',
        'Publish a one-page "responsible-use" guardrail so people feel safe to try.',
      ]),
      p(`<em style="color:#6b7280">[OFFER TBD]</em> Want help prioritizing? <a href="[LINK]" style="color:${RED}">Book a free debrief</a>.`),
      sig(),
    ]),
  },
  {
    name: "[Track A] A2 — Knowledge & Mindset are a team sport",
    audience: "Tier: AI Aware OR AI Engaged. Day 5.",
    subject: "Why AI readiness stalls (and how to unstick it)",
    preview: "Shared language beats more tools.",
    content: wrap([
      p("Hi {{ subscriber.first_name }},"),
      p("Build shared language before tools. The simplest framing that lands with leaders: AI won't replace your people — your people using AI will outpace those who don't."),
      p('A recurring 30-minute team "AI show-and-tell" turns curiosity into momentum faster than any policy memo. Pick a day this week and put it on the calendar.'),
      btn("Book a debrief →", "[LINK]"),
      sig(),
    ]),
  },
  {
    name: "[Track A] A3 — Make experimentation safe",
    audience: "Tier: AI Aware OR AI Engaged. Day 9.",
    subject: "Give your leaders permission to test and learn",
    preview: "Guardrails, not guesswork.",
    content: wrap([
      p("Hi {{ subscriber.first_name }},"),
      p("The biggest predictor of a strong Mindset score is whether leaders feel safe to experiment and fail fast. Create that safety with three guardrails:"),
      ul([
        "A sandbox: an approved tool + a few low-risk use cases to start.",
        "A use-case shortlist so people aren't staring at a blank box.",
        'A "responsible use" one-pager so the boundaries are obvious.',
      ]),
      btn("Book a debrief →", "[LINK]"),
      sig(),
    ]),
  },
  {
    name: "[Track A] A4 — Invitation",
    audience: "Tier: AI Aware OR AI Engaged. Day 14.",
    subject: "Want a second pair of eyes on your results?",
    preview: "20 minutes to map your next level.",
    content: wrap([
      p("Hi {{ subscriber.first_name }},"),
      p("You've seen where {{ subscriber.company_name }} stands. If it's useful, let's spend 20 minutes mapping the fastest path from <strong>{{ subscriber.ai_overall_tier }}</strong> to the next level — focused on {{ subscriber.lowest_category }}."),
      btn("Book here →", "[OFFER TBD LINK]"),
      sig(true),
    ]),
  },
  {
    name: "[Track B] B1 — From pilots to scale",
    audience: "Tier: AI Enabled OR AI-First Leaders. Day 2.",
    subject: "You're past the starting line — now scale it",
    preview: "The risk now is fragmentation, not adoption.",
    content: wrap([
      p("Hi {{ subscriber.first_name }},"),
      p("Your readiness is strong (<strong>{{ subscriber.ai_overall_score }}/5</strong>). At this stage the risk isn't adoption — it's fragmentation: wins trapped in pockets. Your lowest area, <strong>{{ subscriber.lowest_category }}</strong>, is likely where scale is leaking."),
      p("This week: pick one win that's working in a single team and write down what it would take to make it the default across two more."),
      btn("Book a strategy call →", "[LINK]"),
      sig(),
    ]),
  },
  {
    name: "[Track B] B2 — Measure what matters",
    audience: "Tier: AI Enabled OR AI-First Leaders. Day 5.",
    subject: "The metric most AI-ready teams still miss",
    preview: "Adoption is easy to feel, hard to prove.",
    content: wrap([
      p("Hi {{ subscriber.first_name }},"),
      p("Teams that score high on adoption often score lower on measurement. A common set of AI impact metrics — time saved, quality, adoption rate, value created — is what turns activity into a defensible advantage."),
      p("Pick two metrics and instrument one workflow this month. Proof compounds."),
      btn("Book a strategy call →", "[LINK]"),
      sig(),
    ]),
  },
  {
    name: "[Track B] B3 — Make it durable",
    audience: "Tier: AI Enabled OR AI-First Leaders. Day 9.",
    subject: "Turn your AI edge into an operating standard",
    preview: "Side projects fade. Standards stick.",
    content: wrap([
      p("Hi {{ subscriber.first_name }},"),
      p("Embedding AI into everyday operations — not side projects — is what separates AI-Enabled from AI-First. A short playbook:"),
      ul([
        "Standardize the prompts that work into shared, named templates.",
        "Codify responsible use so it's a default, not a debate.",
        "Name an owner per function so momentum has a home.",
      ]),
      btn("Book a strategy call →", "[LINK]"),
      sig(),
    ]),
  },
  {
    name: "[Track B] B4 — Invitation",
    audience: "Tier: AI Enabled OR AI-First Leaders. Day 14.",
    subject: "A strategy session on scaling your AI advantage",
    preview: "30 minutes, a concrete plan.",
    content: wrap([
      p("Hi {{ subscriber.first_name }},"),
      p("You're ahead of most. Let's spend 30 minutes on a concrete plan to scale across functions and lock in the lead — starting with {{ subscriber.lowest_category }}."),
      btn("Book here →", "[OFFER TBD LINK]"),
      sig(true),
    ]),
  },
];

async function main() {
  const existing = await kit("/broadcasts?per_page=500");
  const bySubject = new Map(
    (existing.broadcasts || []).map((b) => [(b.subject || "").trim(), b.id])
  );

  let created = 0, updated = 0;
  for (const e of EMAILS) {
    const body = JSON.stringify({
      subject: e.subject,
      preview_text: e.preview,
      description: `${e.name} — ${e.audience}`,
      content: e.content,
      public: false,        // draft, not public
      published_at: null,
      send_at: null,        // no send scheduled → stays a draft
    });
    const id = bySubject.get(e.subject.trim());
    try {
      if (id) {
        await kit(`/broadcasts/${id}`, { method: "PUT", body });
        console.log(`  ♻ updated: ${e.name}  (id ${id})`);
        updated++;
      } else {
        const res = await kit("/broadcasts", { method: "POST", body });
        console.log(`  ✅ created: ${e.name}  (id ${res?.broadcast?.id})`);
        created++;
      }
    } catch (err) {
      console.log(`  ⚠ ${e.name}: ${err.message}`);
    }
  }
  console.log(`\nDone. ${created} created, ${updated} updated.`);
  console.log("Review under Kit → Broadcasts (Drafts). They have no send date —");
  console.log("nothing sends until you schedule or move the copy into a sequence.");
}
main().catch((e) => { console.error(e); process.exit(1); });
