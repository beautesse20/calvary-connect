import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getLocale } from '@/lib/i18n/get-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';

export default async function AProposPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <>
      <SiteHeader />
      <section className="hero">
        <div className="container">
          <div className="kicker">{dict.about.kicker}</div>
          <h1 style={{ maxWidth: 680 }}>{dict.about.title}</h1>
          <p className="lede">{dict.about.lede}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="value-grid">
            <div className="card value-card">
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>{dict.about.value1Title}</h3>
              <p>{dict.about.value1Text}</p>
            </div>
            <div className="card value-card">
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3>{dict.about.value2Title}</h3>
              <p>{dict.about.value2Text}</p>
            </div>
            <div className="card value-card">
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
              </div>
              <h3>{dict.about.value3Title}</h3>
              <p>{dict.about.value3Text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-tint">
        <div className="container">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <div className="kicker">{dict.about.howKicker}</div>
            <h2>{dict.about.howTitle}</h2>
          </div>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-num">1</div>
              <h4>{dict.about.step1Title}</h4>
              <p>{dict.about.step1Text}</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-num">2</div>
              <h4>{dict.about.step2Title}</h4>
              <p>{dict.about.step2Text}</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-num">3</div>
              <h4>{dict.about.step3Title}</h4>
              <p>{dict.about.step3Text}</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-num">4</div>
              <h4>{dict.about.step4Title}</h4>
              <p>{dict.about.step4Text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">{dict.about.govKicker}</div>
              <h2>{dict.about.govTitle}</h2>
            </div>
          </div>
          <div className="card card-pad" style={{ maxWidth: 760 }}>
            <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.8 }}>{dict.about.govText}</p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
