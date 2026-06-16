import { readFileSync } from "fs";

// Load .env.local safely (handles $, spaces, special chars — no shell expansion)
function loadEnv() {
  try {
    const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of txt.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim();
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {}
}
loadEnv();

const { loadContent } = await import("../api/_lib/content");
const { checkCredentials, issueToken, verifyToken } = await import("../api/_lib/auth");
const { kitEnabled, ensureTag } = await import("../api/_lib/kit");

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean) => {
  console.log(`${cond ? "✅" : "❌"} ${label}`);
  cond ? pass++ : fail++;
};

const content = await loadContent();
ok("loadContent returns content (resilient w/o tables)", !!content && !!content.quiz);
ok("content has 11 questions", content.quiz.questions.length === 11);

const goodEmail = process.env.ADMIN_EMAIL!;
const goodPass = process.env.ADMIN_PASSWORD!;
ok(`ADMIN_EMAIL loaded (${goodEmail})`, !!goodEmail);
ok("valid credentials accepted", checkCredentials(goodEmail, goodPass));
ok("wrong password rejected", !checkCredentials(goodEmail, "nope"));
ok("wrong email rejected", !checkCredentials("hacker@evil.com", goodPass));
const tok = issueToken(goodEmail);
ok("issued token verifies", verifyToken(tok));
ok("tampered token rejected", !verifyToken(tok.slice(0, -2) + "xx"));
ok("empty token rejected", !verifyToken(""));

ok("Kit enabled (key present)", kitEnabled());
try {
  const id = await ensureTag("Source: AI Readiness Scorecard");
  ok(`Kit reachable — tag id resolved (${id})`, id !== null);
} catch (e: any) {
  ok(`Kit reachable — ${e.message}`, false);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
