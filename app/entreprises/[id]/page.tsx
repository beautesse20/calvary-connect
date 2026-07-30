import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ReviewForm from '@/components/ReviewForm';
import ContactBusinessForm from '@/components/ContactBusinessForm';
import { CategoryIcon, IconStarFilled, IconLock } from '@/components/icons';
import { createClient } from '@/lib/supabase/server';
import { getBusinessById } from '@/lib/data/businesses';
import type { Review } from '@/lib/types';

export const revalidate = 0;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long' });
}

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: { user } }, business] = await Promise.all([supabase.auth.getUser(), getBusinessById(id)]);

  if (!business || (business.status !== 'approved' && business.owner_id !== user?.id)) {
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
  const badgeLabel = business.profile_type === 'registered' ? 'Entreprise enregistrée' : 'Professionnel indépendant';

  return (
    <>
      <SiteHeader />
      <section className="section-tight bg-tint">
        <div className="container">
          <div className="biz-header">
            <div className="biz-logo">
              <CategoryIcon slug={business.categories?.slug} width={46} height={46} />
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
                {business.categories && <span className="badge-pill badge-independent">{business.categories.name_fr}</span>}
              </div>
              <div className="stars" style={{ fontSize: 15 }}>
                {reviews.length > 0 ? (
                  <>
                    <IconStarFilled width={16} height={16} />
                    {avgRating.toFixed(1)}/5{' '}
                    <span className="count">
                      · {reviews.length} avis{business.city ? ` · ${business.city}, ${business.region || 'BC'}` : ''}
                    </span>
                  </>
                ) : (
                  <span className="count">
                    Pas encore d&apos;avis{business.city ? ` · ${business.city}, ${business.region || 'BC'}` : ''}
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
              <h2 style={{ fontSize: 19, color: 'var(--blue-900)', marginBottom: 12 }}>À propos</h2>
              <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7 }}>
                {business.description || 'Aucune description fournie pour le moment.'}
              </p>

              <div style={{ marginTop: 28 }}>
                <h2 style={{ fontSize: 19, color: 'var(--blue-900)', marginBottom: 16 }}>
                  Avis des membres ({reviews.length})
                </h2>

                {reviews.length === 0 && (
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                    Aucun avis pour le moment. Soyez le premier à partager votre expérience.
                  </p>
                )}

                {reviews.slice(0, 10).map((r) => (
                  <div className="review-item" key={r.id}>
                    <div className="review-head">
                      <span className="who">Membre</span>
                      <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    {r.comment && <p>{r.comment}</p>}
                    <span className="review-date">{formatDate(r.created_at)}</span>
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
                    <strong>Coordonnées réservées aux membres</strong>
                    <p>Connectez-vous gratuitement pour voir le téléphone, le courriel et contacter directement l&apos;entreprise.</p>
                    <Link href="/connexion" className="btn btn-primary btn-block btn-sm">
                      Se connecter
                    </Link>
                    <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--muted)' }}>
                      Pas encore de compte ?{' '}
                      <Link href="/creer-compte" style={{ color: 'var(--blue-700)', fontWeight: 700 }}>
                        Créer un compte gratuit
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 10 }}>Contacter cette entreprise</strong>
                    <ContactBusinessForm businessId={business.id} />
                  </div>
                )}

                <div style={{ marginTop: 20 }}>
                  <div className="info-line">
                    <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <strong>{business.city ? `${business.city}, Colombie-Britannique` : 'Colombie-Britannique'}</strong>
                    </div>
                  </div>
                  <div className="info-line">
                    <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <div>
                      <strong>Site web</strong>
                      <span>{user ? business.website || 'Non fourni' : 'Visible après connexion'}</span>
                    </div>
                  </div>
                  <div className="info-line">
                    <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M22 6l-10 7L2 6" />
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                    </svg>
                    <div>
                      <strong>Courriel</strong>
                      <span>{user ? business.email || 'Non fourni' : 'Visible après connexion'}</span>
                    </div>
                  </div>
                  {user && business.phone && (
                    <div className="info-line">
                      <svg className="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <div>
                        <strong>Téléphone</strong>
                        <span>{business.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card card-pad" style={{ marginTop: 16 }}>
                <strong style={{ fontSize: 14, display: 'block', marginBottom: 10 }}>Membre de la communauté</strong>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {business.community || 'Calvary Worship Center'} · Inscrite depuis {formatDate(business.created_at)} · Fiche
                  validée par un administrateur
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
