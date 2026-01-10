import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const ogImageUrl = 'https://www.kioscoin.com/og-image.png';
  const siteUrl = 'https://www.kioscoin.com';
  const siteTitle = 'Kioscoin - P2P Stablecoin Market';
  const siteDescription = 'The future of P2P crypto trading. Buy and sell stablecoins with real people, using secure and decentralized escrow.';

  return (
    <Html lang="es">
      <Head>
        {/* Meta tags básicos - CRÍTICOS para SEO */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="description" content={siteDescription} />
        <meta name="keywords" content="kioscoin, stablecoin, p2p trading, crypto, USDC, USDT, escrow, beefive" />
        <link rel="canonical" href={siteUrl} />

        {/* Open Graph Meta Tags - DEBEN estar primero y en este orden exacto */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content={siteTitle} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="Kioscoin" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:locale:alternate" content="en_US" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:image:alt" content={siteTitle} />
        <meta name="twitter:site" content="@kioscoin" />

        {/* Favicons */}
        <link rel="manifest" href="/manifest.json" />
        <link
          href="/icons/favicon-16x16.png"
          rel="icon"
          type="image/png"
          sizes="16x16"
        />
        <link
          href="/icons/favicon-32x32.png"
          rel="icon"
          type="image/png"
          sizes="32x32"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#3e2262" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

