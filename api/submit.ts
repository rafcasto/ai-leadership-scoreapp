import { admin } from "./_lib/supabase.js";
import { loadContent } from "./_lib/content.js";
import { computeScores, AnswerMap } from "../shared/scoring.js";
import { applyTags, upsertSubscriber, kitEnabled, subscribeToSequences } from "./_lib/kit.js";

// POST /api/submit — score the completed scorecard, persist it, update the
// lead + Kit subscriber (scores, tier, focus), and trigger the drip sequences.
// Returns the submission id so the client can route to /results/:id.
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

    const subRow: Record<string, any> = {
      lead_id: leadId || null,
      first_name: lead?.first_name || null,
      last_name: lead?.last_name || null,
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
    };
    let { data: sub, error } = await db.from("submissions").insert(subRow).select("id").single();
    if (error && /last_name/i.test(error.message || "")) {
      delete subRow.last_name;
      ({ data: sub, error } = await db.from("submissions").insert(subRow).select("id").single());
    }
    if (error) throw error;
    if (!sub) throw new Error("Could not save submission.");

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

    // Kit completion sync — AWAIT it. On serverless the function is frozen the
    // moment the response is sent, so fire-and-forget work never runs. Wrapped
    // in try/catch so a Kit hiccup never breaks the user's results.
    if (kitEnabled() && lead?.email) {
      try {
        await upsertSubscriber({
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
        });
        await applyTags(lead.email, [
          "Scorecard Completed",
          `Tier: ${r.tier}`,
          `Focus: ${r.lowestCategoryLabel}`,
        ]);
        // Trigger the drip directly — no Kit visual automation needed: the
        // results email + the tier-appropriate nurture track. (Names must match
        // the sequences created by scripts/create-sequences.mjs, en-dash and all.)
        const track =
          r.tier === "AI Enabled" || r.tier === "AI-First Leaders"
            ? "Track B – Scale the Advantage"
            : "Track A – Build the Foundations";
        await subscribeToSequences(lead.email, ["Scorecard – Results", track]);
      } catch {}
    }

    res.status(200).json({ submissionId: sub.id, result: r, reportUrl });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Could not score submission." });
  }
}
