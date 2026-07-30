import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SearchBar from '@/components/SearchBar';
import BusinessCard from '@/components/BusinessCard';
import { CategoryIcon } from '@/components/icons';
import { createClient } from '@/lib/supabase/server';
import { getCategories, searchBusinesses } from '@/lib/data/businesses';

export const revalidate = 0;

const POPULAR_SLUGS = ['construction', 'automobile', 'sante', 'finance', 'juridique', 'evenementiel', 'technologie'];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [categories, businesses] = await Promise.all([
    getCategories(),
    searchBusinesses({ limit: 6 }),
  ]);

  const popular = POPULAR_SLUGS.map((slug) => categories.find((c) => c.slug === slug)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c)
  );

  return (
    <>
      <SiteHeader />
      <section className="hero">
        <div className="container">
          <h1>Trouvez un service de confiance dans votre communauté</h1>
          <p className="lede">
            Calvary Connect recense les entreprises et professionnels de la communauté de Calvary Worship Center en
            Colombie-Britannique.
          </p>
          <SearchBar />
          <div className="filters-row">
            <Link href="/categories" className="chip">
              Catégorie ▾
            </Link>
            <span className="chip">Ville ▾</span>
            <span className="chip">Note minimum ▾</span>
            <span className="chip">Type de profil ▾</span>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">Parcourir</div>
              <h2>Catégories populaires</h2>
            </div>
            <Link href="/categories" className="btn btn-outline btn-sm">
              Voir toutes les catégories
            </Link>
          </div>
          <div className="cat-grid">
            {popular.map((cat) => (
              <Link key={cat.id} className="cat-item" href={`/recherche?categorie=${cat.slug}`}>
                <div className="cat-icon">
                  <CategoryIcon slug={cat.slug} width={20} height={20} className="i" />
                </div>
                <span>{cat.name_fr}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-tint">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">Annuaire</div>
              <h2>Entreprises récemment ajoutées</h2>
              <p className="section-sub">
                {user
                  ? 'Connectez-vous permet déjà de voir les fiches complètes.'
                  : "Créez un compte gratuit pour voir les coordonnées complètes des entreprises."}
              </p>
            </div>
          </div>

          {businesses.length === 0 ? (
            <div className="empty-state">
              <h3>Aucune entreprise pour le moment</h3>
              <p>Revenez bientôt, ou soyez la première fiche de l&apos;annuaire !</p>
            </div>
          ) : (
            <div className="results-grid">
              {businesses.map((b) => (
                <BusinessCard key={b.id} business={b} loggedIn={Boolean(user)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">Fonctionnement</div>
              <h2>Trois niveaux d&apos;accès</h2>
            </div>
          </div>
          <div className="tiers-grid">
            <div className="tier-card">
              <span className="tag">VISITEUR</span>
              <h3>Non connecté</h3>
              <p>Parcourez l&apos;annuaire et voyez les fiches en version limitée. Aucun accès aux coordonnées.</p>
            </div>
            <div className="tier-card highlight">
              <span className="tag">GRATUIT</span>
              <h3>Compte utilisateur</h3>
              <p>
                Fiche complète, contact direct avec l&apos;entreprise, et possibilité de laisser un avis après une
                interaction réelle.
              </p>
            </div>
            <div className="tier-card">
              <span className="tag">ENTREPRISE</span>
              <h3>Compte payant validé</h3>
              <p>Gérez votre fiche, consultez vos statistiques et recevez les demandes des membres intéressés.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Vous avez une entreprise ou une compétence à offrir ?</h2>
              <p>Rejoignez l&apos;annuaire et gagnez en visibilité auprès de la communauté.</p>
            </div>
            <Link href="/inscription" className="btn btn-white btn-lg">
              Inscrire mon entreprise
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
