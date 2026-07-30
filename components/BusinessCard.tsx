import Link from 'next/link';
import type { Business } from '@/lib/types';
import { CategoryIcon, IconStarFilled, IconLock } from './icons';

export default function BusinessCard({
  business,
  loggedIn,
  rating,
  reviewCount,
}: {
  business: Business;
  loggedIn: boolean;
  rating?: number;
  reviewCount?: number;
}) {
  const badgeLabel = business.profile_type === 'registered' ? 'Entreprise enregistrée' : 'Professionnel indépendant';

  return (
    <Link href={`/entreprises/${business.id}`} className="biz-card" style={{ display: 'block' }}>
      <div className="biz-thumb">
        <CategoryIcon slug={business.categories?.slug} width={34} height={34} className="i" />
        <span className="badge">{badgeLabel}</span>
      </div>
      <div className="biz-body">
        <h3>{business.name}</h3>
        <div className="biz-meta">
          {business.categories?.name_fr || 'Autres'} · {business.city ? `${business.city}, ${business.region || 'BC'}` : business.region || 'BC'}
        </div>
        {rating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
          <div className="stars">
            <IconStarFilled />
            {rating.toFixed(1)} <span className="count">({reviewCount} avis)</span>
          </div>
        )}
        {business.description && <p className="biz-desc">{business.description}</p>}
        {!loggedIn && (
          <div className="lock-note">
            <IconLock />
            Connectez-vous pour voir les coordonnées
          </div>
        )}
      </div>
    </Link>
  );
}
