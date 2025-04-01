/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public"
});

module.exports = withPWA({
  images: {
    domains: ["cdn.jsdelivr.net"], // Agrega más dominios si necesitas
  },
});
