import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import DashSidebar from '@/components/DashSidebar';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import { createClient } from '@/lib/supabase/server';
import type { Business } from '@/lib/types';

export const revalidate = 0;

export default async function TableauBordAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/connexion?next=/tableau-bord-admin');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/');
  }

  const [{ data: pendingData }, { data: activeData }] = await Promise.all([
    supabase.from('businesses').select('*, categories(*)').eq('status', 'pending').order('created_at', { ascending: true }),
    supabase
      .from('businesses')
      .select('*, categories(*)')
      .in('status', ['approved', 'deactivated', 'suspended'])
      .order('updated_at', { ascending: false }),
  ]);

  return (
    <>
      <SiteHeader />
      <div className="dash-shell">
        <DashSidebar
          title="En attente"
          icon={
            <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
        <AdminDashboardClient pending={(pendingData || []) as Business[]} active={(activeData || []) as Business[]} />
      </div>
    </>
  );
}
