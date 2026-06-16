// AI Dojo brand marks — pure inline SVG/CSS, no raster assets.
import BenchmarkChart from "./BenchmarkChart";
import type { CategoryKey } from "../../shared/types";
import type { Benchmark } from "../lib/api";

export function EnsoMark({ size = 28, color = "var(--jh-red)" }: { size?: number; color?: string }) {
  // An "enso" — the zen/dojo open brush-circle. Discipline + mastery.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden focusable="false">
      <path
        d="M22.5 7.2 A11 11 0 1 0 25.2 18.4"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="25.4" cy="18.1" r="1.9" fill={color} />
    </svg>
  );
}

export function Logo({ variant = "dark", size = 22 }: { variant?: "dark" | "light"; size?: number }) {
  const ink = variant === "light" ? "#ffffff" : "var(--jh-ink)";
  const accent = variant === "light" ? "#ffffff" : "var(--jh-red)";
  return (
    <span className="logo" style={{ ["--logo-size" as any]: `${size}px` }}>
      <EnsoMark size={size + 8} color={accent} />
      <span className="logo__word" style={{ color: ink }}>
        AI&nbsp;<span style={{ fontWeight: 800 }}>Dojo</span>
      </span>
    </span>
  );
}

// Hero visual — a preview of the actual report a leader receives: the same
// benchmark chart component used on the results page, with sample scores.
export function HeroPreview() {
  const scores: Record<CategoryKey, number | null> = {
    knowledge: 4.3,
    mindset: 3.9,
    skills: 3.4,
    leadership: 4.1,
  };
  const labels: Record<CategoryKey, string> = {
    knowledge: "Knowledge",
    mindset: "Mindset",
    skills: "Skills",
    leadership: "Leadership",
  };
  // sample aggregate so the company-average + quartile lines render too
  const benchmark: Benchmark = {
    n: 128,
    knowledge_avg: 3.6, mindset_avg: 3.2, skills_avg: 3.3, leadership_avg: 3.5,
    knowledge_p25: 2.9, knowledge_p75: 4.2,
    mindset_p25: 2.6, mindset_p75: 4.0,
    skills_p25: 2.7, skills_p75: 3.9,
    leadership_p25: 3.0, leadership_p75: 4.4,
  };

  return (
    <div className="hero-visual" aria-hidden>
      <div className="hero-report-card">
        <div className="hrc-head">
          <span className="hero-visual__eyebrow">AI Leadership Readiness Report</span>
          <span className="tier-badge">AI Enabled</span>
        </div>
        <div className="hrc-score">3.9<span>/5</span></div>
        <BenchmarkChart scores={scores} benchmark={benchmark} labels={labels} />
        <div className="hrc-foot">
          <span className="hv-dot" /> Biggest opportunity:<strong>&nbsp;Skills</strong>
        </div>
      </div>
    </div>
  );
}
