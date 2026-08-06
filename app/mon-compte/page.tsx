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

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, avatar_url, email_notifications, role')
    .eq('id', user.id)
    .single();

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

  const [{ data: reviewsData }, { data: messagesData }, { data: favoritesData }] = await Promise.all([
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, business_id, businesses(name)')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('messages')
      .select('id, content, created_at, business_id, reply_content, replied_at, businesses(name)')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('favorites')
      .select('id, business_id, created_at, businesses(name, city, categories(name_fr, name_en))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  return (
    <>
      <SiteHeader />
      <MonCompteClient
        fullName={profile?.full_name || null}
        email={user.email || ''}
        phone={profile?.phone || null}
        avatarUrl={profile?.avatar_url || null}
        emailNotifications={profile?.email_notifications ?? true}
        businessName={businessName}
        reviews={(reviewsData || []) as any}
        messages={(messagesData || []) as any}
        favorites={(favoritesData || []) as any}
      />
      <SiteFooter />
    </>
  );
}
