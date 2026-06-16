import { loadContent } from "./_lib/content";

// GET /api/content → the public site + quiz content (admin overrides applied).
export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const content = await loadContent();
    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=60");
    res.status(200).json({ content });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to load content" });
  }
}
