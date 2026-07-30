'use client';

import Link from 'next/link';
import { useLocale } from './LocaleProvider';

export default function SiteFooter() {
  const { dict } = useLocale();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand">
              <span className="mark">CC</span> Calvary Connect
            </div>
            <p className="desc">{dict.footer.tagline}</p>
          </div>
          <div className="footer-col">
            <h4>{dict.footer.navigation}</h4>
            <Link href="/">{dict.nav.home}</Link>
            <Link href="/categories">{dict.nav.categories}</Link>
            <Link href="/tarifs">{dict.nav.pricing}</Link>
            <Link href="/a-propos">{dict.nav.about}</Link>
          </div>
          <div className="footer-col">
            <h4>{dict.footer.businesses}</h4>
            <Link href="/inscription">{dict.header.registerBusiness}</Link>
            <Link href="/connexion">{dict.header.login}</Link>
            <Link href="/tableau-bord-entreprise">{dict.footer.dashboard}</Link>
          </div>
          <div className="footer-col">
            <h4>{dict.footer.contact}</h4>
            <p>contact@calvaryconnect.ca</p>
            <p>{dict.footer.responseTime}</p>
            <Link href="/contact">{dict.footer.contactForm}</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Calvary Connect. {dict.footer.rights}
          </span>
          <span>{dict.footer.community}</span>
        </div>
      </div>
    </footer>
  );
}
