/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public"
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
            value: 'public, max-age=31536000, immutable',
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
