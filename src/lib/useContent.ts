import { useEffect, useState } from "react";
import { api } from "./api";
import { defaultContent } from "../../shared/defaultContent";
import type { SiteContent } from "../../shared/types";

// Loads public site content. Falls back to the bundled defaults if the API is
// unreachable so the landing page / quiz always render (the defaults contain
// only copy — no secrets).
export function useContent() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .getContent()
      .then((r) => alive && setContent(r.content))
      .catch((e) => {
        if (!alive) return;
        setError(e.message);
        setContent(defaultContent); // graceful fallback
      });
    return () => {
      alive = false;
    };
  }, []);

  return { content, error };
}
