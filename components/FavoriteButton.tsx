'use client';

import { useState } from 'react';
import { toggleFavorite } from '@/app/mon-compte/actions';
import { useLocale } from './LocaleProvider';

export default function FavoriteButton({ businessId, initialFavorited }: { businessId: string; initialFavorited: boolean }) {
  const { dict } = useLocale();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const res = await toggleFavorite(businessId);
      if (!res.error && typeof res.favorited === 'boolean') setFavorited(res.favorited);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={`btn btn-block btn-sm${favorited ? ' btn-outline' : ' btn-outline'}`}
      style={favorited ? { color: 'var(--red)', borderColor: '#F3C9C9' } : undefined}
      onClick={handleClick}
      disabled={pending}
      title={favorited ? dict.business.removeFavorite : dict.business.addFavorite}
    >
      {pending ? (
        <span className="spinner" />
      ) : (
        <>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={favorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            style={{ marginRight: 6, verticalAlign: -2 }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {favorited ? dict.business.removeFavorite : dict.business.addFavorite}
        </>
      )}
    </button>
  );
}
