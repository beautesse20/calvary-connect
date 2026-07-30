import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand">
              <span className="mark">CC</span> Calvary Connect
            </div>
            <p className="desc">
              L&apos;annuaire des entreprises et professionnels de la communauté de Calvary Worship Center, en
              Colombie-Britannique.
            </p>
          </div>
          <div className="footer-col">
            <h4>Navigation</h4>
            <Link href="/">Accueil</Link>
            <Link href="/categories">Catégories</Link>
            <Link href="/tarifs">Tarifs</Link>
            <Link href="/a-propos">À propos</Link>
          </div>
          <div className="footer-col">
            <h4>Entreprises</h4>
            <Link href="/inscription">Inscrire mon entreprise</Link>
            <Link href="/connexion">Connexion</Link>
            <Link href="/tableau-bord-entreprise">Tableau de bord</Link>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <p>contact@calvaryconnect.ca</p>
            <p>Réponse sous 24h maximum</p>
            <Link href="/contact">Formulaire de contact</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Calvary Connect. Tous droits réservés.</span>
          <span>Calvary Worship Center · Colombie-Britannique, Canada</span>
        </div>
      </div>
    </footer>
  );
}
