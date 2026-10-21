'use client';

import { Plus, Minus, Copy, Check, ArrowLeft } from 'lucide-react';
import { rp, type Settings } from '@/lib/bill';
import { useBill } from './use-bill';

const stepperButton =
  'grid size-11 place-items-center rounded-full bg-red-900 text-amber-300 transition hover:bg-red-800 active:scale-95 disabled:bg-stone-200 disabled:text-stone-400 disabled:active:scale-100';

const eyebrow = 'text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300';

// Rumah gadang: seven gonjong spires, tallest at the ends and leaning outward,
// stepping down to a small centre gable, over the house body. Gaps are drawn in
// the header red so each spire reads separately.
const BASE_Y = 150;
const W = 370;
// [left base x, right base x, tip x, tip y] for the left half; mirrored for the right.
const leftSpires: [number, number, number, number][] = [
  [4, 150, 52, 2],
  [62, 190, 100, 32],
  [112, 212, 142, 58],
];
const centre: [number, number, number, number] = [150, 220, 185, 86];

const mirror = ([l, r, tx, ty]: [number, number, number, number]): [number, number, number, number] => [
  W - r,
  W - l,
  W - tx,
  ty,
];

// Flared base narrowing to a sharp tip that curls outward, like a buffalo horn.
const spire = ([l, r, tx, ty]: [number, number, number, number]) => {
  const lean = Math.sign(tx - W / 2) * 8;
  return (
    `M${l} ${BASE_Y} C${l + (tx - l) * 0.45} ${BASE_Y - 30} ${tx - lean} ${ty + 50} ${tx} ${ty} ` +
    `C${tx - lean} ${ty + 50} ${r - (r - tx) * 0.45} ${BASE_Y - 30} ${r} ${BASE_Y} Z`
  );
};

// Back to front: outer spires first so inner ones overlap them.
const spires = [...leftSpires.flatMap((s) => [s, mirror(s)]), centre];
const windows = [44, 76, 108, 140, 216, 248, 280, 312];

function Gonjong({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} 200`} aria-hidden="true" className={className}>
      <g fill="currentColor" className="stroke-red-900" strokeWidth={5} strokeLinejoin="round">
        {spires.map((s, i) => (
          <path key={i} d={spire(s)} />
        ))}
        <path d={`M24 ${BASE_Y} H${W - 24} L${W - 8} 198 H8 Z`} />
      </g>
      <g className="fill-red-900">
        <rect x="24" y="160" width={W - 48} height="4" />
        {windows.map((x) => (
          <rect key={x} x={x} y="170" width="14" height="20" rx="7" />
        ))}
        <path d="M172 198 V178 a13 13 0 0 1 26 0 V198 Z" />
      </g>
    </svg>
  );
}

// Marawa, the Minangkabau flag: black, red, yellow.
const Marawa = () => (
  <div aria-hidden="true" className="flex h-1.5">
    <div className="flex-1 bg-stone-950" />
    <div className="flex-1 bg-red-700" />
    <div className="flex-1 bg-amber-400" />
  </div>
);

export function PadangView({ settings }: { settings: Settings }) {
  const bill = useBill(settings);

  if (bill.confirmed) {
    return (
      <main className="min-h-dvh bg-amber-50 px-4 py-10 text-stone-900">
        <div className="mx-auto max-w-md">
          <button
            className="mb-6 flex min-h-11 items-center gap-2 text-sm font-medium text-red-900 hover:text-red-950"
            onClick={() => bill.setConfirmed(false)}
          >
            <ArrowLeft size={16} /> Back to menu
          </button>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-amber-200">
            <div className="bg-red-900 px-6 pb-8 pt-6 text-center">
              <Gonjong className="mx-auto h-14 text-amber-400" />
              <p className={`mt-3 ${eyebrow}`}>Total to pay</p>
              <p className="mt-2 font-display text-5xl font-semibold text-amber-50 tabular-nums lining-nums">
                {rp(bill.grandTotal)}
              </p>
            </div>
            <Marawa />

            <ul className="divide-y divide-amber-100">
              {settings.banks.map((bank) => (
                <li key={bank.number} className="space-y-5 px-6 py-8 text-center">
                  <p className="font-display text-3xl font-semibold tracking-wide text-red-900">{bank.name}</p>
                  <div>
                    <p className="text-sm text-stone-500">a/n {bank.holder}</p>
                    <p className="mt-1 text-3xl font-bold tracking-wider tabular-nums">{bank.number}</p>
                  </div>
                  <button
                    className="mx-auto flex min-h-11 items-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-semibold text-red-950 transition hover:bg-amber-300"
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
    <main className="min-h-dvh bg-amber-50 pb-56 text-stone-900">
      <header className="bg-red-900 px-4 pb-8 pt-8 text-center">
        <Gonjong className="mx-auto h-20 text-amber-400" />
        <p className={`mt-4 ${eyebrow}`}>Bill split</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-amber-50">{settings.restaurantName}</h1>
      </header>
      <Marawa />

      <ul className="mx-auto mt-4 max-w-xl divide-y divide-amber-200/70 px-4">
        {settings.items.map((item) => {
          const qty = bill.quantities[item.name] || 0;
          return (
            <li
              key={item.name}
              className={`flex items-center justify-between gap-4 border-l-4 py-4 pl-3 transition-colors ${
                qty > 0 ? 'border-amber-400' : 'border-transparent'
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
                  className={`w-8 text-center text-lg tabular-nums ${qty > 0 ? 'font-bold text-red-900' : 'text-stone-300'}`}
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
      <div className="fixed inset-x-0 bottom-0 bg-red-950 text-amber-50">
        <Marawa />
        <div className="mx-auto max-w-xl px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 text-sm text-amber-100/80 tabular-nums">
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
              className="min-h-12 rounded-full bg-amber-400 px-8 font-semibold text-red-950 transition hover:bg-amber-300 active:scale-95 disabled:bg-red-900 disabled:text-red-300/60 disabled:active:scale-100"
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
