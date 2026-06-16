import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { SiteContent } from "../../shared/types";
import { Logo } from "./Brand";

export function Header({ cta }: { cta?: ReactNode }) {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo" aria-label="AI Dojo home">
          <Logo size={22} />
        </Link>
        <div className="site-header__cta">{cta}</div>
      </div>
    </header>
  );
}

export function Footer({ content }: { content: SiteContent }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div>
            <Logo variant="light" size={22} />
            <p className="site-footer__tagline">
              {content.meta.productName} — by {content.meta.brandName}.
            </p>
          </div>
          <nav style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <Link to="/quiz">Take the scorecard</Link>
          </nav>
        </div>
        <div className="site-footer__bottom">
          <span>© {year} {content.meta.brandName}. {content.meta.footerNote}</span>
        </div>
      </div>
    </footer>
  );
}

export function PageLoading() {
  return (
    <div className="loading-wrap">
      <div className="spinner" aria-label="Loading" />
    </div>
  );
}
