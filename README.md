# pos-app

A single-page bill splitter for Sate Khas Senayan MKG. Tally menu quantities, add
gratuity and tax, and show BCA transfer details for payment.

Built with Next.js (App Router) and Tailwind CSS, shipped as a static export.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The whole app lives in [`app/page.tsx`](app/page.tsx) — the menu is a hardcoded
array at the top of the file, and each item has a `maxQty` the steppers clamp to.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Static export to `out/` |
| `npm run lint` | ESLint (`next lint` was removed in Next 16) |
| `npm run typecheck` | `tsc --noEmit` |

## Deployment

Deployed on **Netlify**, which builds from this repo and publishes `out/`.

- Build command: `npm run build`
- Publish directory: `out`

`next.config.ts` sets `output: 'export'` for the static build and
`images.unoptimized: true`, which is required because the default Image
Optimization loader is unsupported under static export.

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
