import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../lib/useContent";
import { Header, PageLoading } from "../components/Layout";
import { api } from "../lib/api";
import type { LeadInput, Question } from "../../shared/types";
import type { AnswerMap } from "../../shared/scoring";

type Phase = "lead" | "questions";

export default function Quiz() {
  const { content } = useContent();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("lead");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [lead, setLead] = useState<LeadInput>({
    first_name: "", last_name: "", email: "", company: "", role_level: "", company_size: "", phone: "",
  });
  const [leadErrors, setLeadErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  const questions = content?.quiz.questions || [];
  const total = questions.length;
  const current: Question | undefined = questions[step];

  const progress = useMemo(
    () => (total ? Math.round(((step + (phase === "questions" ? 1 : 0)) / (total + 1)) * 100) : 0),
    [step, total, phase]
  );

  if (!content) return <PageLoading />;
  const Lc = content.lead;

  // ---------- lead submit ----------
  const validateLead = (): boolean => {
    const e: Record<string, string> = {};
    if (!lead.first_name.trim()) e.first_name = "Required";
    if (!lead.last_name.trim()) e.last_name = "Required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) e.email = "Enter a valid work email";
    if (!lead.company.trim()) e.company = "Required";
    if (!lead.role_level) e.role_level = "Select one";
    if (!lead.company_size) e.company_size = "Select one";
    setLeadErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitLead = async () => {
    if (!validateLead()) return;
    setBusy(true);
    setApiError(null);
    try {
      const { leadId } = await api.createLead(lead);
      setLeadId(leadId);
      setPhase("questions");
      window.scrollTo({ top: 0 });
    } catch (err: any) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // ---------- answering ----------
  const setSingle = (qid: string, optId: string) =>
    setAnswers((a) => ({ ...a, [qid]: optId }));

  const toggleMulti = (qid: string, optId: string, isNone: boolean) =>
    setAnswers((a) => {
      const prev = (Array.isArray(a[qid]) ? (a[qid] as string[]) : []).slice();
      const q = questions.find((x) => x.id === qid)!;
      const noneOpt = q.options.find(
        (o) => o.label.toLowerCase().startsWith("none of the above")
      );
      if (isNone) return { ...a, [qid]: prev.includes(optId) ? [] : [optId] };
      // selecting a normal option clears "none"
      let next = prev.filter((id) => id !== noneOpt?.id);
      next = next.includes(optId) ? next.filter((id) => id !== optId) : [...next, optId];
      return { ...a, [qid]: next };
    });

  const isAnswered = (q: Question): boolean => {
    const v = answers[q.id];
    if (q.type === "single") return typeof v === "string" && !!v;
    return Array.isArray(v) && v.length > 0;
  };

  const next = async () => {
    if (!current || !isAnswered(current)) return;
    if (step < total - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    // final → submit
    setBusy(true);
    setApiError(null);
    try {
      const { submissionId } = await api.submit(leadId, answers);
      navigate(`/results/${submissionId}`);
    } catch (err: any) {
      setApiError(err.message || "Could not score your answers. Please try again.");
      setBusy(false);
    }
  };

  const back = () => {
    if (phase === "questions" && step === 0) {
      setPhase("lead");
      return;
    }
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <Header />
      <div className="page-narrow">
        {phase === "questions" && (
          <>
            <div className="progress" aria-hidden>
              <div className="progress__bar" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-meta">
              <span>Question {step + 1} of {total}</span>
              <span>{progress}%</span>
            </div>
          </>
        )}

        {apiError && <div className="toast toast--err" style={{ marginTop: 16 }}>{apiError}</div>}

        {phase === "lead" ? (
          <div className="surface" style={{ padding: 32, marginTop: 24 }}>
            <h2 style={{ marginBottom: 8 }}>{Lc.title}</h2>
            <p className="muted" style={{ marginBottom: 24 }}>{Lc.subtitle}</p>

            <div className="grid-2">
              <Field label="First name" required error={leadErrors.first_name}>
                <input value={lead.first_name}
                  onChange={(e) => setLead({ ...lead, first_name: e.target.value })}
                  placeholder="Jane" />
              </Field>
              <Field label="Last name" required error={leadErrors.last_name}>
                <input value={lead.last_name}
                  onChange={(e) => setLead({ ...lead, last_name: e.target.value })}
                  placeholder="Doe" />
              </Field>
            </div>

            <Field label="Work email" required error={leadErrors.email}>
              <input type="email" value={lead.email}
                onChange={(e) => setLead({ ...lead, email: e.target.value })}
                placeholder="jane@company.com" />
            </Field>

            <Field label="Company" required error={leadErrors.company}>
              <input value={lead.company}
                onChange={(e) => setLead({ ...lead, company: e.target.value })}
                placeholder="Acme Corp" />
            </Field>

            <div className="grid-2">
              <Field label="Role / level" required error={leadErrors.role_level}>
                <select value={lead.role_level}
                  onChange={(e) => setLead({ ...lead, role_level: e.target.value })}>
                  <option value="">Select…</option>
                  {Lc.roleOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Company size" required error={leadErrors.company_size}>
                <select value={lead.company_size}
                  onChange={(e) => setLead({ ...lead, company_size: e.target.value })}>
                  <option value="">Select…</option>
                  {Lc.sizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Phone (optional)">
              <input type="tel" value={lead.phone}
                onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                placeholder="+1 555 123 4567" />
            </Field>

            <button className="btn btn--primary btn--lg btn--block" onClick={submitLead} disabled={busy}>
              {busy ? "Saving…" : Lc.submitCta}
            </button>
            <p className="caption center" style={{ marginTop: 14, fontSize: 13, color: "var(--fg-3)" }}>
              <em>{Lc.consentNote}</em>
            </p>
          </div>
        ) : current ? (
          <div className="surface" style={{ padding: 32, marginTop: 24 }}>
            <div className="q-category">{content.quiz.introCategoryLabels[current.category]}</div>
            <div className="q-prompt">{current.prompt}</div>
            {current.help && (
              <p className="muted" style={{ marginTop: -14, marginBottom: 20 }}>
                <em>{current.help}</em>
              </p>
            )}

            <div className="q-options">
              {current.options.map((opt) => {
                const isMulti = current.type !== "single";
                const selected = isMulti
                  ? Array.isArray(answers[current.id]) &&
                    (answers[current.id] as string[]).includes(opt.id)
                  : answers[current.id] === opt.id;
                const isNone = opt.label.toLowerCase().startsWith("none of the above");
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={
                      "q-option" +
                      (isMulti ? " q-option--check" : "") +
                      (selected ? " is-selected" : "")
                    }
                    onClick={() =>
                      isMulti
                        ? toggleMulti(current.id, opt.id, isNone)
                        : setSingle(current.id, opt.id)
                    }
                  >
                    <span className="q-option__mark" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="q-nav">
              <button className="btn btn--ghost" onClick={back} disabled={busy}>← Back</button>
              <button className="btn btn--primary" onClick={next}
                disabled={busy || !isAnswered(current)}>
                {step < total - 1 ? "Next →" : busy ? "Scoring…" : "See my results →"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className={"field" + (error ? " field--error" : "")}>
      <label>{label}{required && <span className="req"> *</span>}</label>
      {children}
      {error && <span className="field__err">{error}</span>}
    </div>
  );
}
