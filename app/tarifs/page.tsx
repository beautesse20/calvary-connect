import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { IconCheck } from '@/components/icons';
import { getLocale } from '@/lib/i18n/get-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';

export default async function TarifsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <>
      <SiteHeader />
      <section className="hero" style={{ paddingBottom: 24, textAlign: 'center' }}>
        <div className="container">
          <div className="kicker">{dict.pricing.kicker}</div>
          <h1 style={{ margin: '0 auto' }}>{dict.pricing.title}</h1>
          <p className="lede" style={{ margin: '16px auto 0' }}>
            {dict.pricing.lede}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="price-grid">
            <div className="price-card">
              <div className="badge-pill badge-registered" style={{ margin: '0 auto', display: 'inline-flex' }}>
                {dict.business.registered}
              </div>
              <div className="amount">
                49,99 $<span> {dict.pricing.perYear}</span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>{dict.pricing.registeredFor}</p>
              <ul>
                <li><IconCheck /> {dict.pricing.featFull}</li>
                <li><IconCheck /> {dict.pricing.featBadgeRegistered}</li>
                <li><IconCheck /> {dict.pricing.featMessages}</li>
                <li><IconCheck /> {dict.pricing.featStats}</li>
                <li><IconCheck /> {dict.pricing.featValidation}</li>
              </ul>
              <Link href="/inscription" className="btn btn-outline btn-block btn-lg">
                {dict.pricing.registerButton}
              </Link>
            </div>

            <div className="price-card featured">
              <div className="badge-pill badge-independent" style={{ margin: '0 auto', display: 'inline-flex' }}>
                {dict.business.independent}
              </div>
              <div className="amount">
                69,99 $<span> {dict.pricing.perYear}</span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>{dict.pricing.independentFor}</p>
              <ul>
                <li><IconCheck /> {dict.pricing.featFull}</li>
                <li><IconCheck /> {dict.pricing.featBadgeIndependent}</li>
                <li><IconCheck /> {dict.pricing.featMessages}</li>
                <li><IconCheck /> {dict.pricing.featStats}</li>
                <li><IconCheck /> {dict.pricing.featValidation}</li>
              </ul>
              <Link href="/inscription" className="btn btn-primary btn-block btn-lg">
                {dict.pricing.registerButton}
              </Link>
            </div>
          </div>

          <div className="card card-pad" style={{ maxWidth: 820, margin: '40px auto 0' }}>
            <h3 style={{ fontSize: 16, color: 'var(--blue-900)', marginBottom: 12 }}>{dict.pricing.faqTitle}</h3>
            <div style={{ marginBottom: 16 }}>
              <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 4 }}>{dict.pricing.faq1q}</strong>
              <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>{dict.pricing.faq1a}</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 4 }}>{dict.pricing.faq2q}</strong>
              <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>{dict.pricing.faq2a}</p>
            </div>
            <div>
              <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 4 }}>{dict.pricing.faq3q}</strong>
              <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>{dict.pricing.faq3a}</p>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
