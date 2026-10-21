import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTotals, defaultSettings, mergeItems, parseSettings } from './bill.ts';

test('parseSettings accepts defaults and rejects bad input', () => {
  assert.deepEqual(parseSettings(defaultSettings), defaultSettings);
  const bad = [
    { ...defaultSettings, banks: [{ ...defaultSettings.banks[0], number: '52706-95258' }] },
    { ...defaultSettings, banks: [] },
    { ...defaultSettings, banks: [defaultSettings.banks[0], defaultSettings.banks[0]] },
    { ...defaultSettings, items: [{ name: 'A', price: -1, maxQty: 1 }] },
    { ...defaultSettings, items: [defaultSettings.items[0], defaultSettings.items[0]] },
    { ...defaultSettings, theme: 'neon' },
    { ...defaultSettings, servicePct: '5' },
    { ...defaultSettings, serviceLabel: '  ' },
  ];
  for (const b of bad) assert.throws(() => parseSettings(b));
});

test('default charges match the old hardcoded formula', () => {
  // 2x Sate (178,000) + 1x Nasi (19,000) = 197,000
  const t = computeTotals(defaultSettings, {
    'Sate Ayam Ponorogo Daging': 2,
    'Nasi Putih': 1,
  });
  const gratuity = Math.round(197000 / 22 / 10) * 10;
  const tax = Math.round(((197000 + gratuity) * 0.1) / 10) * 10;
  assert.deepEqual(t, { subtotal: 197000, gratuity, tax, grandTotal: 197000 + gratuity + tax });
});

test('tax excludes service when taxOnService is false', () => {
  const t = computeTotals(
    { items: [{ name: 'A', price: 100000, maxQty: 1 }], servicePct: 5, taxPct: 10, taxOnService: false },
    { A: 1 }
  );
  assert.deepEqual(t, { subtotal: 100000, gratuity: 5000, tax: 10000, grandTotal: 115000 });
});

test('mergeItems sums same name+price and suffixes same name at another price', () => {
  assert.deepEqual(
    mergeItems([
      { name: 'Teh', price: 23000, maxQty: 1 },
      { name: 'Nasi', price: 19000, maxQty: 2 },
      { name: 'Teh', price: 23000, maxQty: 2 },
      { name: 'Teh', price: 25000, maxQty: 1 },
    ]),
    [
      { name: 'Teh', price: 23000, maxQty: 3 },
      { name: 'Nasi', price: 19000, maxQty: 2 },
      { name: 'Teh (2)', price: 25000, maxQty: 1 },
    ]
  );
});
