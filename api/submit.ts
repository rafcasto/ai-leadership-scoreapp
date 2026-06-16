import { admin } from "./_lib/supabase";
import { loadContent } from "./_lib/content";
import { computeScores, AnswerMap } from "../shared/scoring";
import { applyTags, upsertSubscriber, kitEnabled } from "./_lib/kit";

// POST /api/submit — score the completed scorecard, persist it, update the
// lead + Kit subscriber (scores, tier, focus). Returns the submission id so the
// client can route to /results/:id.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { leadId, answers, origin } = (req.body || {}) as {
    leadId?: string;
    answers?: AnswerMap;
    origin?: string;
  };
  if (!answers || typeof answers !== "object") {
    res.status(400).json({ error: "Missing answers." });
    return;
  }

  try {
    const content = await loadContent();
    const r = computeScores(content, answers);
    const db = admin();

    // Fetch lead profile if we have one
    let lead: any = null;
    if (leadId) {
      const { data } = await db
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .maybeSingle();
      lead = data;
    }

    const { data: sub, error } = await db
      .from("submissions")
      .insert({
        lead_id: leadId || null,
        first_name: lead?.first_name || null,
        email: lead?.email || null,
        company: lead?.company || null,
        role_level: lead?.role_level || null,
        company_size: lead?.company_size || null,
        knowledge_score: r.knowledge,
        mindset_score: r.mindset,
        skills_score: r.skills,
        leadership_score: r.leadership,
        overall_score: r.overall,
        overall_tier: r.tier,
        lowest_category: r.lowestCategoryLabel,
        not_sure_count: r.notSureCount,
        ai_interests: r.interests,
        answers,
      })
      .select("id")
      .single();
    if (error) throw error;

    const reportUrl = origin ? `${origin}/results/${sub.id}` : `/results/${sub.id}`;

    if (leadId) {
      await db
        .from("leads")
        .update({
          status: "completed",
          ai_interests: r.interests,
          updated_at: new Date().toISOString(),
        })
        .eq("id", leadId);
    }

    // Best-effort Kit completion sync
    if (kitEnabled() && lead?.email) {
      upsertSubscriber({
        email: lead.email,
        firstName: lead.first_name,
        fields: {
          ai_overall_score: r.overall,
          ai_overall_tier: r.tier,
          knowledge_score: r.knowledge ?? "",
          mindset_score: r.mindset ?? "",
          skills_score: r.skills ?? "",
          leadership_score: r.leadership ?? "",
          lowest_category: r.lowestCategoryLabel,
          ai_interests: r.interests.join(", "),
          report_url: reportUrl,
        },
      })
        .then(() =>
          applyTags(lead.email, [
            "Scorecard Completed",
            `Tier: ${r.tier}`,
            `Focus: ${r.lowestCategoryLabel}`,
          ])
        )
        .catch(() => {});
    }

    res.status(200).json({ submissionId: sub.id, result: r, reportUrl });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Could not score submission." });
  }
}
