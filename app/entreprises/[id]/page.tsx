import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ReviewForm from '@/components/ReviewForm';
import ContactBusinessForm from '@/components/ContactBusinessForm';
import FavoriteButton from '@/components/FavoriteButton';
import { CategoryIcon, IconStarFilled, IconLock } from '@/components/icons';
import { createClient } from '@/lib/supabase/server';
import { getBusinessById } from '@/lib/data/businesses';
import { getLocale } from '@/lib/i18n/get-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Review } from '@/lib/types';

export const revalidate = 0;

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-CA' : 'fr-CA', { year: 'numeric', month: 'long' });
}

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const [{ data: { user } }, business] = await Promise.all([supabase.auth.getUser(), getBusinessById(id)]);

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  }

  // Une fiche non approuvée (pending/refusée/désactivée) reste visible pour
  // sa propriétaire ET pour les administrateurs — c'est justement ce qui
  // leur permet de la prévisualiser avant de l'approuver depuis le tableau
  // de bord admin. Sans ça, cliquer sur une demande en attente renvoyait un
  // 404 pour tout admin qui n'en était pas lui-même le propriétaire.
  if (!business || (business.status !== 'approved' && business.owner_id !== user?.id && !isAdmin)) {
    notFound();
  }

  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', id)
    .eq('status', 'visible')
    .order('created_at', { ascending: false });
  const reviews = (reviewsData || []) as Review[];
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const alreadyReviewed = user ? reviews.some((r) => r.author_id === user.id) : false;

  let initialFavorited = false;
  if (user) {
    const { data: favRow } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('business_id', id)
      .maybeSingle();
    initialFavorited = !!favRow;
  }
  const badgeLabel = business.profile_type === 'registered' ? dict.business.registered : dict.business.independent;
  const categoryName = business.categories ? (locale === 'en' ? business.categories.name_en : business.categories.name_fr) : null;
  const bcName = locale === 'en' ? 'British Columbia' : 'Colombie-Britannique';

  return (
    <>
      <SiteHeader />
      <section className="section-tight bg-tint">
        <div className="container">
          <div className="biz-header">
            <div className="biz-logo">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                />
              ) : (
                <CategoryIcon slug={business.categories?.slug} width={46} height={46} />
              )}
            </div>
            <div>
              <h1 style={{ fontSize: 28, color: 'var(--blue-900)' }}>{business.name}</h1>
              <div className="badge-row">
                <span className="badge-pill badge-registered">
                  {business.profile_type === 'registered' && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {badgeLabel}
                </span>
                {categoryName && <span className="badge-pill badge-independent">{categoryName}</span>}
              </div>
              <div className="stars" style={{ fontSize: 15 }}>
                {reviews.length > 0 ? (
                  <>
                    <IconStarFilled width={16} height={16} />
                    {avgRating.toFixed(1)}/5{' '}
                    <span className="count">
                      · {reviews.length} {dict.business.reviewsWord}
                      {business.city ? ` · ${business.city}, ${business.region || 'BC'}` : ''}
                    </span>
                  </>
                ) : (
                  <span className="count">
                    {dict.business.noRatingYet}
                    {business.city ? ` · ${business.city}, ${business.region || 'BC'}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="detail-grid">
            <div>
              <h2 style={{ fontSize: 19, color: 'var(--blue-900)', marginBottom: 12 }}>{dict.business.about}</h2>
              <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7 }}>
                {business.description || dict.business.noDescription}
              </p>

              <div style={{ marginTop: 28 }}>
                <h2 style={{ fontSize: 19, color: 'var(--blue-900)', marginBottom: 16 }}>
                  {dict.business.reviews} ({reviews.length})
                </h2>

                {reviews.length === 0 && (
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>{dict.business.noReviews}</p>
                )}

                {reviews.slice(0, 10).map((r) => (
                  <div className="review-item" key={r.id}>
                    <div className="review-head">
                      <span className="who">{locale === 'en' ? 'Member' : 'Membre'}</span>
                      <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    {r.comment && <p>{r.comment}</p>}
                    <span className="review-date">{formatDate(r.created_at, locale)}</span>
                  </div>
                ))}

                {user && !alreadyReviewed && business.owner_id !== user.id && <ReviewForm businessId={business.id} />}
              </div>
            </div>

            <div className="sidebar-card">
              <div className="card card-pad">
                {!user ? (
                  <div className="contact-locked">
                    <div className="icon">
                      <IconLock width={28} height={28} />
                    </div>
                    <strong>{dict.business.contactLocked}</strong>
                    <p>{dict.business.contactLockedText}</p>
                    <Link href="/connexion" className="btn btn-primary btn-block btn-sm">
                      {dict.business.login}
                    </Link>
                    <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--muted)' }}>
                      {dict.business.noAccountYet}{' '}
                      <Link href="/creer-compte" style={{ color: 'var(--blue-700)', fontWeight: 700 }}>
                        {dict.business.createFreeAccount}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 10 }}>{dict.business.contactThisBusiness}</strong>
                    <ContactBusinessForm businessId={business.id} />
                  </div>
                )}

                {user && business.owner_id !== user.id && (
                  <div style={{ marginTop: 14 }}>
                    <FavoriteButton businessId={business.id} initialFavorited={initialFavorited} />
                  </div>
                )}

                <div style={{ marginTop: 20 }}>
                  <div className="info-line">
                    <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <strong>{business.city ? `${business.city}, ${bcName}` : bcName}</strong>
                    </div>
                  </div>
                  <div className="info-line">
                    <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <div>
                      <strong>{dict.business.website}</strong>
                      <span>{user ? business.website || dict.business.notProvided : dict.business.visibleAfterLogin}</span>
                    </div>
                  </div>
                  <div className="info-line">
                    <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M22 6l-10 7L2 6" />
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                    </svg>
                    <div>
                      <strong>{dict.business.email}</strong>
                      <span>{user ? business.email || dict.business.notProvided : dict.business.visibleAfterLogin}</span>
                    </div>
                  </div>
                  {user && business.phone && (
                    <div className="info-line">
                      <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <div>
                        <strong>{dict.business.phone}</strong>
                        <span>{business.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card card-pad" style={{ marginTop: 16 }}>
                <strong style={{ fontSize: 14, display: 'block', marginBottom: 10 }}>{dict.business.communityMember}</strong>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {business.community || 'Calvary Worship Center'} · {dict.business.memberSince}{' '}
                  {formatDate(business.created_at, locale)} · {dict.business.validatedByAdmin}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
