import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import DashSidebar from '@/components/DashSidebar';
import MessagerieClient from '@/components/MessagerieClient';
import { createClient } from '@/lib/supabase/server';
import { getLocale } from '@/lib/i18n/get-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Business, Message } from '@/lib/types';

export const revalidate = 0;

export default async function MessagerieEntreprisePage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/connexion?next=/tableau-bord-entreprise/messagerie');

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

  const { data: messagesData } = await supabase
    .from('messages')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  const messages = (messagesData || []) as Message[];
  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <>
      <SiteHeader />
      <div className="dash-shell">
        <DashSidebar
          items={[
            {
              href: '/tableau-bord-entreprise',
              label: dict.dashboardBusiness.sidebarStats,
              active: false,
              icon: (
                <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="20" x2="12" y2="10" />
                  <line x1="18" y1="20" x2="18" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
              ),
            },
            {
              href: '/tableau-bord-entreprise/messagerie',
              label: dict.dashboardBusiness.sidebarMessages,
              active: true,
              badge: unreadCount,
              icon: (
                <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 4h16v14H5.17L4 19.17V4z" />
                  <line x1="8" y1="9" x2="16" y2="9" />
                  <line x1="8" y1="13" x2="13" y2="13" />
                </svg>
              ),
            },
          ]}
        />
        <MessagerieClient business={business as Business} messages={messages} />
      </div>
    </>
  );
}
