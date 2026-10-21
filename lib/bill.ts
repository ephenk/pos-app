export type Item = {
  name: string;
  price: number;
  maxQty: number;
};

export type Theme = 'charcoal' | 'ivory';

export type Settings = {
  restaurantName: string;
  items: Item[];
  servicePct: number;
  taxPct: number;
  taxOnService: boolean;
  bank: { name: string; holder: string; number: string };
  theme: Theme;
};

export const defaultSettings: Settings = {
  restaurantName: 'Sate Khas Senayan MKG',
  items: [
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
  ],
  servicePct: 100 / 22,
  taxPct: 10,
  taxOnService: true,
  bank: { name: 'BCA', holder: 'Stephen Hadisurja', number: '5270695258' },
  theme: 'ivory',
};

const roundToTen = (amount: number) => Math.round(amount / 10) * 10;

export const rp = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

export function computeTotals(
  settings: Pick<Settings, 'items' | 'servicePct' | 'taxPct' | 'taxOnService'>,
  quantities: Record<string, number>
) {
  const subtotal = settings.items.reduce(
    (sum, item) => sum + (quantities[item.name] || 0) * item.price,
    0
  );
  const gratuity = roundToTen((subtotal * settings.servicePct) / 100);
  const taxBase = subtotal + (settings.taxOnService ? gratuity : 0);
  const tax = roundToTen((taxBase * settings.taxPct) / 100);
  return { subtotal, gratuity, tax, grandTotal: subtotal + gratuity + tax };
}

/** Validates untrusted settings (from the admin form) and strips unknown fields. Throws if invalid. */
export function parseSettings(input: unknown): Settings {
  const s = input as Settings;
  const isText = (v: unknown, max = 200) =>
    typeof v === 'string' && v.trim().length > 0 && v.length <= max;
  const isPct = (v: unknown) => typeof v === 'number' && v >= 0 && v <= 100;
  const isCount = (v: unknown) => Number.isInteger(v) && (v as number) > 0;
  const ok =
    !!s &&
    isText(s.restaurantName) &&
    Array.isArray(s.items) &&
    s.items.length > 0 &&
    s.items.length <= 200 &&
    s.items.every((i) => !!i && isText(i.name) && isCount(i.price) && isCount(i.maxQty)) &&
    new Set(s.items.map((i) => i.name.trim())).size === s.items.length &&
    isPct(s.servicePct) &&
    isPct(s.taxPct) &&
    typeof s.taxOnService === 'boolean' &&
    !!s.bank &&
    isText(s.bank.name, 50) &&
    isText(s.bank.holder, 100) &&
    /^\d{6,20}$/.test(s.bank.number) &&
    (s.theme === 'charcoal' || s.theme === 'ivory');
  if (!ok) throw new Error('Invalid settings');
  return {
    restaurantName: s.restaurantName.trim(),
    items: s.items.map(({ name, price, maxQty }) => ({ name: name.trim(), price, maxQty })),
    servicePct: s.servicePct,
    taxPct: s.taxPct,
    taxOnService: s.taxOnService,
    bank: { name: s.bank.name.trim(), holder: s.bank.holder.trim(), number: s.bank.number },
    theme: s.theme,
  };
}

/** Merge receipt lines with the same name and price; same name at another price gets a " (2)" suffix. */
export function mergeItems(lines: Item[]): Item[] {
  const merged: Item[] = [];
  for (const line of lines) {
    const same = merged.find((m) => m.name === line.name && m.price === line.price);
    if (same) {
      same.maxQty += line.maxQty;
      continue;
    }
    let name = line.name;
    for (let n = 2; merged.some((m) => m.name === name); n++) name = `${line.name} (${n})`;
    merged.push({ ...line, name });
  }
  return merged;
}
