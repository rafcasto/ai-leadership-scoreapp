import { requireAdmin } from "../_lib/auth";
import { admin } from "../_lib/supabase";

// GET /api/admin/submissions → recent submissions + headline stats (admin only)
export default async function handler(req: any, res: any) {
  if (!(await requireAdmin(req, res))) return;
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const db = admin();
    const [subs, leadsCount, completedCount, bench] = await Promise.all([
      db
        .from("submissions")
        .select(
          "id, first_name, company, role_level, overall_score, overall_tier, lowest_category, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(100),
      db.from("leads").select("id", { count: "exact", head: true }),
      db
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      db.from("benchmark_stats").select("*").maybeSingle(),
    ]);

    res.status(200).json({
      submissions: subs.data || [],
      stats: {
        leads: leadsCount.count || 0,
        completed: completedCount.count || 0,
        benchmark: bench.data || { n: 0 },
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to load submissions." });
  }
}
