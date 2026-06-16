// Creates (or updates) the admin user in Supabase Auth from ADMIN_EMAIL /
// ADMIN_PASSWORD, with app_metadata.role = "admin". Idempotent.
// Uses the GoTrue admin REST API directly (no supabase-js → no WS dependency).
//   node scripts/setup-admin.mjs
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
const EMAIL = (process.env.ADMIN_EMAIL || "").split(",")[0].trim();
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!URL_ || !SECRET) { console.error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY"); process.exit(1); }
if (!EMAIL || !PASSWORD) { console.error("Missing ADMIN_EMAIL / ADMIN_PASSWORD"); process.exit(1); }

const H = { apikey: SECRET, Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" };

async function gotrue(path, init = {}) {
  const res = await fetch(`${URL_}/auth/v1${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  const body = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

async function findByEmail(email) {
  for (let page = 1; page <= 20; page++) {
    const data = await gotrue(`/admin/users?page=${page}&per_page=200`);
    const users = data.users || [];
    const u = users.find((x) => (x.email || "").toLowerCase() === email.toLowerCase());
    if (u) return u;
    if (users.length < 200) break;
  }
  return null;
}

async function main() {
  console.log(`→ Admin user: ${EMAIL}`);
  const existing = await findByEmail(EMAIL);

  if (!existing) {
    const u = await gotrue(`/admin/users`, {
      method: "POST",
      body: JSON.stringify({
        email: EMAIL, password: PASSWORD, email_confirm: true,
        app_metadata: { role: "admin" },
      }),
    });
    console.log(`  ✅ created admin user (id ${u.id}), role=admin`);
  } else {
    const u = await gotrue(`/admin/users/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify({
        password: PASSWORD, email_confirm: true,
        app_metadata: { ...(existing.app_metadata || {}), role: "admin" },
      }),
    });
    console.log(`  ♻ updated existing user (id ${u.id}): password reset + role=admin`);
  }

  console.log("\n✅ Done. Sign in at /admin with this email + password.");
  console.log("   Authorization = JWT app_metadata.role 'admin' OR email in ADMIN_EMAIL allowlist.");
}
main().catch((e) => { console.error(e); process.exit(1); });
