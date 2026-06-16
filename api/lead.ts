import { admin } from "./_lib/supabase";
import { applyTags, upsertSubscriber, kitEnabled } from "./_lib/kit";
import type { LeadInput } from "../shared/types";

// POST /api/lead — capture the lead BEFORE question 1 (enables abandonment
// recovery). Creates the lead in Supabase and pushes to Kit, tagged "Started".
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const body: LeadInput = req.body || {};
  const email = (body.email || "").trim().toLowerCase();
  const first = (body.first_name || "").trim();
  const last = (body.last_name || "").trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    res.status(400).json({ error: "A valid work email is required." });
    return;
  }
  if (!first) {
    res.status(400).json({ error: "First name is required." });
    return;
  }

  try {
    const db = admin();
    const row: Record<string, any> = {
      first_name: first,
      last_name: last || null,
      email,
      company: body.company || null,
      role_level: body.role_level || null,
      company_size: body.company_size || null,
      phone: body.phone || null,
      status: "started",
    };

    let { data, error } = await db.from("leads").insert(row).select("id").single();
    // If the last_name column hasn't been migrated yet, retry without it so the
    // funnel keeps working (run supabase/migration-2-add-last-name.sql to persist it).
    if (error && /last_name/i.test(error.message || "")) {
      delete row.last_name;
      ({ data, error } = await db.from("leads").insert(row).select("id").single());
    }
    if (error) throw error;
    if (!data) throw new Error("Could not save lead.");

    // Best-effort Kit sync (don't block on failure)
    if (kitEnabled()) {
      upsertSubscriber({
        email,
        firstName: first,
        fields: {
          last_name: last,
          company_name: body.company,
          role_level: body.role_level,
          company_size: body.company_size,
        },
      })
        .then(() =>
          applyTags(email, ["Source: AI Readiness Scorecard", "Scorecard Started"])
        )
        .catch(() => {});
    }

    res.status(200).json({ leadId: data.id });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Could not save lead." });
  }
}
