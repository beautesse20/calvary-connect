import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from './dictionaries';

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value === 'en' ? 'en' : DEFAULT_LOCALE;
}
