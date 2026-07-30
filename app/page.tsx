import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SearchBar from '@/components/SearchBar';
import BusinessCard from '@/components/BusinessCard';
import { CategoryIcon } from '@/components/icons';
import { createClient } from '@/lib/supabase/server';
import { getCategories, searchBusinesses } from '@/lib/data/businesses';
import { getLocale } from '@/lib/i18n/get-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';

export const revalidate = 0;

const POPULAR_SLUGS = ['construction', 'automobile', 'sante', 'finance', 'juridique', 'evenementiel', 'technologie'];

export default async function HomePage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = getDictionary(locale);
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
          <h1>{dict.home.title}</h1>
          <p className="lede">{dict.home.lede}</p>
          <SearchBar />
          <div className="filters-row">
            <Link href="/categories" className="chip">
              {dict.home.filterCategory}
            </Link>
            <span className="chip">{dict.home.filterCity}</span>
            <span className="chip">{dict.home.filterRating}</span>
            <span className="chip">{dict.home.filterProfile}</span>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">{dict.home.browse}</div>
              <h2>{dict.home.popularCategories}</h2>
            </div>
            <Link href="/categories" className="btn btn-outline btn-sm">
              {dict.home.viewAllCategories}
            </Link>
          </div>
          <div className="cat-grid">
            {popular.map((cat) => (
              <Link key={cat.id} className="cat-item" href={`/recherche?categorie=${cat.slug}`}>
                <div className="cat-icon">
                  <CategoryIcon slug={cat.slug} width={20} height={20} className="i" />
                </div>
                <span>{locale === 'en' ? cat.name_en : cat.name_fr}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-tint">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">{dict.home.directory}</div>
              <h2>{dict.home.recentlyAdded}</h2>
              <p className="section-sub">
                {user ? dict.home.recentlyAddedSubLoggedIn : dict.home.recentlyAddedSubGuest}
              </p>
            </div>
          </div>

          {businesses.length === 0 ? (
            <div className="empty-state">
              <h3>{dict.home.emptyTitle}</h3>
              <p>{dict.home.emptyText}</p>
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

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">{dict.home.howItWorks}</div>
              <h2>{dict.home.threeTiers}</h2>
            </div>
          </div>
          <div className="tiers-grid">
            <div className="tier-card">
              <span className="tag">{dict.home.tierVisitorTag}</span>
              <h3>{dict.home.tierVisitorTitle}</h3>
              <p>{dict.home.tierVisitorText}</p>
            </div>
            <div className="tier-card highlight">
              <span className="tag">{dict.home.tierUserTag}</span>
              <h3>{dict.home.tierUserTitle}</h3>
              <p>{dict.home.tierUserText}</p>
            </div>
            <div className="tier-card">
              <span className="tag">{dict.home.tierBusinessTag}</span>
              <h3>{dict.home.tierBusinessTitle}</h3>
              <p>{dict.home.tierBusinessText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>{dict.home.ctaTitle}</h2>
              <p>{dict.home.ctaText}</p>
            </div>
            <Link href="/inscription" className="btn btn-white btn-lg">
              {dict.home.ctaButton}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
