import Link from 'next/link';
import type { Business } from '@/lib/types';
import type { Locale } from '@/lib/i18n/dictionaries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { CategoryIcon, IconStarFilled, IconLock } from './icons';

export default function BusinessCard({
  business,
  loggedIn,
  rating,
  reviewCount,
  locale = 'fr',
}: {
  business: Business;
  loggedIn: boolean;
  rating?: number;
  reviewCount?: number;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);
  const badgeLabel = business.profile_type === 'registered' ? dict.business.registered : dict.business.independent;
  const categoryName = business.categories
    ? locale === 'en'
      ? business.categories.name_en
      : business.categories.name_fr
    : dict.business.otherCategory;

  return (
    <Link href={`/entreprises/${business.id}`} className="biz-card" style={{ display: 'block' }}>
      <div className="biz-thumb">
        <CategoryIcon slug={business.categories?.slug} width={34} height={34} className="i" />
        <span className="badge">{badgeLabel}</span>
      </div>
      <div className="biz-body">
        <h3>{business.name}</h3>
        <div className="biz-meta">
          {categoryName} · {business.city ? `${business.city}, ${business.region || 'BC'}` : business.region || 'BC'}
        </div>
        {rating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
          <div className="stars">
            <IconStarFilled />
            {rating.toFixed(1)} <span className="count">({reviewCount} {dict.business.reviewsWord})</span>
          </div>
        )}
        {business.description && <p className="biz-desc">{business.description}</p>}
        {!loggedIn && (
          <div className="lock-note">
            <IconLock />
            {dict.business.lockNote}
          </div>
        )}
      </div>
    </Link>
  );
}
