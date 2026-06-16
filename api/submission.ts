import { admin } from "./_lib/supabase";

// GET /api/submission?id=... — fetch one completed scorecard for the results
// page. Returns only display-safe fields (no answers, no email).
export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const id = (req.query?.id as string) || "";
  if (!id) {
    res.status(400).json({ error: "Missing id." });
    return;
  }
  try {
    const db = admin();
    const { data, error } = await db
      .from("submissions")
      .select(
        "id, first_name, company, knowledge_score, mindset_score, skills_score, leadership_score, overall_score, overall_tier, lowest_category, not_sure_count, ai_interests, created_at"
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "Not found." });
      return;
    }
    res.status(200).json({ submission: data });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to load submission." });
  }
}
