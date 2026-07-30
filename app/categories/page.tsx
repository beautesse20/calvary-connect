import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { CategoryIcon } from '@/components/icons';
import { getCategories, getCategoryCounts } from '@/lib/data/businesses';

export const revalidate = 0;

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([getCategories(), getCategoryCounts()]);

  return (
    <>
      <SiteHeader />
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <div className="kicker">Annuaire</div>
          <h1 style={{ fontSize: 36 }}>Toutes les catégories</h1>
          <p className="lede">Parcourez l&apos;ensemble des secteurs représentés dans la communauté.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                className="cat-item"
                href={`/recherche?categorie=${cat.slug}`}
                style={{ padding: '26px 16px' }}
              >
                <div className="cat-icon" style={{ width: 52, height: 52 }}>
                  <CategoryIcon slug={cat.slug} width={22} height={22} className="i" />
                </div>
                <span style={{ fontSize: 14 }}>{cat.name_fr}</span>
                <div style={{ color: 'var(--muted-2)', fontSize: 12, marginTop: 4 }}>
                  {counts[cat.id] || 0} entreprise{(counts[cat.id] || 0) === 1 ? '' : 's'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
