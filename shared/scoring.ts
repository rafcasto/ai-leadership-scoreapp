import type {
  CategoryKey,
  Question,
  ScoreResult,
  SiteContent,
} from "./types";

// answers: map of questionId -> selected option id (single) OR option ids (multi)
export type AnswerMap = Record<string, string | string[]>;

const CATEGORY_ORDER: CategoryKey[] = [
  "knowledge",
  "mindset",
  "skills",
  "leadership",
];

interface Accum {
  earned: number;
  max: number;
}

function bandPoints(q: Question, count: number): number {
  const band = (q.bands || []).find((b) => count >= b.min && count <= b.max);
  return band ? band.points : 1;
}

/**
 * Compute the per-category 1–5 averages, the overall average, the tier, and
 * the lowest category. "Not sure" (null) answers are excluded from a category's
 * max so uncertainty doesn't deflate the chart.
 */
export function computeScores(
  content: SiteContent,
  answers: AnswerMap
): ScoreResult {
  const acc: Record<CategoryKey, Accum> = {
    knowledge: { earned: 0, max: 0 },
    mindset: { earned: 0, max: 0 },
    skills: { earned: 0, max: 0 },
    leadership: { earned: 0, max: 0 },
  };

  let notSureCount = 0;
  const interests: string[] = [];

  for (const q of content.quiz.questions) {
    const raw = answers[q.id];

    if (q.type === "multi_interests") {
      const ids = Array.isArray(raw) ? raw : raw ? [raw] : [];
      for (const id of ids) {
        const opt = q.options.find((o) => o.id === id);
        if (opt && opt.label.toLowerCase() !== "none of the above") {
          interests.push(opt.label);
        }
      }
      continue; // not scored
    }

    if (q.type === "multi_count") {
      const ids = Array.isArray(raw) ? raw : raw ? [raw] : [];
      // "None of the above" (points 0) clears the rest
      const hasNone = ids.some((id) => {
        const o = q.options.find((x) => x.id === id);
        return o && o.points === 0;
      });
      const count = hasNone
        ? 0
        : ids.filter((id) => {
            const o = q.options.find((x) => x.id === id);
            return o && (o.points ?? 0) > 0;
          }).length;
      acc[q.category].earned += bandPoints(q, count);
      acc[q.category].max += 5;
      continue;
    }

    // single
    const optId = Array.isArray(raw) ? raw[0] : raw;
    const opt = q.options.find((o) => o.id === optId);
    if (!opt) continue; // unanswered — skip (treated as excluded)
    if (opt.points === null) {
      notSureCount += 1;
      continue; // excluded from max
    }
    acc[q.category].earned += opt.points;
    acc[q.category].max += 5;
  }

  const display = (a: Accum): number | null =>
    a.max > 0 ? round1((a.earned / a.max) * 5) : null;

  const knowledge = display(acc.knowledge);
  const mindset = display(acc.mindset);
  const skills = display(acc.skills);
  const leadership = display(acc.leadership);

  const cats: { key: CategoryKey; val: number | null }[] = [
    { key: "knowledge", val: knowledge },
    { key: "mindset", val: mindset },
    { key: "skills", val: skills },
    { key: "leadership", val: leadership },
  ];

  const present = cats.filter((c) => c.val !== null) as {
    key: CategoryKey;
    val: number;
  }[];

  const overall =
    present.length > 0
      ? round1(present.reduce((s, c) => s + c.val, 0) / present.length)
      : 0;

  // lowest scoring category (the biggest opportunity)
  const lowest = present.reduce(
    (lo, c) => (c.val < lo.val ? c : lo),
    present[0] || { key: "knowledge" as CategoryKey, val: 0 }
  );

  const tier =
    content.results.tiers.find((t) => overall >= t.min && overall <= t.max)
      ?.name ||
    content.results.tiers[0]?.name ||
    "AI Aware";

  const lowestLabel =
    content.results.categories.find((c) => c.key === lowest.key)?.label ||
    lowest.key;

  return {
    knowledge,
    mindset,
    skills,
    leadership,
    overall,
    tier,
    lowestCategory: lowest.key,
    lowestCategoryLabel: lowestLabel,
    notSureCount,
    interests,
  };
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function bandFor(score: number | null): "low" | "medium" | "high" {
  if (score === null) return "low";
  if (score >= 3.8) return "high";
  if (score >= 2.5) return "medium";
  return "low";
}

export function categoryValues(r: ScoreResult): {
  key: CategoryKey;
  value: number | null;
}[] {
  return CATEGORY_ORDER.map((key) => ({
    key,
    value: r[key] as number | null,
  }));
}

export { CATEGORY_ORDER };
