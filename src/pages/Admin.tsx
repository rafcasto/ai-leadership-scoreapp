import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { api, AdminStats, AdminSubmissionRow } from "../lib/api";
import { supabase, getAccessToken } from "../lib/supabaseClient";
import type { SiteContent } from "../../shared/types";

// Resolve a fresh Supabase access token, then call an admin API method with it.
async function withToken<T>(fn: (token: string) => Promise<T>): Promise<T> {
  const t = await getAccessToken();
  if (!t) throw new Error("Your session expired. Please sign in again.");
  return fn(t);
}

export default function Admin() {
  // undefined = still checking session; null = signed out; Session = signed in
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="admin-shell" style={{ minHeight: "100vh" }}><div className="spinner" /></div>;
  }
  if (!session) return <Login />;
  return (
    <Dashboard
      email={session.user.email || ""}
      onLogout={() => supabase.auth.signOut()}
    />
  );
}

/* ---------------- Login (Supabase Auth) ---------------- */
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErr(error.message); setBusy(false); }
    // on success, onAuthStateChange swaps the view
  };

  return (
    <div className="admin-shell" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <form className="admin-card" style={{ width: 380 }} onSubmit={submit}>
        <img src="/brand/logo-jobhackers.png" alt="" style={{ height: 30, marginBottom: 18 }} />
        <h3 style={{ marginBottom: 6 }}>Scorecard Admin</h3>
        <p className="muted" style={{ fontSize: 14, marginBottom: 18 }}>
          Sign in with your Supabase admin account to edit copy, questions, and view results.
        </p>
        {err && <div className="toast toast--err" style={{ marginBottom: 12 }}>{err}</div>}
        <div className="admin-field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus autoComplete="username" />
        </div>
        <div className="admin-field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <button className="btn btn--primary btn--block" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}

/* ---------------- Dashboard shell ---------------- */
type Tab = "dashboard" | "site" | "landing" | "lead" | "questions" | "results";

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [toast, setToast] = useState<{ k: "ok" | "err"; m: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    withToken(api.adminGetContent)
      .then((r) => setContent(r.content))
      .catch((e) => setToast({ k: "err", m: e.message }));
  }, []);

  const setIn = (path: (string | number)[], value: any) => {
    setContent((prev) => {
      if (!prev) return prev;
      const clone: any = structuredClone(prev);
      let node = clone;
      for (let i = 0; i < path.length - 1; i++) node = node[path[i]];
      node[path[path.length - 1]] = value;
      return clone;
    });
  };

  const save = async () => {
    if (!content) return;
    setSaving(true); setToast(null);
    try {
      await withToken((t) => api.adminSaveContent(t, content));
      setToast({ k: "ok", m: "Saved. Live site updated." });
    } catch (e: any) { setToast({ k: "err", m: e.message }); } finally { setSaving(false); }
  };

  return (
    <div className="admin-shell">
      <div className="admin-bar">
        <div className="container admin-bar__inner">
          <span className="admin-bar__title">⚙️ Scorecard Admin</span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {email && <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>{email}</span>}
            <a href="/" style={{ color: "#fff", fontSize: 13 }}>View site ↗</a>
            <button className="btn btn--ghost" style={{ color: "#fff" }} onClick={onLogout}>Sign out</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="admin-tabs">
          {(["dashboard", "site", "landing", "lead", "questions", "results"] as Tab[]).map((t) => (
            <button key={t} className={"admin-tab" + (tab === t ? " is-active" : "")} onClick={() => setTab(t)}>
              {t === "dashboard" ? "Dashboard" : t === "site" ? "Site & Meta" : t === "lead" ? "Lead Form" : t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "dashboard" && <DashboardTab />}

        {tab !== "dashboard" && !content && <div className="spinner" />}

        {tab !== "dashboard" && content && (
          <>
            {tab === "site" && <SiteTab content={content} setIn={setIn} />}
            {tab === "landing" && <LandingTab content={content} setIn={setIn} />}
            {tab === "lead" && <LeadTab content={content} setIn={setIn} />}
            {tab === "questions" && <QuestionsTab content={content} setIn={setIn} />}
            {tab === "results" && <ResultsTab content={content} setIn={setIn} />}

            <div className="save-bar">
              {toast && <span className={`toast toast--${toast.k}`}>{toast.m}</span>}
              <button className="btn btn--primary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Small editor atoms ---------------- */
type SetIn = (path: (string | number)[], value: any) => void;

function Text({ label, value, onChange, area }: { label: string; value: string; onChange: (v: string) => void; area?: boolean }) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      {area ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

/* ---------------- Tabs ---------------- */
function SiteTab({ content, setIn }: { content: SiteContent; setIn: SetIn }) {
  const m = content.meta;
  return (
    <div className="admin-card">
      <h4 style={{ marginBottom: 16 }}>Site & brand</h4>
      <Text label="Brand name" value={m.brandName} onChange={(v) => setIn(["meta", "brandName"], v)} />
      <Text label="Product name" value={m.productName} onChange={(v) => setIn(["meta", "productName"], v)} />
      <Text label="Tagline" value={m.tagline} onChange={(v) => setIn(["meta", "tagline"], v)} />
      <Text label="Footer note" value={m.footerNote} onChange={(v) => setIn(["meta", "footerNote"], v)} />
      <Text label="Debrief / CTA link (interim offer URL)" value={m.debriefUrl} onChange={(v) => setIn(["meta", "debriefUrl"], v)} />
    </div>
  );
}

function LandingTab({ content, setIn }: { content: SiteContent; setIn: SetIn }) {
  const L = content.landing;
  const t = (k: keyof typeof L, label: string, area = false) => (
    <Text label={label} value={(L as any)[k]} onChange={(v) => setIn(["landing", k as string], v)} area={area} />
  );
  return (
    <>
      <div className="admin-card">
        <h4 style={{ marginBottom: 16 }}>Hero</h4>
        {t("eyebrow", "Eyebrow")}
        <div className="grid-2">
          {t("h1Pre", "Headline — before accent")}
          {t("h1Accent", "Headline — accent word")}
        </div>
        {t("h1Post", "Headline — after accent")}
        {t("lede", "Lede (supports <strong> HTML)", true)}
        <div className="grid-2">
          {t("primaryCta", "Primary CTA button")}
          {t("primaryCtaSub", "CTA subtext")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {t("metricA", "Metric A")}{t("metricALabel", "Metric A label")}
          {t("metricB", "Metric B")}{t("metricBLabel", "Metric B label")}
          {t("metricC", "Metric C")}{t("metricCLabel", "Metric C label")}
        </div>
      </div>

      <div className="admin-card">
        <h4 style={{ marginBottom: 16 }}>Credibility</h4>
        {t("credEyebrow", "Eyebrow")}
        {t("credQuote", "Quote", true)}
        {t("credAttribution", "Attribution", true)}
      </div>

      <div className="admin-card">
        <h4 style={{ marginBottom: 16 }}>Pillars</h4>
        {t("pillarsEyebrow", "Eyebrow")}
        {t("pillarsTitle", "Title")}
        {t("pillarsLede", "Lede", true)}
        {L.pillars.map((p, i) => (
          <div className="admin-q" key={i}>
            <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 12 }}>
              <Text label="Emoji" value={p.emoji} onChange={(v) => setIn(["landing", "pillars", i, "emoji"], v)} />
              <Text label="Title" value={p.title} onChange={(v) => setIn(["landing", "pillars", i, "title"], v)} />
            </div>
            <Text label="Description" value={p.desc} onChange={(v) => setIn(["landing", "pillars", i, "desc"], v)} area />
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h4 style={{ marginBottom: 16 }}>Connection + final CTA</h4>
        {t("connectionEyebrow", "Connection eyebrow")}
        {t("connectionTitle", "Connection title")}
        {t("connectionBody", "Connection body", true)}
        {t("finalCtaTitle", "Final CTA title")}
        {t("finalCtaBody", "Final CTA body", true)}
        {t("finalCtaButton", "Final CTA button")}
      </div>
    </>
  );
}

function LeadTab({ content, setIn }: { content: SiteContent; setIn: SetIn }) {
  const Lc = content.lead;
  return (
    <div className="admin-card">
      <h4 style={{ marginBottom: 16 }}>Lead capture form</h4>
      <Text label="Title" value={Lc.title} onChange={(v) => setIn(["lead", "title"], v)} />
      <Text label="Subtitle" value={Lc.subtitle} onChange={(v) => setIn(["lead", "subtitle"], v)} area />
      <Text label="Submit button" value={Lc.submitCta} onChange={(v) => setIn(["lead", "submitCta"], v)} />
      <Text label="Consent note" value={Lc.consentNote} onChange={(v) => setIn(["lead", "consentNote"], v)} area />
      <Text label="Role options (comma-separated)" value={Lc.roleOptions.join(", ")}
        onChange={(v) => setIn(["lead", "roleOptions"], v.split(",").map((s) => s.trim()).filter(Boolean))} />
      <Text label="Company size options (comma-separated)" value={Lc.sizeOptions.join(", ")}
        onChange={(v) => setIn(["lead", "sizeOptions"], v.split(",").map((s) => s.trim()).filter(Boolean))} />
    </div>
  );
}

function QuestionsTab({ content, setIn }: { content: SiteContent; setIn: SetIn }) {
  return (
    <div className="admin-card">
      <h4 style={{ marginBottom: 6 }}>Questions & answers</h4>
      <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
        Edit question and answer wording, and per-answer points. Scoring structure (categories, max points) stays fixed. “Points” of <em>null</em> means the answer is excluded from the average (a “not sure” option).
      </p>
      {content.quiz.questions.map((q, qi) => (
        <div className="admin-q" key={q.id}>
          <div className="admin-q__tag">{q.id.toUpperCase()} · {q.category} · {q.type}</div>
          <Text label="Prompt" value={q.prompt} onChange={(v) => setIn(["quiz", "questions", qi, "prompt"], v)} area />
          {q.help !== undefined && (
            <Text label="Help text" value={q.help || ""} onChange={(v) => setIn(["quiz", "questions", qi, "help"], v)} />
          )}
          <div className="admin-field" style={{ marginBottom: 6 }}><label>Answers</label></div>
          {q.options.map((o, oi) => (
            <div className="admin-answer-row" key={o.id}>
              <input value={o.label} onChange={(e) => setIn(["quiz", "questions", qi, "options", oi, "label"], e.target.value)} />
              <input
                type="text"
                value={o.points === null ? "null" : String(o.points)}
                onChange={(e) => {
                  const raw = e.target.value.trim();
                  const val = raw === "" || raw.toLowerCase() === "null" ? null : Number(raw);
                  setIn(["quiz", "questions", qi, "options", oi, "points"], Number.isNaN(val as number) ? o.points : val);
                }}
                title="Points (or 'null' to exclude)"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ResultsTab({ content, setIn }: { content: SiteContent; setIn: SetIn }) {
  const R = content.results;
  return (
    <>
      <div className="admin-card">
        <h4 style={{ marginBottom: 16 }}>Results copy</h4>
        <Text label="Headline" value={R.headline} onChange={(v) => setIn(["results", "headline"], v)} />
        <Text label="Opportunity eyebrow" value={R.opportunityEyebrow} onChange={(v) => setIn(["results", "opportunityEyebrow"], v)} />
        <Text label="Opportunity intro" value={R.opportunityIntro} onChange={(v) => setIn(["results", "opportunityIntro"], v)} area />
        <Text label="Recommendations title" value={R.recTitle} onChange={(v) => setIn(["results", "recTitle"], v)} />
        <div className="grid-2">
          <Text label="Download button" value={R.downloadCta} onChange={(v) => setIn(["results", "downloadCta"], v)} />
          <Text label="Primary CTA" value={R.primaryCta} onChange={(v) => setIn(["results", "primaryCta"], v)} />
        </div>
      </div>

      <div className="admin-card">
        <h4 style={{ marginBottom: 16 }}>Tiers</h4>
        {R.tiers.map((t, i) => (
          <div className="admin-q" key={t.key}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 12 }}>
              <Text label="Name" value={t.name} onChange={(v) => setIn(["results", "tiers", i, "name"], v)} />
              <Text label="Min" value={String(t.min)} onChange={(v) => setIn(["results", "tiers", i, "min"], Number(v))} />
              <Text label="Max" value={String(t.max)} onChange={(v) => setIn(["results", "tiers", i, "max"], Number(v))} />
            </div>
            <Text label="Meaning" value={t.meaning} onChange={(v) => setIn(["results", "tiers", i, "meaning"], v)} area />
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h4 style={{ marginBottom: 16 }}>Category recommendations</h4>
        {R.categories.map((c, i) => (
          <div className="admin-q" key={c.key}>
            <div className="admin-q__tag">{c.emoji} {c.label}</div>
            <Text label="High (3.8–5.0)" value={c.recHigh} onChange={(v) => setIn(["results", "categories", i, "recHigh"], v)} area />
            <Text label="Medium (2.5–3.7)" value={c.recMedium} onChange={(v) => setIn(["results", "categories", i, "recMedium"], v)} area />
            <Text label="Low (1.0–2.4)" value={c.recLow} onChange={(v) => setIn(["results", "categories", i, "recLow"], v)} area />
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- Dashboard tab ---------------- */
function DashboardTab() {
  const [rows, setRows] = useState<AdminSubmissionRow[] | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    withToken(api.adminSubmissions)
      .then((r) => { setRows(r.submissions); setStats(r.stats); })
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="toast toast--err">{err}</div>;
  if (!rows || !stats) return <div className="spinner" />;

  const b = stats.benchmark;
  return (
    <>
      <div className="stat-grid">
        <div className="stat"><div className="stat__n">{stats.leads}</div><div className="stat__l">Leads captured</div></div>
        <div className="stat"><div className="stat__n">{stats.completed}</div><div className="stat__l">Completed</div></div>
        <div className="stat"><div className="stat__n">{stats.leads ? Math.round((stats.completed / stats.leads) * 100) : 0}%</div><div className="stat__l">Completion rate</div></div>
        <div className="stat"><div className="stat__n">{b?.n ?? 0}</div><div className="stat__l">Scored (benchmark n)</div></div>
      </div>

      {b && b.n > 0 && (
        <div className="admin-card">
          <h4 style={{ marginBottom: 12 }}>Company averages (benchmark lines)</h4>
          <div className="stat-grid">
            <div className="stat"><div className="stat__n">{b.knowledge_avg ?? "—"}</div><div className="stat__l">Knowledge</div></div>
            <div className="stat"><div className="stat__n">{b.mindset_avg ?? "—"}</div><div className="stat__l">Mindset</div></div>
            <div className="stat"><div className="stat__n">{b.skills_avg ?? "—"}</div><div className="stat__l">Skills</div></div>
            <div className="stat"><div className="stat__n">{b.leadership_avg ?? "—"}</div><div className="stat__l">Leadership</div></div>
          </div>
        </div>
      )}

      <h4 style={{ margin: "8px 0 12px" }}>Recent submissions</h4>
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Company</th><th>Role</th><th>Overall</th><th>Tier</th><th>Focus</th><th>Date</th></tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={7} className="muted">No submissions yet.</td></tr>}
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.first_name || "—"}</td>
              <td>{r.company || "—"}</td>
              <td>{r.role_level || "—"}</td>
              <td><strong>{r.overall_score?.toFixed(1)}</strong></td>
              <td>{r.overall_tier}</td>
              <td>{r.lowest_category || "—"}</td>
              <td>{new Date(r.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
