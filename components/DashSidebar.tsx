'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function DashSidebar({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="dash-sidebar">
      <a className="active" href="#">
        {icon}
        {title}
      </a>
      <a href="/" style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }} onClick={(e) => {
        e.preventDefault();
        handleLogout();
      }}>
        <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Se déconnecter
      </a>
    </aside>
  );
}
