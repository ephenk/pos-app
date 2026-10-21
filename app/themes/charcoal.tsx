'use client';

import { Plus, Minus, Copy, Check, ArrowLeft } from 'lucide-react';
import { rp, type Settings } from '@/lib/bill';
import { useBill } from './use-bill';

const stepperButton =
  'grid size-11 place-items-center rounded-full bg-orange-600 text-white transition hover:bg-orange-700 active:scale-95 disabled:bg-stone-200 disabled:text-stone-400 disabled:active:scale-100';

export function CharcoalView({ settings }: { settings: Settings }) {
  const bill = useBill(settings);
  const { bank } = settings;

  if (bill.confirmed) {
    return (
      <main className="min-h-dvh bg-stone-100 px-4 py-10 text-stone-900">
        <div className="mx-auto max-w-md">
          <button
            className="mb-6 flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
            onClick={() => bill.setConfirmed(false)}
          >
            <ArrowLeft size={16} /> Back to menu
          </button>

          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="bg-stone-900 px-6 py-8 text-center text-white">
              <p className="text-sm uppercase tracking-widest text-orange-300">Total to pay</p>
              <p className="mt-2 text-4xl font-bold tabular-nums">{rp(bill.grandTotal)}</p>
            </div>

            <div className="space-y-5 px-6 py-8 text-center">
              <p className="text-3xl font-extrabold tracking-wide">{bank.name}</p>
              <div>
                <p className="text-sm text-stone-500">a/n {bank.holder}</p>
                <p className="mt-1 text-3xl font-bold tracking-wider tabular-nums">{bank.number}</p>
              </div>
              <button
                className="mx-auto flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-5 text-sm font-semibold transition hover:bg-stone-100"
                onClick={bill.copyAccount}
              >
                {bill.copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                {bill.copied ? 'Copied' : 'Copy account number'}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-stone-100 pb-56 text-stone-900">
      <header className="bg-stone-900 px-4 pb-10 pt-8 text-white">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-300">Bill split</p>
          <h1 className="mt-1 text-2xl font-bold">{settings.restaurantName}</h1>
        </div>
      </header>

      <ul className="mx-4 -mt-6 max-w-2xl divide-y divide-stone-100 overflow-hidden rounded-2xl bg-white shadow-sm md:mx-auto">
        {settings.items.map((item) => {
          const qty = bill.quantities[item.name] || 0;
          return (
            <li
              key={item.name}
              className={`flex items-center justify-between gap-4 px-4 py-3 transition-colors ${
                qty > 0 ? 'bg-orange-50' : ''
              }`}
            >
              <div className="min-w-0">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-stone-500 tabular-nums">
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
                  className={`w-8 text-center text-lg tabular-nums ${qty > 0 ? 'font-bold' : 'text-stone-400'}`}
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
      <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 text-sm text-stone-500 tabular-nums">
            <dt>Subtotal</dt>
            <dd className="text-right">{rp(bill.subtotal)}</dd>
            <dt>Gratuity</dt>
            <dd className="text-right">{rp(bill.gratuity)}</dd>
            <dt>Tax ({Number(settings.taxPct.toFixed(2))}%)</dt>
            <dd className="text-right">{rp(bill.tax)}</dd>
          </dl>
          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-500">Grand total</p>
              <p className="text-2xl font-bold tabular-nums">{rp(bill.grandTotal)}</p>
            </div>
            <button
              className="min-h-12 rounded-xl bg-orange-600 px-8 font-semibold text-white transition hover:bg-orange-700 active:scale-95 disabled:bg-stone-200 disabled:text-stone-400 disabled:active:scale-100"
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
