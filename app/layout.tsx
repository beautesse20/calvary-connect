import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Calvary Connect — Annuaire des entreprises de la communauté',
  description:
    "L'annuaire des entreprises et professionnels de la communauté de Calvary Worship Center, en Colombie-Britannique.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
