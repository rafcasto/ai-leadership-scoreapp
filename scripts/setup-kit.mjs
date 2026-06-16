// One-time Kit (ConvertKit) setup: creates the custom fields (§8.1) and tags
// (§8.2) the scorecard writes to. Idempotent — safe to re-run.
//
//   node scripts/setup-kit.mjs
//
// Kit derives each custom field's `key` from its label (lowercase, spaces →
// underscores). The labels below are chosen so the generated keys match exactly
// the keys the app sends (company_name, ai_overall_score, …). After creating,
// the script re-fetches and verifies every expected key exists.
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
  if (!res.ok) throw new Error(`${path} ${res.status}: ${JSON.stringify(body).slice(0, 200)}`);
  return body;
}

// [expectedKey, label]
const FIELDS = [
  ["last_name", "Last name"],
  ["company_name", "Company name"],
  ["role_level", "Role level"],
  ["company_size", "Company size"],
  ["ai_overall_score", "AI overall score"],
  ["ai_overall_tier", "AI overall tier"],
  ["knowledge_score", "Knowledge score"],
  ["mindset_score", "Mindset score"],
  ["skills_score", "Skills score"],
  ["leadership_score", "Leadership score"],
  ["lowest_category", "Lowest category"],
  ["ai_interests", "AI interests"],
  ["report_url", "Report URL"],
];

const TAGS = [
  "Source: AI Readiness Scorecard", "Scorecard Started", "Scorecard Completed", "Scorecard Abandoned",
  "Tier: AI Aware", "Tier: AI Engaged", "Tier: AI Enabled", "Tier: AI-First Leaders",
  "Focus: Knowledge", "Focus: Mindset", "Focus: Skills", "Focus: Leadership",
];

async function main() {
  console.log("→ Custom fields");
  let existing = await kit("/custom_fields?per_page=500");
  let have = new Map((existing.custom_fields || []).map((f) => [f.key, f.label]));
  for (const [key, label] of FIELDS) {
    if (have.has(key)) { console.log(`  · ${key} (exists)`); continue; }
    try {
      await kit("/custom_fields", { method: "POST", body: JSON.stringify({ label }) });
      console.log(`  ✅ created "${label}"`);
    } catch (e) { console.log(`  ⚠ ${label}: ${e.message}`); }
  }

  console.log("→ Tags");
  const tagList = await kit("/tags?per_page=500");
  const haveTags = new Set((tagList.tags || []).map((t) => t.name.toLowerCase()));
  for (const name of TAGS) {
    if (haveTags.has(name.toLowerCase())) { console.log(`  · ${name} (exists)`); continue; }
    try {
      await kit("/tags", { method: "POST", body: JSON.stringify({ name }) });
      console.log(`  ✅ created ${name}`);
    } catch (e) { console.log(`  ⚠ ${name}: ${e.message}`); }
  }

  // verify
  console.log("\n→ Verifying field keys match what the app sends");
  existing = await kit("/custom_fields?per_page=500");
  have = new Map((existing.custom_fields || []).map((f) => [f.key, f.label]));
  let mismatch = 0;
  for (const [key] of FIELDS) {
    const ok = have.has(key);
    if (!ok) mismatch++;
    console.log(`  ${ok ? "✅" : "❌"} ${key}`);
  }
  if (mismatch) {
    console.log(`\n⚠ ${mismatch} field key(s) didn't match. Open Kit → Subscribers → Custom fields`);
    console.log("  and rename so the generated key equals the expected key above.");
  } else {
    console.log("\n✅ All field keys present. Personalization tokens will resolve.");
  }
  console.log("\nNext: build the 3 automations in Kit → Visual automations (see README).");
}
main().catch((e) => { console.error(e); process.exit(1); });
