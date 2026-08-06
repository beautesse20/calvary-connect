'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from './LocaleProvider';

export interface DashSidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
}

export default function DashSidebar({ items }: { items: DashSidebarItem[] }) {
  const supabase = createClient();
  const { dict } = useLocale();

  async function handleLogout() {
    try {
      // Voir SiteHeader.handleLogout : signOut() peut rester bloqué
      // indéfiniment (même famille de bug que le verrou navigator.locks qui
      // bloquait la connexion), donc on limite l'attente et on nettoie le
      // cookie de session nous-mêmes avant de forcer la navigation.
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    } finally {
      document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0].trim();
        if (name.startsWith('sb-') && name.includes('-auth-token')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
      });
      window.location.href = '/';
    }
  }

  return (
    <aside className="dash-sidebar">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={item.active ? 'active' : ''}>
          {item.icon}
          {item.label}
          {!!item.badge && <span className="dash-sidebar-badge">{item.badge}</span>}
        </Link>
      ))}
      <a
        href="/"
        style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}
        onClick={(e) => {
          e.preventDefault();
          handleLogout();
        }}
      >
        <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        {dict.dashboardBusiness.logout}
      </a>
    </aside>
  );
}
