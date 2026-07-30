'use client';

import { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, getDictionary, type Locale } from '@/lib/i18n/dictionaries';

type Dictionary = ReturnType<typeof getDictionary>;

const LocaleContext = createContext<{ locale: Locale; dict: Dictionary; setLocale: (l: Locale) => void }>({
  locale: 'fr',
  dict: getDictionary('fr'),
  setLocale: () => {},
});

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const [current, setCurrent] = useState<Locale>(locale);

  function setLocale(l: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000`;
    setCurrent(l);
    router.refresh();
  }

  return (
    <LocaleContext.Provider value={{ locale: current, dict: getDictionary(current), setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
