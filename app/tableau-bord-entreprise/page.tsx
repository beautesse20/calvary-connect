import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import DashSidebar from '@/components/DashSidebar';
import BusinessDashboardClient from '@/components/BusinessDashboardClient';
import { createClient } from '@/lib/supabase/server';
import { getCategories } from '@/lib/data/businesses';
import { getLocale } from '@/lib/i18n/get-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Business, BusinessDocument, Message, Review } from '@/lib/types';

export const revalidate = 0;

export default async function TableauBordEntreprisePage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = getDictionary(locale);
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
              <h3>{dict.inscription.noBusinessTitle}</h3>
              <p>{dict.inscription.noBusinessText}</p>
              <Link href="/inscription" className="btn btn-primary" style={{ marginTop: 16 }}>
                {dict.header.registerBusiness}
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const [{ data: messagesData }, { data: reviewsData }, { data: documentsData }, categories] = await Promise.all([
    supabase.from('messages').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
    supabase.from('reviews').select('*').eq('business_id', business.id).eq('status', 'visible'),
    supabase.from('business_documents').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
    getCategories(),
  ]);

  return (
    <>
      <SiteHeader />
      <div className="dash-shell">
        <DashSidebar
          title={dict.dashboardBusiness.sidebarStats}
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
          documents={(documentsData || []) as BusinessDocument[]}
        />
      </div>
    </>
  );
}
