import { admin } from "./supabase";
import { defaultContent } from "../../shared/defaultContent";
import type { SiteContent } from "../../shared/types";

const KEY = "site";

// Loads the editable site content from Supabase, seeding defaults on first run.
// Falls back to the bundled defaults if the table is empty or unavailable.
export async function loadContent(): Promise<SiteContent> {
  try {
    const db = admin();
    const { data, error } = await db
      .from("site_content")
      .select("value")
      .eq("key", KEY)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // seed defaults
      await db.from("site_content").upsert({ key: KEY, value: defaultContent });
      return defaultContent;
    }
    // shallow-merge defaults so newly added fields always exist
    return mergeContent(defaultContent, data.value as Partial<SiteContent>);
  } catch {
    return defaultContent;
  }
}

export async function saveContent(value: SiteContent): Promise<void> {
  const db = admin();
  const { error } = await db
    .from("site_content")
    .upsert({ key: KEY, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// Deep-ish merge so admin edits win but missing keys fall back to defaults.
function mergeContent(base: SiteContent, override: any): SiteContent {
  if (!override || typeof override !== "object") return base;
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...base };
  for (const k of Object.keys(base as any)) {
    const b = (base as any)[k];
    const o = override[k];
    if (o === undefined) continue;
    if (
      b &&
      typeof b === "object" &&
      !Array.isArray(b) &&
      o &&
      typeof o === "object"
    ) {
      out[k] = mergeContent(b as any, o);
    } else {
      out[k] = o; // arrays + scalars: take the override wholesale
    }
  }
  return out as SiteContent;
}
