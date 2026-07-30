import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { CategoryIcon } from '@/components/icons';
import { getCategories, getCategoryCounts } from '@/lib/data/businesses';
import { getLocale } from '@/lib/i18n/get-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';

export const revalidate = 0;

export default async function CategoriesPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const [categories, counts] = await Promise.all([getCategories(), getCategoryCounts()]);

  return (
    <>
      <SiteHeader />
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <div className="kicker">{dict.home.directory}</div>
          <h1 style={{ fontSize: 36 }}>{dict.categories.title}</h1>
          <p className="lede">{dict.categories.lede}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {categories.map((cat) => {
              const count = counts[cat.id] || 0;
              return (
                <Link
                  key={cat.id}
                  className="cat-item"
                  href={`/recherche?categorie=${cat.slug}`}
                  style={{ padding: '26px 16px' }}
                >
                  <div className="cat-icon" style={{ width: 52, height: 52 }}>
                    <CategoryIcon slug={cat.slug} width={22} height={22} className="i" />
                  </div>
                  <span style={{ fontSize: 14 }}>{locale === 'en' ? cat.name_en : cat.name_fr}</span>
                  <div style={{ color: 'var(--muted-2)', fontSize: 12, marginTop: 4 }}>
                    {count} {count === 1 ? dict.categories.businessSuffix : dict.categories.businessSuffixPlural}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
