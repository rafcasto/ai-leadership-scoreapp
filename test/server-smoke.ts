import { readFileSync } from "fs";

// Load .env.local safely (handles $, spaces — no shell expansion)
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

const { loadContent } = await import("../api/_lib/content");
const { requireAdmin } = await import("../api/_lib/auth");
const { kitEnabled, ensureTag } = await import("../api/_lib/kit");

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean) => {
  console.log(`${cond ? "✅" : "❌"} ${label}`);
  cond ? pass++ : fail++;
};

// mock res that records status/json
function mkRes() {
  return {
    statusCode: 0 as number,
    payload: null as any,
    status(c: number) { this.statusCode = c; return this; },
    json(b: any) { this.payload = b; return this; },
  };
}

// 1. Content resilience
const content = await loadContent();
ok("loadContent returns content", !!content && content.quiz.questions.length === 11);

// 2. Sign in via Supabase Auth (GoTrue) with the publishable key
const URL_ = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const PUB = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const EMAIL = (process.env.ADMIN_EMAIL || "").split(",")[0].trim();
const PASSWORD = process.env.ADMIN_PASSWORD!;

let accessToken = "";
try {
  const res = await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: PUB, "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  accessToken = data.access_token || "";
  ok(`Supabase sign-in succeeds for ${EMAIL}`, res.ok && !!accessToken);
} catch (e: any) {
  ok(`Supabase sign-in — ${e.message}`, false);
}

// 3. requireAdmin accepts a valid admin token
{
  const res = mkRes();
  const allowed = await requireAdmin({ headers: { authorization: `Bearer ${accessToken}` } }, res);
  ok("requireAdmin accepts valid admin token", allowed === true);
}

// 4. requireAdmin rejects no token / bad token
{
  const r1 = mkRes();
  const a1 = await requireAdmin({ headers: {} }, r1);
  ok("requireAdmin rejects missing token (401)", a1 === false && r1.statusCode === 401);

  const r2 = mkRes();
  const a2 = await requireAdmin({ headers: { authorization: "Bearer not.a.real.token" } }, r2);
  ok("requireAdmin rejects bad token (401)", a2 === false && r2.statusCode === 401);
}

// 5. Kit connectivity
ok("Kit enabled (key present)", kitEnabled());
try {
  const id = await ensureTag("Source: AI Readiness Scorecard");
  ok(`Kit reachable — tag id resolved (${id})`, id !== null);
} catch (e: any) {
  ok(`Kit reachable — ${e.message}`, false);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
