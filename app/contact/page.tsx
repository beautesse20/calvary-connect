import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import GeneralContactForm from '@/components/GeneralContactForm';

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <div className="kicker">Contact</div>
          <h1 style={{ fontSize: 36 }}>Une question ? Nous sommes là.</h1>
          <p className="lede">Notre équipe vous répond sous 24h maximum, tous les jours de la semaine.</p>
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
                  <strong>Courriel</strong>
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
                  <strong>Délai de réponse</strong>
                  <span>24 heures maximum, engagement affiché sur le site</span>
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
                  <strong>Communauté</strong>
                  <span>Calvary Worship Center · Colombie-Britannique, Canada</span>
                </div>
              </div>

              <div className="callout" style={{ marginTop: 8 }}>
                <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Pour signaler une fiche ou un avis, utilisez ce formulaire en choisissant le sujet « Signalement
                d&apos;un avis ».
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
