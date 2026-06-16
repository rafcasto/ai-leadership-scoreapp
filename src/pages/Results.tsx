import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useContent } from "../lib/useContent";
import { Header, Footer, PageLoading } from "../components/Layout";
import { api, Benchmark, SubmissionRow } from "../lib/api";
import BenchmarkChart from "../components/BenchmarkChart";
import { bandFor } from "../../shared/scoring";
import type { CategoryKey } from "../../shared/types";

export default function Results() {
  const { id } = useParams();
  const { content } = useContent();
  const [sub, setSub] = useState<SubmissionRow | null>(null);
  const [bench, setBench] = useState<Benchmark | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    api.getSubmission(id).then((r) => setSub(r.submission)).catch((e) => setError(e.message));
    api.getBenchmark().then((r) => setBench(r.benchmark)).catch(() => {});
  }, [id]);

  if (error) {
    return (
      <>
        <Header />
        <div className="page-narrow center">
          <h2>We couldn't find that report</h2>
          <p className="muted">{error}</p>
          <a className="btn btn--primary" href="/quiz">Take the scorecard</a>
        </div>
      </>
    );
  }
  if (!content || !sub) return <PageLoading />;

  const R = content.results;
  const scores: Record<CategoryKey, number | null> = {
    knowledge: sub.knowledge_score,
    mindset: sub.mindset_score,
    skills: sub.skills_score,
    leadership: sub.leadership_score,
  };
  const labels: Record<CategoryKey, string> = {
    knowledge: R.categories.find((c) => c.key === "knowledge")!.label,
    mindset: R.categories.find((c) => c.key === "mindset")!.label,
    skills: R.categories.find((c) => c.key === "skills")!.label,
    leadership: R.categories.find((c) => c.key === "leadership")!.label,
  };

  const tier = R.tiers.find((t) => t.name === sub.overall_tier) || R.tiers[0];
  const lowestKey = (R.categories.find((c) => c.label === sub.lowest_category)?.key ||
    "knowledge") as CategoryKey;
  const lowestMeta = R.categories.find((c) => c.key === lowestKey)!;
  const lowestBand = bandFor(scores[lowestKey]);
  const lowestRec =
    lowestBand === "high" ? lowestMeta.recHigh : lowestBand === "medium" ? lowestMeta.recMedium : lowestMeta.recLow;

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setPdfBusy(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, backgroundColor: "#ffffff", useCORS: true,
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const w = pw - 48;
      const h = (canvas.height * w) / canvas.width;
      let y = 24;
      let remaining = h;
      let sy = 0;
      // paginate the tall canvas
      const pageContentH = ph - 48;
      while (remaining > 0) {
        const sliceH = Math.min(pageContentH, remaining);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceH * canvas.width) / w;
        const ctx = sliceCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, sy, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
        pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", 24, y, w, sliceH);
        remaining -= sliceH;
        sy += sliceCanvas.height;
        if (remaining > 0) { pdf.addPage(); y = 24; }
      }
      pdf.save(`AI-Readiness-Report-${(sub.first_name || "report").replace(/\s+/g, "-")}.pdf`);
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <>
      <Header
        cta={<a href="/quiz" className="btn btn--secondary">Retake</a>}
      />
      <div className="page-wide">
        <div ref={reportRef} style={{ background: "#fff", padding: 8 }}>
          <div className="result-hero">
            <span className="eyebrow">{R.headline}{sub.first_name ? ` · ${sub.first_name}` : ""}</span>
            <div className="score-big">{sub.overall_score.toFixed(1)}<span>/5</span></div>
            <div className="tier-badge">{tier.name}</div>
            <p className="muted" style={{ maxWidth: 560, margin: "16px auto 0" }}>{tier.meaning}</p>
          </div>

          <div style={{ margin: "32px 0" }}>
            <BenchmarkChart scores={scores} benchmark={bench} labels={labels} />
          </div>

          {/* Biggest opportunity */}
          <div className="opportunity">
            <span className="eyebrow">{R.opportunityEyebrow}</span>
            <h3>{lowestMeta.emoji} {lowestMeta.label}</h3>
            <p style={{ marginBottom: 10 }}>{R.opportunityIntro}</p>
            <p>{lowestRec}</p>
          </div>

          {/* Per-category recommendations */}
          <h3 style={{ margin: "8px 0 16px" }}>{R.recTitle}</h3>
          <div className="rec-grid">
            {R.categories.map((c) => {
              const s = scores[c.key];
              const band = bandFor(s);
              const rec = band === "high" ? c.recHigh : band === "medium" ? c.recMedium : c.recLow;
              return (
                <div className="rec-card" key={c.key}>
                  <div className="rec-card__head">
                    <span className="rec-card__score">{c.emoji} {c.label}</span>
                    <span className={`rec-card__band band-${band}`}>
                      {s == null ? "N/A" : `${s.toFixed(1)} · ${band}`}
                    </span>
                  </div>
                  <p>{rec}</p>
                </div>
              );
            })}
          </div>

          {sub.not_sure_count >= 3 && (
            <p className="muted" style={{ marginTop: 18 }}>
              <em>
                Heads up: leaders answered “not sure” {sub.not_sure_count} times. A high count of
                unknowns is itself a signal — closing those knowledge gaps is a quick win.
              </em>
            </p>
          )}
        </div>

        {/* CTAs (outside the PDF snapshot) */}
        <div className="center" style={{ margin: "36px 0 24px" }}>
          <button className="btn btn--secondary btn--lg" onClick={downloadPdf} disabled={pdfBusy}
            style={{ marginRight: 12 }}>
            {pdfBusy ? "Preparing…" : `⬇ ${R.downloadCta}`}
          </button>
          <a className="btn btn--primary btn--lg" href={content.meta.debriefUrl}>
            {R.primaryCta} →
          </a>
        </div>
      </div>
      <Footer content={content} />
    </>
  );
}
