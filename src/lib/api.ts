import type { SiteContent, LeadInput, ScoreResult } from "../../shared/types";
import type { AnswerMap } from "../../shared/scoring";

async function jget<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  getContent: () => jget<{ content: SiteContent }>("/api/content"),

  createLead: (lead: LeadInput) =>
    jget<{ leadId: string }>("/api/lead", {
      method: "POST",
      body: JSON.stringify(lead),
    }),

  submit: (leadId: string | null, answers: AnswerMap) =>
    jget<{ submissionId: string; result: ScoreResult; reportUrl: string }>(
      "/api/submit",
      {
        method: "POST",
        body: JSON.stringify({ leadId, answers, origin: window.location.origin }),
      }
    ),

  getSubmission: (id: string) =>
    jget<{ submission: SubmissionRow }>(`/api/submission?id=${encodeURIComponent(id)}`),

  getBenchmark: () => jget<{ benchmark: Benchmark }>("/api/benchmark"),

  // ---- admin (token = Supabase Auth access token) ----
  adminGetContent: (token: string) =>
    jget<{ content: SiteContent }>("/api/admin/content", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminSaveContent: (token: string, content: SiteContent) =>
    jget<{ ok: boolean }>("/api/admin/content", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    }),

  adminSubmissions: (token: string) =>
    jget<{ submissions: AdminSubmissionRow[]; stats: AdminStats }>(
      "/api/admin/submissions",
      { headers: { Authorization: `Bearer ${token}` } }
    ),
};

export interface SubmissionRow {
  id: string;
  first_name: string | null;
  company: string | null;
  knowledge_score: number | null;
  mindset_score: number | null;
  skills_score: number | null;
  leadership_score: number | null;
  overall_score: number;
  overall_tier: string;
  lowest_category: string | null;
  not_sure_count: number;
  ai_interests: string[];
  created_at: string;
}

export interface Benchmark {
  n: number;
  knowledge_avg?: number; mindset_avg?: number; skills_avg?: number; leadership_avg?: number;
  knowledge_p25?: number; knowledge_p75?: number;
  mindset_p25?: number; mindset_p75?: number;
  skills_p25?: number; skills_p75?: number;
  leadership_p25?: number; leadership_p75?: number;
}

export interface AdminSubmissionRow {
  id: string;
  first_name: string | null;
  company: string | null;
  role_level: string | null;
  overall_score: number;
  overall_tier: string;
  lowest_category: string | null;
  created_at: string;
}

export interface AdminStats {
  leads: number;
  completed: number;
  benchmark: Benchmark;
}
