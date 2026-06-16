import { Link, useNavigate } from "react-router-dom";
import { useContent } from "../lib/useContent";
import { Header, Footer, PageLoading } from "../components/Layout";

export default function Landing() {
  const { content } = useContent();
  const navigate = useNavigate();
  if (!content) return <PageLoading />;
  const L = content.landing;

  const start = () => navigate("/quiz");

  return (
    <>
      <Header
        cta={
          <Link to="/quiz" className="btn btn--primary">
            {L.primaryCta}
          </Link>
        }
      />

      {/* Hero */}
      <section className="hero">
        <img className="hero__hand-bg" src="/brand/logo-hand.png" alt="" aria-hidden />
        <div className="container hero__inner">
          <div>
            <div className="hero__tagline">{L.eyebrow}</div>
            <h1>
              {L.h1Pre}
              <span className="accent">{L.h1Accent}</span>
              {L.h1Post}
            </h1>
            <p className="hero__lede" dangerouslySetInnerHTML={{ __html: L.lede }} />
            <div className="hero__ctas">
              <button className="btn btn--primary btn--lg" onClick={start}>
                {L.primaryCta} →
              </button>
              <span className="muted" style={{ fontSize: 14 }}>
                <em>{L.primaryCtaSub}</em>
              </span>
            </div>
            <div className="hero__meta">
              <div><b>{L.metricA}</b> {L.metricALabel}</div>
              <div><b>{L.metricB}</b> {L.metricBLabel}</div>
              <div><b>{L.metricC}</b> {L.metricCLabel}</div>
            </div>
          </div>
          <div className="hero__image">
            <img src="/brand/hero-hands-together.png" alt="Leaders collaborating" />
          </div>
        </div>
      </section>

      {/* Credibility */}
      <section className="section section--soft">
        <div className="container">
          <div className="cred center">
            <div className="eyebrow" style={{ marginBottom: 12 }}>{L.credEyebrow}</div>
            <p className="quote">{L.credQuote}</p>
            <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
              <em>{L.credAttribution}</em>
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">{L.pillarsEyebrow}</span>
            <h2>{L.pillarsTitle}</h2>
            <p className="section__lede">{L.pillarsLede}</p>
          </div>
          <div className="pillars">
            {L.pillars.map((p, i) => (
              <div className="pillar" key={i}>
                <div className="pillar__emoji">{p.emoji}</div>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connection */}
      <section className="section section--tint">
        <div className="container" style={{ maxWidth: 760, textAlign: "center" }}>
          <span className="eyebrow">{L.connectionEyebrow}</span>
          <h2 style={{ margin: "12px 0 16px" }}>{L.connectionTitle}</h2>
          <p style={{ fontSize: 18 }}>{L.connectionBody}</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section">
        <div className="container">
          <div className="cred center" style={{ background: "var(--jh-ink)" }}>
            <h2 style={{ color: "#fff" }}>{L.finalCtaTitle}</h2>
            <p style={{ color: "rgba(255,255,255,.78)", margin: "12px auto 24px", maxWidth: 540 }}>
              {L.finalCtaBody}
            </p>
            <button className="btn btn--primary btn--lg" onClick={start}>
              {L.finalCtaButton} →
            </button>
          </div>
        </div>
      </section>

      <Footer content={content} />
    </>
  );
}
