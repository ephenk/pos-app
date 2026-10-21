'use client';

import { Plus, Minus, Copy, Check, ArrowLeft } from 'lucide-react';
import { rp, type Settings } from '@/lib/bill';
import { useBill } from './use-bill';

const stepperButton =
  'grid size-11 place-items-center rounded-full border-2 border-amber-500 bg-red-700 text-amber-200 transition hover:bg-red-800 active:scale-95 disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-400 disabled:active:scale-100';

const eyebrow = 'text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300';

// Red paper lantern: caps, ribbed body, tassel. Ribs are cut out in the header red.
function Lantern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 112" aria-hidden="true" className={className}>
      <g fill="currentColor">
        <rect x="38.5" y="0" width="3" height="10" />
        <rect x="26" y="8" width="28" height="9" rx="2" />
        <ellipse cx="40" cy="52" rx="36" ry="37" />
        <rect x="26" y="86" width="28" height="9" rx="2" />
        <path d="M33 95 H47 L45 112 H35 Z" />
      </g>
      <g fill="none" strokeWidth="2.5" className="stroke-red-700">
        <ellipse cx="40" cy="52" rx="22" ry="37" />
        <ellipse cx="40" cy="52" rx="8" ry="37" />
        <path d="M36 99 V112 M40 99 V112 M44 99 V112" />
      </g>
    </svg>
  );
}

// Key-fret (huiwen) border: a repeating square meander in gold.
function Fret({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`block w-full ${className ?? ''}`}>
      <defs>
        <pattern id="huiwen" width="16" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 10 H11 V2 H4 V7 H8 M11 10 H16" fill="none" strokeWidth="1.5" className="stroke-amber-400" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#huiwen)" />
    </svg>
  );
}

export function ChineseView({ settings }: { settings: Settings }) {
  const bill = useBill(settings);

  if (bill.confirmed) {
    return (
      <main className="min-h-dvh bg-orange-50 px-4 py-10 text-stone-900">
        <div className="mx-auto max-w-md">
          <button
            className="mb-6 flex min-h-11 items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800"
            onClick={() => bill.setConfirmed(false)}
          >
            <ArrowLeft size={16} /> Back to menu
          </button>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-amber-300">
            <div className="bg-red-700 px-6 pb-6 pt-6 text-center">
              <Lantern className="mx-auto h-14 text-amber-400" />
              <p className={`mt-3 ${eyebrow}`}>Total to pay</p>
              <p className="mt-2 font-display text-5xl font-semibold text-amber-50 tabular-nums lining-nums">
                {rp(bill.grandTotal)}
              </p>
            </div>
            <div className="bg-stone-950 py-1">
              <Fret className="h-3" />
            </div>

            <ul className="divide-y divide-amber-100">
              {settings.banks.map((bank) => (
                <li key={bank.number} className="space-y-5 px-6 py-8 text-center">
                  <p className="font-display text-3xl font-semibold tracking-wide text-red-700">{bank.name}</p>
                  <div>
                    <p className="text-sm text-stone-500">a/n {bank.holder}</p>
                    <p className="mt-1 text-3xl font-bold tracking-wider tabular-nums">{bank.number}</p>
                  </div>
                  <button
                    className="mx-auto flex min-h-11 items-center gap-2 rounded-full bg-red-700 px-6 text-sm font-semibold text-amber-100 transition hover:bg-red-800"
                    onClick={() => bill.copyAccount(bank.number)}
                  >
                    {bill.copied === bank.number ? <Check size={16} /> : <Copy size={16} />}
                    {bill.copied === bank.number ? 'Copied' : 'Copy account number'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-orange-50 pb-56 text-stone-900">
      <header className="bg-red-700 px-4 pb-8 pt-8 text-center">
        <Lantern className="mx-auto h-20 text-amber-400" />
        <p className={`mt-4 ${eyebrow}`}>Bill split</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-amber-50">{settings.restaurantName}</h1>
      </header>
      <div className="bg-stone-950 py-1">
        <Fret className="h-3" />
      </div>

      <ul className="mx-auto mt-2 max-w-xl divide-y divide-red-200/60 px-4">
        {settings.items.map((item) => {
          const qty = bill.quantities[item.name] || 0;
          return (
            <li
              key={item.name}
              className={`flex items-center justify-between gap-4 px-2 py-4 transition-colors ${
                qty > 0 ? 'bg-amber-100/60' : ''
              }`}
            >
              <div className="min-w-0">
                <p className="font-display text-xl font-semibold leading-tight">{item.name}</p>
                <p className="mt-1 text-sm text-stone-500 tabular-nums">
                  {rp(item.price)}
                  <span className="text-stone-400"> · max {item.maxQty}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  className={stepperButton}
                  aria-label={`Decrease ${item.name}`}
                  disabled={qty === 0}
                  onClick={() => bill.change(item, -1)}
                >
                  <Minus size={18} />
                </button>
                <span
                  className={`w-8 text-center text-lg tabular-nums ${qty > 0 ? 'font-bold text-red-700' : 'text-stone-300'}`}
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
                  <Plus size={18} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Totals */}
      <div className="fixed inset-x-0 bottom-0 bg-stone-950 text-amber-50">
        <div className="py-1">
          <Fret className="h-3" />
        </div>
        <div className="mx-auto max-w-xl px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 text-sm text-amber-100/75 tabular-nums">
            <dt>Subtotal</dt>
            <dd className="text-right">{rp(bill.subtotal)}</dd>
            <dt>{settings.serviceLabel}</dt>
            <dd className="text-right">{rp(bill.gratuity)}</dd>
            <dt>Tax ({Number(settings.taxPct.toFixed(2))}%)</dt>
            <dd className="text-right">{rp(bill.tax)}</dd>
          </dl>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>Grand total</p>
              <p className="mt-1 font-display text-3xl font-semibold text-amber-300 tabular-nums lining-nums">
                {rp(bill.grandTotal)}
              </p>
            </div>
            <button
              className="min-h-12 rounded-full border-2 border-amber-400 bg-red-700 px-8 font-semibold text-amber-100 transition hover:bg-red-800 active:scale-95 disabled:border-stone-700 disabled:bg-stone-800 disabled:text-stone-500 disabled:active:scale-100"
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
