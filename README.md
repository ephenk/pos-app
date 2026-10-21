# pos-app

A bill splitter for restaurant dinners. Each diner opens the link, taps what they
ate, and sees their share with service and tax plus the bank transfer details.

Built with Next.js (App Router) and Tailwind CSS, deployed on Netlify.

## How it works

- **Bill page (`/`)** is server-rendered from one settings record in Netlify Blobs:
  restaurant name, items (with the `maxQty` steppers clamp to), service %, tax %,
  bank details, and the active theme. With no saved settings it falls back to
  `defaultSettings` in [`lib/bill.ts`](lib/bill.ts).
- **Themes** live in [`app/themes/`](app/themes/): `ivory` and `charcoal` are separate
  views sharing [`use-bill.ts`](app/themes/use-bill.ts) and the totals logic in `lib/bill.ts`.
- **Admin (`/admin`)** is password-protected. Upload receipt photos and Claude
  (Sonnet 5.5 via Netlify AI Gateway) reads the items and charges into an editable
  table. Nothing goes live until you press Save. Photos are not stored.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Plain `next dev` has no Blobs or AI
Gateway, so the bill page shows the defaults and receipt scanning fails. Use
[`netlify dev`](https://docs.netlify.com/cli/local-development/) for the real thing.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint (`next lint` was removed in Next 16) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Totals, validation and receipt-merge checks (`node --test`) |

## Deployment

Netlify builds from this repo using [`netlify.toml`](netlify.toml) (publish `.next`,
Next.js runtime applied automatically).

Set these environment variables on the Netlify site:

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Password for `/admin` |
| `ADMIN_SECRET` | Long random string that signs the 30-day admin cookie. Changing it logs everyone out. |

The AI Gateway injects `ANTHROPIC_API_KEY` itself; don't set one unless you want to
use your own key.

The site is on Netlify's free plan: 300 credits a month, hard cap. A production
deploy costs 15; a receipt scan roughly 5. If credits run out, every site on the
team goes offline until the next cycle.

## Dependency notes

- **ESLint 10** works with `eslint-config-next` 16.4, but `eslint-plugin-react`,
  `eslint-plugin-import`, and `eslint-plugin-jsx-a11y` don't declare an ESLint 10
  peer yet, so `npm install` prints `ERESOLVE overriding peer dependency` warnings.
  Lint runs clean regardless.
- **TypeScript stays on 6.** TypeScript 7 (the Go port) removed the JS Compiler API
  that `typescript-eslint` relies on; `npm run lint` fails with
  `typescript-eslint does not support TS 7.0`. Revisit when `typescript-eslint`
  ships TS 7 support.
- **`npm audit` reports `braces`** via `eslint-config-next` → `fast-glob` →
  `micromatch`. It's lint tooling only, never shipped. `npm audit fix --force`
  would downgrade `eslint-config-next` to 14, so it's left until Next updates it.
