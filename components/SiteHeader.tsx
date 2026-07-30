'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from './LocaleProvider';

export default function SiteHeader() {
  const pathname = usePathname();
  const supabase = createClient();
  const { locale, dict, setLocale } = useLocale();
  const NAV_LINKS = [
    { href: '/', label: dict.nav.home },
    { href: '/categories', label: dict.nav.categories },
    { href: '/tarifs', label: dict.nav.pricing },
    { href: '/a-propos', label: dict.nav.about },
    { href: '/contact', label: dict.nav.contact },
  ];
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
    try {
      await supabase.auth.signOut();
    } finally {
      // Hard navigation (not router.push/refresh): forces the browser to drop
      // the Next.js client router cache and send a brand-new request, so the
      // middleware sees the just-cleared cookies instead of a stale cached
      // route. Soft navigation here was leaving auth state inconsistent and
      // blocking the next login.
      window.location.href = '/';
    }
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
              <span className={locale === 'fr' ? 'active' : ''} role="button" onClick={() => setLocale('fr')}>
                FR
              </span>
              <span className={locale === 'en' ? 'active' : ''} role="button" onClick={() => setLocale('en')}>
                EN
              </span>
            </div>
            {session === 'out' || session === 'loading' ? (
              <>
                <Link href="/connexion" className="btn btn-ghost btn-sm">
                  {dict.header.login}
                </Link>
                <Link href="/inscription" className="btn btn-primary btn-sm">
                  {dict.header.registerBusiness}
                </Link>
              </>
            ) : (
              <>
                <Link href={dashboardHref} className="btn btn-ghost btn-sm">
                  {dict.header.dashboard}
                </Link>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  {dict.header.logout}
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
                {dict.header.login}
              </Link>
              <Link href="/inscription" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>
                {dict.header.registerBusiness}
              </Link>
            </>
          ) : (
            <>
              <Link href={dashboardHref} className="btn btn-outline btn-block" onClick={() => setOpen(false)}>
                {dict.header.dashboard}
              </Link>
              <button
                className="btn btn-primary btn-block"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
              >
                {dict.header.logout}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
