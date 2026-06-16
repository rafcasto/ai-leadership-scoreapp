import type { Benchmark } from "../lib/api";
import type { CategoryKey } from "../../shared/types";

interface Row {
  key: CategoryKey;
  label: string;
  value: number | null;
}

interface Props {
  rows?: never;
  // individual scores
  scores: Record<CategoryKey, number | null>;
  benchmark?: Benchmark | null;
  labels: Record<CategoryKey, string>;
}

// Recreates the "AI Readiness Assessment" benchmark chart from the source
// image: one horizontal row per category on a 1–5 (Never→Always) scale, with
// the individual (red), company average (black) and high/low quartile (dashed)
// lines overlaid.
export default function BenchmarkChart({ scores, benchmark, labels }: Props) {
  // Pyramid order, top → bottom (matches the reference image)
  const order: CategoryKey[] = ["leadership", "skills", "mindset", "knowledge"];
  const rows: Row[] = order.map((key) => ({
    key,
    label: labels[key] || key,
    value: scores[key],
  }));

  const W = 920;
  const H = 360;
  const padL = 150;
  const padR = 40;
  const padT = 36;
  const padB = 48;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  // value 1..5 → x
  const x = (v: number) => padL + ((v - 1) / 4) * plotW;
  // row index → y (center of band)
  const rowH = plotH / rows.length;
  const y = (i: number) => padT + rowH * i + rowH / 2;

  const scaleLabels = ["1. Never", "2. Rarely", "3. Sometimes", "4. Often", "5. Always"];

  const hasBench = !!benchmark && (benchmark.n || 0) > 0;
  const avg = (key: CategoryKey): number | undefined =>
    (benchmark as any)?.[`${key}_avg`];
  const p25 = (key: CategoryKey): number | undefined =>
    (benchmark as any)?.[`${key}_p25`];
  const p75 = (key: CategoryKey): number | undefined =>
    (benchmark as any)?.[`${key}_p75`];

  const linePoints = (getter: (r: Row) => number | undefined) =>
    rows
      .map((r, i) => {
        const v = getter(r);
        return v == null ? null : `${x(v).toFixed(1)},${y(i).toFixed(1)}`;
      })
      .filter(Boolean)
      .join(" ");

  const indivPts = linePoints((r) => (r.value == null ? undefined : r.value));
  const avgPts = hasBench ? linePoints((r) => avg(r.key)) : "";
  const p25Pts = hasBench ? linePoints((r) => p25(r.key)) : "";
  const p75Pts = hasBench ? linePoints((r) => p75(r.key)) : "";

  return (
    <div className="chart-card">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
           aria-label="AI Readiness benchmark chart">
        {/* alternating row bands */}
        {rows.map((r, i) => (
          <rect
            key={`band-${r.key}`}
            x={padL}
            y={padT + rowH * i}
            width={plotW}
            height={rowH}
            fill={i % 2 === 0 ? "#f3f5fa" : "#ffffff"}
          />
        ))}

        {/* vertical gridlines + scale labels */}
        {[1, 2, 3, 4, 5].map((v, idx) => (
          <g key={`grid-${v}`}>
            <line
              x1={x(v)} y1={padT} x2={x(v)} y2={padT + plotH}
              stroke="#d4d8e2" strokeWidth={1}
              strokeDasharray={v === 5 ? "0" : "0"}
            />
            <text
              x={x(v)} y={padT - 14}
              fontFamily="Poppins, sans-serif" fontSize="12" fontWeight={600}
              fill="#191c27" textAnchor={idx === 4 ? "end" : "middle"}
            >
              {scaleLabels[idx]}
            </text>
          </g>
        ))}

        {/* category labels + left frame */}
        {rows.map((r, i) => (
          <text
            key={`lab-${r.key}`}
            x={padL - 16} y={y(i)}
            fontFamily="Poppins, sans-serif" fontSize="15" fontWeight={700}
            fill="#191c27" textAnchor="end" dominantBaseline="middle"
          >
            {r.label}
          </text>
        ))}

        {/* high/low quartile dashed lines */}
        {hasBench && p25Pts && (
          <polyline points={p25Pts} fill="none" stroke="#191c27"
                    strokeWidth={1.4} strokeDasharray="5 5" opacity={0.55} />
        )}
        {hasBench && p75Pts && (
          <polyline points={p75Pts} fill="none" stroke="#191c27"
                    strokeWidth={1.4} strokeDasharray="5 5" opacity={0.55} />
        )}

        {/* company average (black) */}
        {hasBench && avgPts && (
          <>
            <polyline points={avgPts} fill="none" stroke="#191c27" strokeWidth={3} />
            {rows.map((r, i) => {
              const v = avg(r.key);
              if (v == null) return null;
              return <circle key={`avg-${r.key}`} cx={x(v)} cy={y(i)} r={4} fill="#191c27" />;
            })}
          </>
        )}

        {/* individual (red) */}
        {indivPts && (
          <polyline points={indivPts} fill="none" stroke="#c2001f" strokeWidth={3.5} />
        )}
        {rows.map((r, i) => {
          if (r.value == null) return null;
          return (
            <g key={`ind-${r.key}`}>
              <circle cx={x(r.value)} cy={y(i)} r={5.5} fill="#c2001f" />
              <text
                x={x(r.value) + 12} y={y(i) - 8}
                fontFamily="Poppins, sans-serif" fontSize="14" fontWeight={700}
                fill="#191c27"
              >
                {r.value.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="chart-legend">
        <span><i className="legend-swatch" style={{ background: "#c2001f" }} /> Your score</span>
        {hasBench && (
          <>
            <span><i className="legend-swatch" style={{ background: "#191c27" }} /> Company average</span>
            <span>
              <i className="legend-swatch" style={{ background: "transparent", borderTop: "2px dashed #191c27" }} /> High &amp; low quartile
            </span>
          </>
        )}
        {!hasBench && <span className="muted"><em>Benchmark lines appear once more leaders complete the scorecard.</em></span>}
      </div>
    </div>
  );
}
