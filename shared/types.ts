// Shared types used by the SPA, the serverless API, and the scoring engine.

export type CategoryKey = "knowledge" | "mindset" | "skills" | "leadership";

export type QuestionType =
  | "single" // single choice, scored by chosen option's points (null = excluded)
  | "multi_interests" // multi-select, NOT scored — captured for segmentation
  | "multi_count"; // multi-select, scored by how many are selected (banded)

export interface AnswerOption {
  id: string;
  label: string;
  points: number | null; // null = "not sure" → excluded from the category average
}

export interface CountBand {
  min: number; // inclusive number of selections
  max: number; // inclusive
  points: number; // points (of 5) awarded for that count
}

export interface Question {
  id: string; // q1 … q11
  category: CategoryKey;
  type: QuestionType;
  prompt: string;
  help?: string;
  options: AnswerOption[];
  bands?: CountBand[]; // only for multi_count
}

export interface Pillar {
  emoji: string;
  title: string;
  desc: string;
}

export interface Tier {
  key: string;
  name: string;
  min: number; // overall average lower bound (inclusive)
  max: number; // upper bound (inclusive)
  meaning: string;
  cta: string;
}

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  emoji: string;
  accent: string; // css color
  recLow: string;
  recMedium: string;
  recHigh: string;
}

export interface SiteContent {
  meta: {
    brandName: string;
    productName: string;
    tagline: string;
    footerNote: string;
    debriefUrl: string; // interim CTA link (the "book a debrief" placeholder)
  };
  landing: {
    eyebrow: string;
    h1Pre: string;
    h1Accent: string;
    h1Post: string;
    lede: string;
    primaryCta: string;
    primaryCtaSub: string;
    metricA: string;
    metricALabel: string;
    metricB: string;
    metricBLabel: string;
    metricC: string;
    metricCLabel: string;
    credEyebrow: string;
    credQuote: string;
    credAttribution: string;
    pillarsEyebrow: string;
    pillarsTitle: string;
    pillarsLede: string;
    pillars: Pillar[];
    connectionEyebrow: string;
    connectionTitle: string;
    connectionBody: string;
    finalCtaTitle: string;
    finalCtaBody: string;
    finalCtaButton: string;
  };
  lead: {
    title: string;
    subtitle: string;
    submitCta: string;
    consentNote: string;
    roleOptions: string[];
    sizeOptions: string[];
  };
  quiz: {
    introCategoryLabels: Record<CategoryKey, string>;
    questions: Question[];
  };
  results: {
    headline: string;
    opportunityEyebrow: string;
    opportunityIntro: string;
    recTitle: string;
    downloadCta: string;
    primaryCta: string;
    tiers: Tier[];
    categories: CategoryMeta[];
  };
}

// ---- Lead + submission shapes (DB) ----
export interface LeadInput {
  first_name: string;
  email: string;
  company: string;
  role_level: string;
  company_size: string;
  phone?: string;
}

export interface ScoreResult {
  knowledge: number | null;
  mindset: number | null;
  skills: number | null;
  leadership: number | null;
  overall: number;
  tier: string;
  lowestCategory: CategoryKey;
  lowestCategoryLabel: string;
  notSureCount: number;
  interests: string[];
}
