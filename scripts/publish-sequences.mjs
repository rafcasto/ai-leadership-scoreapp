// Publishes (or unpublishes) every email in the 4 scorecard sequences.
//   node scripts/publish-sequences.mjs            # publish all
//   node scripts/publish-sequences.mjs --unpublish
import { readFileSync } from "fs";

function loadEnv() {
  const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of txt.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    if (!(k in process.env)) process.env[k] = t.slice(i + 1).trim();
  }
}
loadEnv();

const KEY = process.env.KIT_API_KEY;
if (!KEY) { console.error("Missing KIT_API_KEY"); process.exit(1); }
const BASE = "https://api.kit.com/v4";
const PUBLISH = !process.argv.includes("--unpublish");

const NAMES = [
  "Scorecard – Results",
  "Scorecard – Abandon",
  "Track A – Build the Foundations",
  "Track B – Scale the Advantage",
];

async function kit(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "X-Kit-Api-Key": KEY, ...(init.headers || {}) },
  });
  const body = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} ${res.status}: ${JSON.stringify(body).slice(0, 200)}`);
  return body;
}

async function main() {
  const list = await kit("/sequences?per_page=500");
  const byName = new Map((list.sequences || []).map((s) => [s.name, s]));
  let count = 0;
  for (const name of NAMES) {
    const seq = byName.get(name);
    if (!seq) { console.log(`⚠ sequence not found: ${name}`); continue; }
    const emails = (await kit(`/sequences/${seq.id}/emails?per_page=500`)).emails || [];
    console.log(`\n→ ${name} (${emails.length} emails)`);
    for (const e of emails) {
      if (e.published === PUBLISH) { console.log(`   · ${PUBLISH ? "already published" : "already draft"}: ${e.subject.slice(0,40)}`); continue; }
      await kit(`/sequences/${seq.id}/emails/${e.id}`, {
        method: "PUT",
        body: JSON.stringify({ published: PUBLISH }),
      });
      console.log(`   ${PUBLISH ? "✅ published" : "↩ unpublished"}: ${e.subject.slice(0,40)}`);
      count++;
    }
  }
  console.log(`\nDone. ${count} email(s) ${PUBLISH ? "published" : "unpublished"}.`);
  if (PUBLISH) console.log("Reminder: replace [LINK]/[OFFER TBD] before building the automations that subscribe people.");
}
main().catch((e) => { console.error(e); process.exit(1); });
