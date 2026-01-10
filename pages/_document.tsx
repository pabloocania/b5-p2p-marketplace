import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Meta tags básicos */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="description"
          content="The future of P2P crypto trading. Buy and sell stablecoins with real people, using secure and decentralized escrow."
        />
        <meta
          name="keywords"
          content="kioscoin, stablecoin, p2p trading, crypto, USDC, USDT, escrow, beefive"
        />

        {/* Open Graph Meta Tags - Deben estar aquí para SSR */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Kioscoin - P2P Stablecoin Market" />
        <meta
          property="og:description"
          content="The future of P2P crypto trading. Buy and sell stablecoins with real people, using secure and decentralized escrow."
        />
        <meta property="og:image" content="https://www.kioscoin.com/og-image.png" />
        <meta property="og:image:secure_url" content="https://www.kioscoin.com/og-image.png" />
        <meta property="og:url" content="https://www.kioscoin.com" />
        <meta property="og:site_name" content="Kioscoin" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:locale:alternate" content="en_US" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kioscoin - P2P Stablecoin Market" />
        <meta
          name="twitter:description"
          content="The future of P2P crypto trading. Buy and sell stablecoins with real people, using secure and decentralized escrow."
        />
        <meta name="twitter:image" content="https://www.kioscoin.com/og-image.png" />
        <meta name="twitter:image:alt" content="Kioscoin - P2P Stablecoin Market" />

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

