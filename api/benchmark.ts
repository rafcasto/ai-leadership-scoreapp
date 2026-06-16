import { admin } from "./_lib/supabase.js";

// GET /api/benchmark — aggregate company average + high/low quartile lines for
// the benchmark chart. Returns nulls when there isn't enough data yet.
export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const db = admin();
    const { data, error } = await db
      .from("benchmark_stats")
      .select("*")
      .maybeSingle();
    if (error) throw error;
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    res.status(200).json({ benchmark: data || { n: 0 } });
  } catch (e: any) {
    res.status(200).json({ benchmark: { n: 0 }, note: e?.message });
  }
}
