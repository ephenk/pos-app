'use client';

import { Plus, Minus, Copy, Check, ArrowLeft } from 'lucide-react';
import { rp, type Settings } from '@/lib/bill';
import { useBill } from './use-bill';

const stepperButton =
  'grid size-11 place-items-center rounded-md border border-stone-400 text-stone-800 transition hover:border-stone-900 active:scale-95 disabled:opacity-30 disabled:hover:border-stone-400 disabled:active:scale-100';

const eyebrow = 'text-[11px] font-medium uppercase tracking-[0.35em]';

// Torii gate: kasagi (top beam with upturned ends), nuki (tie beam), gakuzuka, two pillars.
function Torii({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true" className={className} fill="currentColor">
      <path d="M0 6 Q60 18 120 6 L116 18 Q60 26 4 18 Z" />
      <rect x="12" y="22" width="96" height="6" />
      <rect x="10" y="36" width="100" height="7" />
      <rect x="56" y="26" width="8" height="12" />
      <path d="M24 22 H33 L35 100 H22 Z" />
      <path d="M87 22 H96 L98 100 H85 Z" />
    </svg>
  );
}

// Seigaiha: overlapping rows of concentric wave arcs.
function Seigaiha({ className }: { className?: string }) {
  const fan = (cx: number, cy: number) =>
    [10, 7, 4].map((r, i) => (
      <circle key={`${cx}-${cy}-${r}`} cx={cx} cy={cy} r={r} className={i % 2 ? 'fill-washi' : 'fill-ai'} />
    ));
  return (
    <svg aria-hidden="true" className={`block w-full ${className ?? ''}`}>
      <defs>
        <pattern id="seigaiha" width="20" height="10" patternUnits="userSpaceOnUse">
          <rect width="20" height="10" className="fill-ai" />
          {fan(0, 5)}
          {fan(20, 5)}
          {fan(10, 10)}
          {fan(0, 15)}
          {fan(20, 15)}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#seigaiha)" />
    </svg>
  );
}

export function JapaneseView({ settings }: { settings: Settings }) {
  const bill = useBill(settings);

  if (bill.confirmed) {
    return (
      <main className="min-h-dvh bg-washi px-6 py-10 text-stone-900">
        <div className="mx-auto max-w-md">
          <button
            className="flex min-h-11 items-center gap-2 text-sm text-stone-600 transition hover:text-stone-900"
            onClick={() => bill.setConfirmed(false)}
          >
            <ArrowLeft size={16} strokeWidth={1.5} /> Back to menu
          </button>

          <div className="mt-8 text-center">
            <Torii className="mx-auto h-12 text-shu" />
            <p className={`mt-5 text-ai ${eyebrow}`}>Total to pay</p>
            <p className="mt-3 font-display text-5xl font-semibold tabular-nums lining-nums">{rp(bill.grandTotal)}</p>
          </div>

          <Seigaiha className="my-10 h-5" />

          <ul className="divide-y divide-stone-300/70">
            {settings.banks.map((bank) => (
              <li key={bank.number} className="space-y-5 py-8 text-center first:pt-0">
                <p className="font-display text-3xl font-semibold tracking-wide">{bank.name}</p>
                <div>
                  <p className="text-sm text-stone-500">a/n {bank.holder}</p>
                  <p className="mt-2 text-2xl tracking-[0.2em] tabular-nums">{bank.number}</p>
                </div>
                <button
                  className="mx-auto flex min-h-11 items-center gap-2 rounded-md border border-ai px-6 text-sm text-ai transition hover:bg-ai hover:text-washi"
                  onClick={() => bill.copyAccount(bank.number)}
                >
                  {bill.copied === bank.number ? <Check size={15} strokeWidth={1.5} /> : <Copy size={15} strokeWidth={1.5} />}
                  {bill.copied === bank.number ? 'Copied' : 'Copy account number'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-washi pb-56 text-stone-900">
      <header className="px-6 pb-8 pt-10 text-center">
        <Torii className="mx-auto h-14 text-shu" />
        <p className={`mt-5 text-ai ${eyebrow}`}>Bill split</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">{settings.restaurantName}</h1>
      </header>
      <Seigaiha className="h-5" />

      <ul className="mx-auto mt-2 max-w-xl divide-y divide-stone-300/70 px-6">
        {settings.items.map((item) => {
          const qty = bill.quantities[item.name] || 0;
          return (
            <li key={item.name} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="font-display text-xl font-semibold leading-tight">{item.name}</p>
                <p className="mt-1 text-sm text-stone-500 tabular-nums">
                  {rp(item.price)}
                  <span className="text-stone-400"> · max {item.maxQty}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  className={stepperButton}
                  aria-label={`Decrease ${item.name}`}
                  disabled={qty === 0}
                  onClick={() => bill.change(item, -1)}
                >
                  <Minus size={16} strokeWidth={1.5} />
                </button>
                {/* Ordered quantities sit in a vermilion hanko-style stamp. */}
                <span
                  className={`grid size-8 place-items-center rounded-sm text-center tabular-nums transition-colors ${
                    qty > 0 ? 'bg-shu font-semibold text-washi' : 'text-stone-300'
                  }`}
                  aria-live="polite"
                >
                  {qty}
                </span>
                <button
                  className={stepperButton}
                  aria-label={`Increase ${item.name}`}
                  disabled={qty === item.maxQty}
                  onClick={() => bill.change(item, 1)}
                >
                  <Plus size={16} strokeWidth={1.5} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Totals */}
      <div className="fixed inset-x-0 bottom-0 bg-ai text-washi">
        <Seigaiha className="h-2.5" />
        <div className="mx-auto max-w-xl px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 text-sm text-washi/75 tabular-nums">
            <dt>Subtotal</dt>
            <dd className="text-right">{rp(bill.subtotal)}</dd>
            <dt>{settings.serviceLabel}</dt>
            <dd className="text-right">{rp(bill.gratuity)}</dd>
            <dt>Tax ({Number(settings.taxPct.toFixed(2))}%)</dt>
            <dd className="text-right">{rp(bill.tax)}</dd>
          </dl>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className={`text-washi/70 ${eyebrow}`}>Grand total</p>
              <p className="mt-1 font-display text-3xl font-semibold tabular-nums lining-nums">{rp(bill.grandTotal)}</p>
            </div>
            <button
              className="min-h-12 rounded-md bg-shu px-8 text-sm font-medium tracking-widest text-washi transition hover:brightness-110 active:scale-95 disabled:bg-washi/15 disabled:text-washi/40 disabled:active:scale-100"
              disabled={bill.subtotal === 0}
              onClick={() => bill.setConfirmed(true)}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
