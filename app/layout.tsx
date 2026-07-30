import type { Metadata } from 'next';
import './globals.css';
import { LocaleProvider } from '@/components/LocaleProvider';
import { getLocale } from '@/lib/i18n/get-locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === 'en'
    ? {
        title: 'Calvary Connect — Community business directory',
        description:
          'The directory of businesses and professionals in the Calvary Worship Center community, in British Columbia.',
      }
    : {
        title: 'Calvary Connect — Annuaire des entreprises de la communauté',
        description:
          "L'annuaire des entreprises et professionnels de la communauté de Calvary Worship Center, en Colombie-Britannique.",
      };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
