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

Two majors are intentionally held back:

- **ESLint stays on 9.** `eslint-config-next` depends on `eslint-plugin-react`,
  `eslint-plugin-import`, and `eslint-plugin-jsx-a11y`, none of which declare an
  ESLint 10 peer. Installing ESLint 10 fails with `ERESOLVE`.
- **TypeScript stays on 5.9.** `typescript-eslint` peers `typescript <6.1.0`, and
  TypeScript 7 (the Go port) removed the JS Compiler API that `typescript-eslint`
  relies on. Next.js also rejects TS 7 unless `experimental.useTypeScriptCli` is set.

Revisit when `eslint-plugin-react` ships ESLint 10 support and `typescript-eslint`
ships a TS 7-compatible major.
