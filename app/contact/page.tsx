import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import GeneralContactForm from '@/components/GeneralContactForm';
import { getLocale } from '@/lib/i18n/get-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';

export default async function ContactPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <>
      <SiteHeader />
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <div className="kicker">{dict.contact.kicker}</div>
          <h1 style={{ fontSize: 36 }}>{dict.contact.title}</h1>
          <p className="lede">{dict.contact.lede}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div>
              <div className="contact-info-item">
                <div className="ic">
                  <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M22 6l-10 7L2 6" />
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                  </svg>
                </div>
                <div>
                  <strong>{dict.contact.email}</strong>
                  <span>contact@calvaryconnect.ca</span>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="ic">
                  <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <strong>{dict.contact.responseTime}</strong>
                  <span>{dict.contact.responseTimeValue}</span>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="ic">
                  <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <strong>{dict.contact.community}</strong>
                  <span>Calvary Worship Center · {locale === 'en' ? 'British Columbia, Canada' : 'Colombie-Britannique, Canada'}</span>
                </div>
              </div>

              <div className="callout" style={{ marginTop: 8 }}>
                <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                {dict.contact.reportNote}
              </div>
            </div>

            <GeneralContactForm />
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
