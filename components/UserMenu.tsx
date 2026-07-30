'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function UserMenu({
  label,
  dashboardHref,
  dashboardLabel,
  updateInfoLabel,
  logoutLabel,
  onLogout,
}: {
  label: string;
  dashboardHref: string;
  dashboardLabel: string;
  updateInfoLabel: string;
  logoutLabel: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-menu-trigger" onClick={() => setOpen((v) => !v)} type="button">
        <span className="user-menu-avatar">{label.charAt(0).toUpperCase()}</span>
        <span className="user-menu-label">{label}</span>
        <svg className="i" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="user-menu-panel">
          <Link href={dashboardHref} className="user-menu-item" onClick={() => setOpen(false)}>
            <svg className="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
            {dashboardLabel}
          </Link>
          <Link href="/mon-compte" className="user-menu-item" onClick={() => setOpen(false)}>
            <svg className="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
            {updateInfoLabel}
          </Link>
          <button
            className="user-menu-item user-menu-item-danger"
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <svg className="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {logoutLabel}
          </button>
        </div>
      )}
    </div>
  );
}
