// Kit (ConvertKit) v4 API client — server only. Reads KIT_API_KEY from env.
// All calls are best-effort: a Kit failure must never block the user's flow.

const BASE = "https://api.kit.com/v4";

function apiKey(): string {
  return process.env.KIT_API_KEY || "";
}

async function kit(path: string, init: RequestInit = {}): Promise<any> {
  const key = apiKey();
  if (!key) return null;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": key,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Kit ${path} ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.status === 204 ? null : res.json();
}

export async function upsertSubscriber(params: {
  email: string;
  firstName?: string;
  fields?: Record<string, string | number | undefined>;
}): Promise<void> {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(params.fields || {})) {
    if (v !== undefined && v !== null && v !== "") fields[k] = v;
  }
  await kit("/subscribers", {
    method: "POST",
    body: JSON.stringify({
      email_address: params.email,
      first_name: params.firstName,
      fields,
    }),
  });
}

// Tag a subscriber by tag NAME (Kit auto-creates by name via this endpoint
// pattern; if your account uses IDs, set KIT_TAG_* env vars and adapt).
export async function tagSubscriber(
  email: string,
  tagId: string | number
): Promise<void> {
  await kit(`/tags/${tagId}/subscribers`, {
    method: "POST",
    body: JSON.stringify({ email_address: email }),
  });
}

// Resolve (or create) a tag id by name, cached in-process (by lowercase name).
const tagCache = new Map<string, number>();
let tagsLoaded = false;
export async function ensureTag(name: string): Promise<number | null> {
  const key = name.toLowerCase();
  if (tagCache.has(key)) return tagCache.get(key)!;
  try {
    if (!tagsLoaded) {
      const list = await kit(`/tags?per_page=500`);
      for (const t of list?.tags || []) {
        if (t?.name && t?.id) tagCache.set(String(t.name).toLowerCase(), t.id);
      }
      tagsLoaded = true;
      if (tagCache.has(key)) return tagCache.get(key)!;
    }
    const created = await kit(`/tags`, { method: "POST", body: JSON.stringify({ name }) });
    const id = created?.tag?.id;
    if (id) tagCache.set(key, id);
    return id || null;
  } catch {
    return null;
  }
}

export async function applyTags(email: string, names: string[]): Promise<void> {
  for (const name of names) {
    const id = await ensureTag(name);
    if (id) await tagSubscriber(email, id).catch(() => {});
  }
}

export function kitEnabled(): boolean {
  return !!apiKey();
}

// Resolve a sequence id by name (cached), then subscribe people directly — this
// lets the app trigger the drip itself, with no Kit visual automation required.
const seqCache = new Map<string, number>();
let seqLoaded = false;
async function sequenceIdByName(name: string): Promise<number | null> {
  const key = name.toLowerCase();
  if (seqCache.has(key)) return seqCache.get(key)!;
  try {
    if (!seqLoaded) {
      const list = await kit(`/sequences?per_page=500`);
      for (const s of list?.sequences || []) {
        if (s?.name && s?.id) seqCache.set(String(s.name).toLowerCase(), s.id);
      }
      seqLoaded = true;
    }
    return seqCache.get(key) ?? null;
  } catch {
    return null;
  }
}

export async function subscribeToSequences(
  email: string,
  names: string[]
): Promise<void> {
  for (const name of names) {
    const id = await sequenceIdByName(name);
    if (!id) continue;
    try {
      await kit(`/sequences/${id}/subscribers`, {
        method: "POST",
        body: JSON.stringify({ email_address: email }),
      });
    } catch {}
  }
}
