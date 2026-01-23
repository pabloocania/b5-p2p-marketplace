/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === 'development',
  // Excluir og-image.png del precache del service worker
  // para evitar problemas con cache en WhatsApp/Facebook
  publicExcludes: ['!og-image.png'],
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig = {
  // Asegurar que las imágenes estáticas sean accesibles
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['www.kioscoin.com', 'kioscoin.com'],
  },
  // Headers para mejorar SEO y Open Graph
  async headers() {
    return [
      {
        source: '/og-image.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400', // 24 horas, no immutable para poder actualizar
          },
          {
            key: 'Content-Type',
            value: 'image/png',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
