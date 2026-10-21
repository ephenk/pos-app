'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { computeTotals, rp, type Item, type Settings, type Theme } from '@/lib/bill';
import { logout, save, scanReceipt } from './actions';

const MAX_SIDE = 1600;

// Phone photos are 2-5 MB; shrink so several fit under the ~4.5 MB function payload limit.
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process photo'))), 'image/jpeg', 0.8)
  );
}

const themes: { value: Theme; label: string }[] = [
  { value: 'ivory', label: 'Ivory (serif, printed menu)' },
  { value: 'charcoal', label: 'Charcoal (dark header, orange)' },
];

const input = 'w-full rounded-md border border-stone-300 px-2.5 py-2';
const section = 'space-y-3 rounded-xl border border-stone-200 p-4';

export function AdminPanel({ initial }: { initial: Settings }) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [receiptTotal, setReceiptTotal] = useState<number | null>(null);
  const [busy, setBusy] = useState<'scan' | 'save' | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const setItem = (index: number, patch: Partial<Item>) =>
    set('items', draft.items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const fullBill = computeTotals(draft, Object.fromEntries(draft.items.map((i) => [i.name, i.maxQty])));
  const mismatch = receiptTotal !== null ? fullBill.grandTotal - receiptTotal : 0;

  const onPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy('scan');
    setMessage(null);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) formData.append('photos', await shrink(file), 'photo.jpg');
      const result = await scanReceipt(formData);
      if (result.error) {
        setMessage({ text: result.error, error: true });
        return;
      }
      const r = result.draft!;
      setDraft((d) => ({
        ...d,
        restaurantName: r.restaurantName || d.restaurantName,
        items: r.items,
        servicePct: r.servicePct,
        serviceLabel: r.serviceLabel,
        taxPct: r.taxPct,
        taxOnService: r.taxOnService,
      }));
      setReceiptTotal(r.total);
      setMessage({ text: `Read ${r.items.length} items. Review them, then save.` });
    } catch {
      setMessage({ text: 'Upload failed. Check your connection and try again.', error: true });
    } finally {
      setBusy(null);
    }
  };

  const onSave = async () => {
    const { bank } = draft;
    const bankChanged = JSON.stringify(bank) !== JSON.stringify(saved.bank);
    if (bankChanged && !confirm(`Payments will go to:\n\n${bank.name} ${bank.number}\na/n ${bank.holder}\n\nSave?`)) {
      return;
    }
    setBusy('save');
    setMessage(null);
    try {
      const result = await save(draft);
      if (result.error) {
        setMessage({ text: result.error, error: true });
      } else {
        setSaved(draft);
        setReceiptTotal(null);
        setMessage({ text: 'Saved. The bill page now shows these settings.' });
      }
    } catch {
      setMessage({ text: 'Save failed. Check your connection and try again.', error: true });
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="mx-auto max-w-2xl space-y-5 bg-white px-4 py-8 pb-28 text-stone-900">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin</h1>
        <form action={logout}>
          <button className="text-sm text-stone-500 underline">Log out</button>
        </form>
      </div>

      <section className={section}>
        <h2 className="font-semibold">Theme</h2>
        {themes.map((t) => (
          <label key={t.value} className="flex items-center gap-2">
            <input
              type="radio"
              name="theme"
              checked={draft.theme === t.value}
              onChange={() => set('theme', t.value)}
            />
            {t.label}
          </label>
        ))}
      </section>

      <section className={section}>
        <h2 className="font-semibold">Bill</h2>
        <label className="block">
          <span className="mb-1 block cursor-pointer rounded-md border border-dashed border-stone-400 px-3 py-4 text-center text-sm text-stone-600">
            {busy === 'scan' ? 'Reading receipt…' : 'Upload receipt photos (one or more)'}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={busy !== null}
            onChange={(e) => {
              onPhotos(e.target.files);
              e.target.value = '';
            }}
          />
        </label>

        <label className="block text-sm">
          Restaurant name
          <input className={input} value={draft.restaurantName} onChange={(e) => set('restaurantName', e.target.value)} />
        </label>

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <label className="col-span-2 sm:col-span-1">
            Service label
            <input className={input} value={draft.serviceLabel} onChange={(e) => set('serviceLabel', e.target.value)} />
          </label>
          <label>
            Service %
            <input
              className={input}
              type="number"
              step="any"
              min={0}
              value={draft.servicePct}
              onChange={(e) => set('servicePct', Number(e.target.value))}
            />
          </label>
          <label>
            Tax %
            <input
              className={input}
              type="number"
              step="any"
              min={0}
              value={draft.taxPct}
              onChange={(e) => set('taxPct', Number(e.target.value))}
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.taxOnService} onChange={(e) => set('taxOnService', e.target.checked)} />
          Tax is charged on service too
        </label>

        <table className="w-full text-sm">
          <thead className="text-left text-stone-500">
            <tr>
              <th className="font-normal">Item</th>
              <th className="w-28 font-normal">Price</th>
              <th className="w-16 font-normal">Qty</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {draft.items.map((item, i) => (
              <tr key={i}>
                <td className="py-1 pr-2">
                  <input className={input} value={item.name} onChange={(e) => setItem(i, { name: e.target.value })} />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className={input}
                    type="number"
                    min={1}
                    value={item.price}
                    onChange={(e) => setItem(i, { price: Number(e.target.value) })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className={input}
                    type="number"
                    min={1}
                    value={item.maxQty}
                    onChange={(e) => setItem(i, { maxQty: Number(e.target.value) })}
                  />
                </td>
                <td>
                  <button
                    aria-label={`Remove ${item.name}`}
                    className="p-1 text-stone-400 hover:text-red-600"
                    onClick={() => set('items', draft.items.filter((_, j) => j !== i))}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="text-sm text-stone-600 underline"
          onClick={() => set('items', [...draft.items, { name: '', price: 0, maxQty: 1 }])}
        >
          Add item
        </button>

        <p className="text-sm text-stone-600">
          Whole bill at these settings: <strong className="tabular-nums">{rp(fullBill.grandTotal)}</strong>
          {receiptTotal !== null && <> · receipt says <strong className="tabular-nums">{rp(receiptTotal)}</strong></>}
        </p>
        {mismatch !== 0 && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Off by {rp(Math.abs(mismatch))} from the receipt. Check items, prices and charges before saving.
          </p>
        )}
      </section>

      <section className={section}>
        <h2 className="font-semibold">Bank account</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <label>
            Bank
            <input className={input} value={draft.bank.name} onChange={(e) => set('bank', { ...draft.bank, name: e.target.value })} />
          </label>
          <label>
            Account holder
            <input className={input} value={draft.bank.holder} onChange={(e) => set('bank', { ...draft.bank, holder: e.target.value })} />
          </label>
          <label>
            Account number
            <input
              className={input}
              inputMode="numeric"
              value={draft.bank.number}
              onChange={(e) => set('bank', { ...draft.bank, number: e.target.value.replace(/\D/g, '') })}
            />
          </label>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <p className={`text-sm ${message?.error ? 'text-red-600' : 'text-stone-600'}`} aria-live="polite">
            {message?.text}
          </p>
          <button
            className="shrink-0 rounded-lg bg-stone-900 px-6 py-2.5 font-medium text-white disabled:opacity-40"
            disabled={busy !== null}
            onClick={onSave}
          >
            {busy === 'save' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </main>
  );
}
