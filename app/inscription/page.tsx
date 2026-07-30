import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import InscriptionWizard from '@/components/InscriptionWizard';
import { createClient } from '@/lib/supabase/server';
import { getCategories } from '@/lib/data/businesses';
import { getLocale } from '@/lib/i18n/get-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';

export default async function InscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion?next=/inscription');
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const categories = await getCategories();

  return (
    <>
      <SiteHeader />
      <section className="section bg-tint">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="kicker">{dict.inscription.kicker}</div>
          <h1 style={{ fontSize: 30, color: 'var(--blue-900)', marginBottom: 6 }}>{dict.inscription.title}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28 }}>{dict.inscription.lede}</p>

          <InscriptionWizard userId={user.id} categories={categories} locale={locale} />
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
