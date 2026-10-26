# Kioscoin — P2P Stablecoin Marketplace

Kioscoin is a mobile-first Progressive Web App for **peer-to-peer trading of stablecoins against local fiat**
(ARS, EUR, …). Sellers lock tokens in an on-chain escrow; buyers pay through traditional payment
methods (bank transfer, fintech wallets); funds are released when the seller confirms payment, with
dispute resolution as a fallback.

Users never deal with seed phrases or gas: login is email/Google-based, a non-custodial key is
generated via **Web3Auth**, and transactions are executed from an **ERC-4337 smart wallet (Etherspot)**
with gas sponsored by a paymaster.

## Features

- **Order book** — browse, filter and share buy/sell offers (deep links: `?orderId=…`)
- **Create orders** — choose token, blockchain, rate (with suggested market rate) and payment methods
- **Escrow trading flow** — `PENDING → ACTIVE → WAITING_PAYMENT → FIAT_SENT → RELEASED / COMPLETED`,
  with cancellation, `DISPUTED` state and countdown timers
- **In-order chat** over WebSocket between buyer and seller
- **Wallet** — smart-wallet balances per chain, send funds, private-key export
- **Ratings & history** of past operations
- **Push notifications** via Firebase Cloud Messaging
- **i18n** — Spanish (default) and English
- **Installable PWA** with offline caching (next-pwa / Workbox)

## Supported networks

BNB Smart Chain (default), Base, Arbitrum, Polygon, Rootstock, plus testnets (Arbitrum Sepolia,
Base Sepolia, RSK Testnet). Enabled chains, tokens and escrow addresses are loaded at runtime
from the backend `/config` endpoint.

## Architecture

```
┌──────────── Next.js PWA (this repo) ────────────┐
│ Firebase Auth ─► Web3Auth (EOA key)             │
│                    └► Etherspot Prime SDK        │──► Arka paymaster (gas sponsorship)
│                         (smart wallet, UserOps)  │──► KioscoinEscrow contract
│ b5-api-client ─────────────────────────────────── │──► Kioscoin backend (REST + WebSocket chat)
└──────────────────────────────────────────────────┘
```

| Layer        | Tech |
|--------------|------|
| Framework    | Next.js 15 (Pages Router), React 19, TypeScript |
| UI           | Tailwind CSS, shadcn/ui (Radix), lucide-react |
| Forms        | react-hook-form + zod |
| Web3         | wagmi, viem, Web3Auth Modal, Etherspot Prime SDK |
| Data         | TanStack Query, `b5-api-client` |
| Auth & Push  | Firebase Auth, Firebase Cloud Messaging |

### Escrow contract

`KioscoinEscrow` (`src/components/web3/abis`) locks ERC-20 or native tokens per order using a
buyer hash and a seller hash. `releaseToBuyer(orderId, buyerCode)` pays the buyer and
`refundSeller(orderId, sellerCode)` returns funds to the seller. Admin functions resolve disputes.
A 1% fee is charged on lock.

## Project structure

```
pages/                 Next.js entry points (index, auth/email-verified, FAQs)
src/components/
  kioscoin/            App features: orders, users, wallet, notifications, disputes, filters
  web3/                Wallet providers, Etherspot/AA flow, escrow actions, ABIs
  chat/                WebSocket chat client & UI
  ui/                  shadcn/ui primitives
src/lib/               API clients, ConfigStore (runtime chain config), deep links
src/hooks/             Notifications, deep-link handling
src/i18n.ts            Translations (es / en)
public/                PWA manifest, icons, Firebase messaging service worker
```

## Getting started

Requirements: Node.js 20+, npm.

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                   # or: npm run dev-https  (needed for some wallet/push features)
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ENVIRONMENT` | `production` selects Web3Auth Sapphire Mainnet; anything else uses Devnet |
| `NEXT_PUBLIC_KIOSCOIN_API_BASE` | Backend REST base URL |
| `NEXT_PUBLIC_KIOSCOIN_WEBSOCKET_URL` | Backend WebSocket URL (chat) |
| `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` | Web3Auth project client ID |
| `NEXT_PUBLIC_ARKA_KEY` | Etherspot Arka paymaster key |
| `NEXT_PUBLIC_EMAIL_VERIFICATION_URL` | Email verification landing URL |
| `NEXT_PUBLIC_EMAIL_VERIFICATION_CONTINUE_URL` | Redirect after verification |
| `NEXT_PUBLIC_EMAIL_LINK_URL` | Passwordless email-link sign-in URL |

See `src/components/auth/README.md` for Firebase Auth provider setup.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (PWA disabled) |
| `npm run dev-https` | Dev server with local HTTPS |
| `npm run build` | Production build (generates service worker) |
| `npm run start` | Serve production build |

## Security

Report vulnerabilities privately to the maintainers rather than opening a public issue.
All `NEXT_PUBLIC_*` values are shipped to the browser — never put server secrets in them.

## License

Proprietary — all rights reserved.
