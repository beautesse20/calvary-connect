'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconSearch } from './icons';
import { useLocale } from './LocaleProvider';

export default function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const { dict } = useLocale();
  const [q, setQ] = useState(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    router.push(`/recherche?${params.toString()}`);
  }

  return (
    <form className="search-card" onSubmit={handleSubmit}>
      <IconSearch className="i" width={20} height={20} />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={dict.home.searchPlaceholder}
      />
      <button className="btn btn-primary btn-lg" type="submit">
        {dict.home.searchButton}
      </button>
    </form>
  );
}
