'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/categories', label: 'Catégories' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<'loading' | 'out' | 'user' | 'business' | 'admin' | 'super_admin'>(
    'loading'
  );

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setSession('out');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!active) return;
      setSession((profile?.role as any) || 'user');
    }
    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const dashboardHref =
    session === 'admin' || session === 'super_admin' ? '/tableau-bord-admin' : '/tableau-bord-entreprise';

  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand">
            <span className="mark">CC</span> Calvary Connect
          </Link>
          <nav className="main-nav">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <div className="lang-switch">
              <span className="active">FR</span>
              <span>EN</span>
            </div>
            {session === 'out' || session === 'loading' ? (
              <>
                <Link href="/connexion" className="btn btn-ghost btn-sm">
                  Connexion
                </Link>
                <Link href="/inscription" className="btn btn-primary btn-sm">
                  Inscrire mon entreprise
                </Link>
              </>
            ) : (
              <>
                <Link href={dashboardHref} className="btn btn-ghost btn-sm">
                  Tableau de bord
                </Link>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  Déconnexion
                </button>
              </>
            )}
            <button className="hamburger" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>
      <div className={`mobile-nav${open ? ' open' : ''}`} id="mobileNav">
        {NAV_LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
        <div className="mobile-actions">
          {session === 'out' || session === 'loading' ? (
            <>
              <Link href="/connexion" className="btn btn-outline btn-block" onClick={() => setOpen(false)}>
                Connexion
              </Link>
              <Link href="/inscription" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>
                Inscrire mon entreprise
              </Link>
            </>
          ) : (
            <>
              <Link href={dashboardHref} className="btn btn-outline btn-block" onClick={() => setOpen(false)}>
                Tableau de bord
              </Link>
              <button
                className="btn btn-primary btn-block"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
              >
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
