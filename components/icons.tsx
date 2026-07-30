// Icônes SVG (mêmes tracés que la maquette HTML) — un composant par catégorie + quelques icônes UI.

type P = { className?: string; width?: number; height?: number };

const base = (children: React.ReactNode, p: P = {}) => (
  <svg
    className={p.className || 'i'}
    width={p.width}
    height={p.height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const IconConstruction = (p: P = {}) =>
  base(
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z" />,
    p
  );
export const IconAutomobile = (p: P = {}) =>
  base(
    <>
      <path d="M5 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0" />
      <path d="M15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0" />
      <path d="M5 17H3v-4l2-5h12l4 5v4h-2" />
      <path d="M9 17h6" />
    </>,
    p
  );
export const IconSante = (p: P = {}) =>
  base(<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />, p);
export const IconFinance = (p: P = {}) =>
  base(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 15a2.5 2.5 0 0 0 2.5 2h.5a2.5 2.5 0 0 0 0-5h-1a2.5 2.5 0 0 1 0-5h.5a2.5 2.5 0 0 1 2.5 2" />
      <line x1="12" y1="6" x2="12" y2="18" />
    </>,
    p
  );
export const IconJuridique = (p: P = {}) =>
  base(
    <>
      <path d="M12 3v18" />
      <path d="M5 7l-3 6a3 3 0 0 0 6 0z" />
      <path d="M19 7l-3 6a3 3 0 0 0 6 0z" />
      <path d="M5 7h14" />
      <path d="M8 21h8" />
    </>,
    p
  );
export const IconAlimentation = (p: P = {}) =>
  base(
    <>
      <path d="M3 2v7c0 1 1 2 2 2s2-1 2-2V2" />
      <path d="M5 11v11" />
      <path d="M19 2c-2 0-3 2-3 5v4h3v11" />
    </>,
    p
  );
export const IconBeaute = (p: P = {}) =>
  base(
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </>,
    p
  );
export const IconEvenementiel = (p: P = {}) =>
  base(
    <>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </>,
    p
  );
export const IconTechnologie = (p: P = {}) =>
  base(
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </>,
    p
  );
export const IconEducation = (p: P = {}) =>
  base(<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />, p);
export const IconDomicile = (p: P = {}) =>
  base(
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>,
    p
  );
export const IconImmobilier = (p: P = {}) =>
  base(
    <>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
    </>,
    p
  );
export const IconTransport = (p: P = {}) =>
  base(
    <>
      <rect x="1" y="6" width="15" height="10" rx="1" />
      <path d="M16 10h4l3 3v3h-7z" />
      <circle cx="5.5" cy="18.5" r="1.5" />
      <circle cx="18.5" cy="18.5" r="1.5" />
    </>,
    p
  );
export const IconAutres = (p: P = {}) =>
  base(
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </>,
    p
  );

export const CATEGORY_ICONS: Record<string, (p?: P) => JSX.Element> = {
  construction: IconConstruction,
  automobile: IconAutomobile,
  sante: IconSante,
  finance: IconFinance,
  juridique: IconJuridique,
  alimentation: IconAlimentation,
  beaute: IconBeaute,
  evenementiel: IconEvenementiel,
  technologie: IconTechnologie,
  education: IconEducation,
  domicile: IconDomicile,
  immobilier: IconImmobilier,
  transport: IconTransport,
  autres: IconAutres,
};

export function CategoryIcon({ slug, ...p }: { slug?: string | null } & P) {
  const Cmp = (slug && CATEGORY_ICONS[slug]) || IconAutres;
  return Cmp(p);
}

export const IconSearch = (p: P = {}) =>
  base(
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>,
    p
  );

export const IconStarFilled = (p: P = {}) => (
  <svg className={p.className} width={p.width || 14} height={p.height || 14} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export const IconLock = (p: P = {}) =>
  base(
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>,
    { width: 13, height: 13, ...p }
  );

export const IconCheck = (p: P = {}) => base(<polyline points="20 6 9 17 4 12" />, p);
