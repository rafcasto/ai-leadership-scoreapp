// AI Dojo brand marks — pure inline SVG/CSS, no raster assets.

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

// Professional hero visual — a premium preview of the readiness report card.
export function HeroPreview() {
  const cats = [
    { label: "Knowledge", v: 78 },
    { label: "Mindset", v: 64 },
    { label: "Skills", v: 58 },
    { label: "Leadership", v: 86 },
  ];
  return (
    <div className="hero-visual" aria-hidden>
      <div className="hero-visual__card">
        <div className="hero-visual__head">
          <span className="hero-visual__eyebrow">AI Readiness Report</span>
          <span className="hero-visual__badge">AI Enabled</span>
        </div>
        <div className="hero-visual__score">
          3.8<span>/5</span>
        </div>
        <div className="hero-visual__bars">
          {cats.map((c) => (
            <div className="hv-row" key={c.label}>
              <span className="hv-row__label">{c.label}</span>
              <span className="hv-row__track">
                <span className="hv-row__fill" style={{ width: `${c.v}%` }} />
              </span>
              <span className="hv-row__val">{(c.v / 20).toFixed(1)}</span>
            </div>
          ))}
        </div>
        <div className="hero-visual__foot">
          <span className="hv-dot" /> Biggest opportunity: <strong>&nbsp;Skills</strong>
        </div>
      </div>
    </div>
  );
}
