'use client';

import { Plus, Minus, Copy, Check, ArrowLeft } from 'lucide-react';
import { rp, type Settings } from '@/lib/bill';
import { useBill } from './use-bill';

const stepperButton =
  'grid size-11 place-items-center rounded-full border border-stone-300 text-stone-700 transition hover:border-stone-900 hover:text-stone-900 active:scale-95 disabled:opacity-30 disabled:hover:border-stone-300 disabled:active:scale-100';

const eyebrow = 'text-[11px] font-medium uppercase tracking-[0.25em] text-orange-900/70';

export function IvoryView({ settings }: { settings: Settings }) {
  const bill = useBill(settings);
  const { bank } = settings;

  if (bill.confirmed) {
    return (
      <main className="min-h-dvh px-6 py-10 text-stone-900">
        <div className="mx-auto max-w-md">
          <button
            className="flex min-h-11 items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
            onClick={() => bill.setConfirmed(false)}
          >
            <ArrowLeft size={16} strokeWidth={1.5} /> Back to menu
          </button>

          <div className="mt-10 text-center">
            <p className={eyebrow}>Total to pay</p>
            <p className="mt-3 font-display text-5xl font-semibold tabular-nums lining-nums">
              {rp(bill.grandTotal)}
            </p>
          </div>

          <div className="mx-auto my-10 h-px w-16 bg-stone-300" />

          <div className="space-y-6 text-center">
            <p className="font-display text-3xl font-semibold tracking-wide">{bank.name}</p>
            <div>
              <p className="text-sm text-stone-500">a/n {bank.holder}</p>
              <p className="mt-2 text-2xl font-light tracking-[0.2em] tabular-nums">{bank.number}</p>
            </div>
            <button
              className="mx-auto flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-6 text-sm transition hover:border-stone-900"
              onClick={bill.copyAccount}
            >
              {bill.copied ? (
                <Check size={15} strokeWidth={1.5} className="text-emerald-700" />
              ) : (
                <Copy size={15} strokeWidth={1.5} />
              )}
              {bill.copied ? 'Copied' : 'Copy account number'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh pb-56 text-stone-900">
      <header className="px-6 pb-8 pt-12 text-center">
        <p className={eyebrow}>Bill split</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">{settings.restaurantName}</h1>
        <div className="mx-auto mt-8 h-px w-16 bg-stone-300" />
      </header>

      <ul className="mx-auto max-w-xl divide-y divide-stone-200/70 px-6">
        {settings.items.map((item) => {
          const qty = bill.quantities[item.name] || 0;
          return (
            <li key={item.name} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="font-display text-xl font-medium leading-tight">{item.name}</p>
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
                  <Minus size={16} strokeWidth={1.5} />
                </button>
                <span
                  className={`w-8 text-center tabular-nums transition-colors ${
                    qty > 0 ? 'font-semibold text-orange-900' : 'text-stone-300'
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
      <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto max-w-xl px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 text-sm text-stone-500 tabular-nums">
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
              <p className="mt-1 font-display text-3xl font-semibold tabular-nums lining-nums">
                {rp(bill.grandTotal)}
              </p>
            </div>
            <button
              className="min-h-12 rounded-full bg-stone-900 px-8 text-sm font-medium tracking-wide text-paper transition hover:bg-stone-800 active:scale-95 disabled:bg-stone-200 disabled:text-stone-400 disabled:active:scale-100"
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
