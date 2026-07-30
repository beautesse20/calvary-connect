import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import MonCompteClient from '@/components/MonCompteClient';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

export default async function MonComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/connexion?next=/mon-compte');

  const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();

  let businessName: string | null = null;
  if (profile?.role === 'business') {
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    businessName = business?.name || null;
  }

  return (
    <>
      <SiteHeader />
      <MonCompteClient fullName={profile?.full_name || null} email={user.email || ''} businessName={businessName} />
      <SiteFooter />
    </>
  );
}
