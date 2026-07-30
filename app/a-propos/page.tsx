import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function AProposPage() {
  return (
    <>
      <SiteHeader />
      <section className="hero">
        <div className="container">
          <div className="kicker">Notre mission</div>
          <h1 style={{ maxWidth: 680 }}>Renforcer l&apos;entraide économique de notre communauté</h1>
          <p className="lede">
            Calvary Connect est né d&apos;un constat simple : plusieurs membres de Calvary Worship Center ont une
            entreprise ou une compétence à offrir, mais on ne sait pas toujours vers qui se tourner quand on a besoin
            d&apos;un service.
          </p>
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
              <h3>Communauté d&apos;abord</h3>
              <p>Chaque entreprise inscrite est un membre actif de Calvary Worship Center, validé personnellement par un administrateur.</p>
            </div>
            <div className="card value-card">
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3>Confiance vérifiable</h3>
              <p>Un système d&apos;avis honnête entre membres, plutôt qu&apos;un simple badge, pour bâtir une réputation qui reflète la réalité.</p>
            </div>
            <div className="card value-card">
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
              </div>
              <h3>Ouvert à tous les talents</h3>
              <p>Entreprises enregistrées comme professionnels indépendants sont accueillis, avec le même sérieux dans la validation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-tint">
        <div className="container">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <div className="kicker">Comment ça marche</div>
            <h2>Du besoin à la mise en relation</h2>
          </div>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-num">1</div>
              <h4>Recherchez</h4>
              <p>Par mot-clé ou en langage naturel, décrivez ce dont vous avez besoin.</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-num">2</div>
              <h4>Connectez-vous</h4>
              <p>Créez un compte gratuit pour voir les coordonnées complètes.</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-num">3</div>
              <h4>Contactez</h4>
              <p>Échangez directement avec l&apos;entreprise ou le prestataire.</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-num">4</div>
              <h4>Partagez votre avis</h4>
              <p>Après votre expérience, aidez la communauté avec une note honnête.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">Gouvernance</div>
              <h2>Qui est derrière Calvary Connect</h2>
            </div>
          </div>
          <div className="card card-pad" style={{ maxWidth: 760 }}>
            <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.8 }}>
              Calvary Connect est un projet initié par un membre de Calvary Worship Center et opéré sous une
              entreprise individuelle basée en Colombie-Britannique. La validation de chaque entreprise est assurée
              par une équipe d&apos;administrateurs de confiance au sein de la communauté, qui peut grandir au fil du
              temps. Le projet démarre avec Calvary Worship Center en BC, avec l&apos;ambition à long terme de devenir
              un annuaire chrétien à l&apos;échelle de la province, puis du Canada.
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
