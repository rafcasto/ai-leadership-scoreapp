// Verifies the Supabase tables exist and seeds default site content.
//   node scripts/check-db.mjs
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

const URL_ = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;
const H = { apikey: SECRET, Authorization: `Bearer ${SECRET}` };

async function exists(table) {
  const r = await fetch(`${URL_}/rest/v1/${table}?select=*&limit=1`, { headers: H });
  return r.status !== 404 && r.status !== 400;
}

async function main() {
  const tables = ["site_content", "leads", "submissions"];
  let allOk = true;
  for (const t of tables) {
    const ok = await exists(t);
    if (!ok) allOk = false;
    console.log(`  ${ok ? "✅" : "❌"} ${t}`);
  }
  if (!allOk) {
    console.log("\n❌ Tables missing. Open Supabase → SQL Editor → New query, paste");
    console.log("   the contents of supabase/schema.sql, and Run. Then re-run this script.");
    process.exit(1);
  }
  console.log("\n✅ All tables present. Loading the app once will auto-seed default content.");
}
main().catch((e) => { console.error(e); process.exit(1); });
