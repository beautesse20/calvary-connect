import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import DashSidebar from '@/components/DashSidebar';
import BusinessDashboardClient from '@/components/BusinessDashboardClient';
import { createClient } from '@/lib/supabase/server';
import { getCategories } from '@/lib/data/businesses';
import type { Business, Message, Review } from '@/lib/types';

export const revalidate = 0;

export default async function TableauBordEntreprisePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/connexion?next=/tableau-bord-entreprise');

  const { data: business } = await supabase
    .from('businesses')
    .select('*, categories(*)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!business) {
    return (
      <>
        <SiteHeader />
        <section className="section">
          <div className="container" style={{ maxWidth: 600 }}>
            <div className="empty-state">
              <h3>Vous n&apos;avez pas encore de fiche entreprise</h3>
              <p>Inscrivez votre entreprise ou vos services pour rejoindre l&apos;annuaire.</p>
              <Link href="/inscription" className="btn btn-primary" style={{ marginTop: 16 }}>
                Inscrire mon entreprise
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const [{ data: messagesData }, { data: reviewsData }, categories] = await Promise.all([
    supabase.from('messages').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
    supabase.from('reviews').select('*').eq('business_id', business.id).eq('status', 'visible'),
    getCategories(),
  ]);

  return (
    <>
      <SiteHeader />
      <div className="dash-shell">
        <DashSidebar
          title="Statistiques"
          icon={
            <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
          }
        />
        <BusinessDashboardClient
          business={business as Business}
          categories={categories}
          messages={(messagesData || []) as Message[]}
          reviews={(reviewsData || []) as Review[]}
        />
      </div>
    </>
  );
}
