/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    // Les Server Actions limitent le corps de la requête à 1 Mo par défaut :
    // trop petit pour une photo prise avec un téléphone (logo, avatar,
    // documents d'inscription). Sans cette limite relevée, l'envoi échoue
    // silencieusement côté client si l'appel n'est pas explicitement catché.
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
};

module.exports = nextConfig;
