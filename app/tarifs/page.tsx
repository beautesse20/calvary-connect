import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { IconCheck } from '@/components/icons';

export default function TarifsPage() {
  return (
    <>
      <SiteHeader />
      <section className="hero" style={{ paddingBottom: 24, textAlign: 'center' }}>
        <div className="container">
          <div className="kicker">Tarifs</div>
          <h1 style={{ margin: '0 auto' }}>Un abonnement annuel simple</h1>
          <p className="lede" style={{ margin: '16px auto 0' }}>
            Rechercher et contacter des entreprises est gratuit. Un abonnement annuel est demandé uniquement aux
            entreprises et prestataires qui veulent apparaître dans l&apos;annuaire.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="price-grid">
            <div className="price-card">
              <div className="badge-pill badge-registered" style={{ margin: '0 auto', display: 'inline-flex' }}>
                Entreprise enregistrée
              </div>
              <div className="amount">
                49,99 $<span> CAD / an</span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Pour les entreprises avec un numéro d&apos;enregistrement</p>
              <ul>
                <li><IconCheck /> Fiche complète dans l&apos;annuaire</li>
                <li><IconCheck /> Badge « Entreprise enregistrée »</li>
                <li><IconCheck /> Réception des messages et avis</li>
                <li><IconCheck /> Tableau de bord avec statistiques</li>
                <li><IconCheck /> Validation par un administrateur</li>
              </ul>
              <Link href="/inscription" className="btn btn-outline btn-block btn-lg">
                Inscrire mon entreprise
              </Link>
            </div>

            <div className="price-card featured">
              <div className="badge-pill badge-independent" style={{ margin: '0 auto', display: 'inline-flex' }}>
                Professionnel indépendant
              </div>
              <div className="amount">
                69,99 $<span> CAD / an</span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Pour les particuliers sans structure légale enregistrée</p>
              <ul>
                <li><IconCheck /> Fiche complète dans l&apos;annuaire</li>
                <li><IconCheck /> Badge « Prestataire indépendant »</li>
                <li><IconCheck /> Réception des messages et avis</li>
                <li><IconCheck /> Tableau de bord avec statistiques</li>
                <li><IconCheck /> Validation par un administrateur</li>
              </ul>
              <Link href="/inscription" className="btn btn-primary btn-block btn-lg">
                Inscrire mon entreprise
              </Link>
            </div>
          </div>

          <div className="card card-pad" style={{ maxWidth: 820, margin: '40px auto 0' }}>
            <h3 style={{ fontSize: 16, color: 'var(--blue-900)', marginBottom: 12 }}>Questions fréquentes</h3>
            <div style={{ marginBottom: 16 }}>
              <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 4 }}>
                Le paiement a-t-il lieu avant ou après la validation ?
              </strong>
              <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
                Le paiement est demandé une fois votre fiche approuvée par un administrateur — vous n&apos;êtes
                jamais facturé pour une fiche refusée.
              </p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 4 }}>Puis-je annuler mon abonnement ?</strong>
              <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
                Oui, à tout moment depuis votre tableau de bord. Votre fiche reste visible jusqu&apos;à la fin de la
                période payée.
              </p>
            </div>
            <div>
              <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 4 }}>La recherche est-elle vraiment gratuite ?</strong>
              <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
                Oui. Créer un compte et consulter l&apos;annuaire complet est gratuit — seules les entreprises
                inscrites paient un abonnement annuel.
              </p>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
