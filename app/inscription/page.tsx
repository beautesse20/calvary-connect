import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import InscriptionWizard from '@/components/InscriptionWizard';
import { createClient } from '@/lib/supabase/server';
import { getCategories } from '@/lib/data/businesses';

export default async function InscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion?next=/inscription');
  }

  const categories = await getCategories();

  return (
    <>
      <SiteHeader />
      <section className="section bg-tint">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="kicker">Inscription</div>
          <h1 style={{ fontSize: 30, color: 'var(--blue-900)', marginBottom: 6 }}>
            Inscrire mon entreprise ou mes services
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28 }}>
            Votre fiche sera examinée par un administrateur avant d&apos;être publiée dans l&apos;annuaire.
          </p>

          <InscriptionWizard userId={user.id} categories={categories} />
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
