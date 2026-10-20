'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Copy, Check, ArrowLeft } from 'lucide-react';

type Item = {
  name: string;
  price: number;
  maxQty: number;
};

const items: Item[] = [
  { name: 'Jeruk Murni (Iced)', price: 42000, maxQty: 2 },
  { name: 'Teh Jawa (Iced)', price: 23000, maxQty: 1 },
  { name: 'Wedang Angsle', price: 43000, maxQty: 1 },
  { name: 'Risol Bihun', price: 33000, maxQty: 1 },
  { name: 'Sate Ayam Ponorogo Daging', price: 89000, maxQty: 8 },
  { name: 'Nasi Putih', price: 19000, maxQty: 8 },
  { name: 'Tahu Kipas Udang (4 Pcs)', price: 82000, maxQty: 1 },
  { name: 'Teh Jawa (Hot)', price: 23000, maxQty: 5 },
  { name: 'Lime Tea (Hot)', price: 35000, maxQty: 1 },
  { name: 'Lime Tea (Iced)', price: 35000, maxQty: 1 },
  { name: 'Nasi Bebek Goreng', price: 95000, maxQty: 1 },
  { name: 'Teh Poci', price: 45000, maxQty: 1 },
];

const ACCOUNT_NUMBER = '5270695258';

const roundToTen = (amount: number) => Math.round(amount / 10) * 10;
const rp = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

const stepperButton =
  'grid size-11 place-items-center rounded-full border border-stone-300 text-stone-700 transition hover:border-stone-900 hover:text-stone-900 active:scale-95 disabled:opacity-30 disabled:hover:border-stone-300 disabled:active:scale-100';

const eyebrow = 'text-[11px] font-medium uppercase tracking-[0.25em] text-orange-900/70';

export default function POSPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (name: string, delta: number, max: number) => {
    setQuantities((prev) => {
      const newQty = Math.min(Math.max((prev[name] || 0) + delta, 0), max);
      return { ...prev, [name]: newQty };
    });
  };

  const copyAccount = () => {
    navigator.clipboard.writeText(ACCOUNT_NUMBER).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (quantities[item.name] || 0) * item.price,
    0
  );
  const gratuity = roundToTen(subtotal * (1 / 22));
  const tax = roundToTen((subtotal + gratuity) * 0.1);
  const grandTotal = subtotal + gratuity + tax;

  if (confirmed) {
    return (
      <main className="min-h-dvh px-6 py-10 text-stone-900">
        <div className="mx-auto max-w-md">
          <button
            className="flex min-h-11 items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"
            onClick={() => setConfirmed(false)}
          >
            <ArrowLeft size={16} strokeWidth={1.5} /> Back to menu
          </button>

          <div className="mt-10 text-center">
            <p className={eyebrow}>Total to pay</p>
            <p className="mt-3 font-display text-5xl font-semibold tabular-nums lining-nums">
              {rp(grandTotal)}
            </p>
          </div>

          <div className="mx-auto my-10 h-px w-16 bg-stone-300" />

          <div className="space-y-6 text-center">
            <Image
              className="mx-auto"
              src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg"
              alt="BCA"
              width={120}
              height={53}
            />
            <div>
              <p className="text-sm text-stone-500">a/n Stephen Hadisurja</p>
              <p className="mt-2 text-2xl font-light tracking-[0.2em] tabular-nums">
                {ACCOUNT_NUMBER}
              </p>
            </div>
            <button
              className="mx-auto flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-6 text-sm transition hover:border-stone-900"
              onClick={copyAccount}
            >
              {copied ? (
                <Check size={15} strokeWidth={1.5} className="text-emerald-700" />
              ) : (
                <Copy size={15} strokeWidth={1.5} />
              )}
              {copied ? 'Copied' : 'Copy account number'}
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
        <h1 className="mt-3 font-display text-4xl font-semibold">Sate Khas Senayan</h1>
        <p className="mt-1 text-sm tracking-[0.3em] text-stone-500">MKG</p>
        <div className="mx-auto mt-8 h-px w-16 bg-stone-300" />
      </header>

      <ul className="mx-auto max-w-xl divide-y divide-stone-200/70 px-6">
        {items.map((item) => {
          const qty = quantities[item.name] || 0;
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
                  onClick={() => handleChange(item.name, -1, item.maxQty)}
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
                  onClick={() => handleChange(item.name, 1, item.maxQty)}
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
            <dd className="text-right">{rp(subtotal)}</dd>
            <dt>Gratuity</dt>
            <dd className="text-right">{rp(gratuity)}</dd>
            <dt>Tax (10%)</dt>
            <dd className="text-right">{rp(tax)}</dd>
          </dl>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>Grand total</p>
              <p className="mt-1 font-display text-3xl font-semibold tabular-nums lining-nums">
                {rp(grandTotal)}
              </p>
            </div>
            <button
              className="min-h-12 rounded-full bg-stone-900 px-8 text-sm font-medium tracking-wide text-paper transition hover:bg-stone-800 active:scale-95 disabled:bg-stone-200 disabled:text-stone-400 disabled:active:scale-100"
              disabled={subtotal === 0}
              onClick={() => setConfirmed(true)}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
