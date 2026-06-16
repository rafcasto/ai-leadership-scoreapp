import { requireAdmin } from "../_lib/auth.js";
import { loadContent, saveContent } from "../_lib/content.js";
import type { SiteContent } from "../../shared/types.js";

// GET  /api/admin/content → full editable content (admin only)
// PUT  /api/admin/content { content } → save (admin only)
export default async function handler(req: any, res: any) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === "GET") {
    try {
      const content = await loadContent();
      res.status(200).json({ content });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Failed to load." });
    }
    return;
  }

  if (req.method === "PUT") {
    const content = (req.body?.content || null) as SiteContent | null;
    if (!content || !content.quiz || !content.landing) {
      res.status(400).json({ error: "Invalid content payload." });
      return;
    }
    try {
      await saveContent(content);
      res.status(200).json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Failed to save." });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
