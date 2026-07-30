import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SearchBar from '@/components/SearchBar';
import BusinessCard from '@/components/BusinessCard';
import { createClient } from '@/lib/supabase/server';
import { getCategories, searchBusinesses } from '@/lib/data/businesses';

export const revalidate = 0;

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categorie?: string; ville?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [categories, businesses] = await Promise.all([
    getCategories(),
    searchBusinesses({ q: params.q, categorySlug: params.categorie, city: params.ville }),
  ]);

  const activeCategory = categories.find((c) => c.slug === params.categorie);

  return (
    <>
      <SiteHeader />
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <div className="kicker">Résultats</div>
          <h1 style={{ fontSize: 32 }}>
            {activeCategory ? activeCategory.name_fr : params.q ? `Recherche : « ${params.q} »` : 'Toutes les entreprises'}
          </h1>
          <p className="lede">
            {businesses.length} résultat{businesses.length === 1 ? '' : 's'} dans l&apos;annuaire.
          </p>
          <SearchBar initialQuery={params.q} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          {businesses.length === 0 ? (
            <div className="empty-state">
              <h3>Aucun résultat</h3>
              <p>Essayez un autre mot-clé, ou parcourez les catégories.</p>
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
      <SiteFooter />
    </>
  );
}
