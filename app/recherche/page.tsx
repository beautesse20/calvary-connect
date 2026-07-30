import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SearchBar from '@/components/SearchBar';
import BusinessCard from '@/components/BusinessCard';
import { createClient } from '@/lib/supabase/server';
import { getCategories, searchBusinesses } from '@/lib/data/businesses';
import { getLocale } from '@/lib/i18n/get-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';

export const revalidate = 0;

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categorie?: string; ville?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [categories, businesses] = await Promise.all([
    getCategories(),
    searchBusinesses({ q: params.q, categorySlug: params.categorie, city: params.ville }),
  ]);

  const activeCategory = categories.find((c) => c.slug === params.categorie);
  const resultWord = businesses.length === 1 ? dict.search.resultCount : dict.search.resultCountPlural;

  return (
    <>
      <SiteHeader />
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <div className="kicker">{dict.search.results}</div>
          <h1 style={{ fontSize: 32 }}>
            {activeCategory
              ? (locale === 'en' ? activeCategory.name_en : activeCategory.name_fr)
              : params.q
                ? `${dict.search.searchFor} : « ${params.q} »`
                : dict.search.allBusinesses}
          </h1>
          <p className="lede">
            {businesses.length} {resultWord} {dict.search.inDirectory}
          </p>
          <SearchBar initialQuery={params.q} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          {businesses.length === 0 ? (
            <div className="empty-state">
              <h3>{dict.search.noResults}</h3>
              <p>{dict.search.noResultsText}</p>
            </div>
          ) : (
            <div className="results-grid">
              {businesses.map((b) => (
                <BusinessCard key={b.id} business={b} loggedIn={Boolean(user)} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
