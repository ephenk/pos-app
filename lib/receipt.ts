import Anthropic from '@anthropic-ai/sdk';
import { mergeItems, type Item } from './bill';

export type ReceiptDraft = {
  restaurantName: string;
  items: Item[];
  servicePct: number;
  taxPct: number;
  taxOnService: boolean;
  total: number;
};

type ReceiptInput = {
  restaurantName: string;
  lines: { name: string; qty: number; lineTotal: number }[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
};

const rupiah = (description: string) => ({ type: 'integer', description });

const tool: Anthropic.Tool = {
  name: 'record_receipt',
  description: 'Record the contents of a restaurant receipt.',
  input_schema: {
    type: 'object',
    properties: {
      restaurantName: { type: 'string', description: 'Restaurant name as printed, including the branch' },
      lines: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Item name as printed' },
            qty: { type: 'integer' },
            lineTotal: rupiah('Amount printed for this line (qty × unit price)'),
          },
          required: ['name', 'qty', 'lineTotal'],
        },
      },
      subtotal: rupiah('Subtotal before service and tax'),
      serviceCharge: rupiah('Service charge amount, 0 if none'),
      tax: rupiah('Tax amount (PB1/PPN), 0 if none'),
      total: rupiah('Grand total'),
    },
    required: ['restaurantName', 'lines', 'subtotal', 'serviceCharge', 'tax', 'total'],
  },
};

const PROMPT = `These photos are parts of one restaurant receipt, in order. Neighbouring photos may overlap.
Record every ordered line exactly once: a line visible in two photos only because they overlap counts once,
but the same item ordered on separate lines stays as separate lines. Write all amounts in rupiah as integers
(Rp 42.000 -> 42000). Skip discounts, payment, and change lines.`;

const round4 = (n: number) => Math.round(n * 10000) / 10000;
const offWhole = (n: number) => Math.abs(n - Math.round(n));
// Tax rates are whole percentages; rounding of the printed amount leaves e.g. 9.9976.
const snapWhole = (n: number) => (offWhole(n) < 0.05 ? Math.round(n) : round4(n));

export async function readReceipt(images: { mediaType: 'image/jpeg' | 'image/png' | 'image/webp'; data: string }[]) {
  const message = await new Anthropic().messages.create({
    model: 'claude-sonnet-5-5',
    max_tokens: 4096,
    tools: [tool],
    tool_choice: { type: 'tool', name: tool.name },
    messages: [
      {
        role: 'user',
        content: [
          ...images.map((img) => ({
            type: 'image' as const,
            source: { type: 'base64' as const, media_type: img.mediaType, data: img.data },
          })),
          { type: 'text', text: PROMPT },
        ],
      },
    ],
  });

  const block = message.content.find((b) => b.type === 'tool_use');
  if (!block || block.type !== 'tool_use') throw new Error('Could not read the receipt');
  const r = block.input as ReceiptInput;
  if (!Array.isArray(r.lines) || !r.subtotal) throw new Error('Could not read the receipt');

  // Receipts print charges as amounts; work back to percentages. Tax applies on service when
  // that reading gives the rounder percentage (e.g. 10.00% vs 9.55%).
  const servicePct = (r.serviceCharge / r.subtotal) * 100;
  const taxWithService = (r.tax / (r.subtotal + r.serviceCharge)) * 100;
  const taxWithoutService = (r.tax / r.subtotal) * 100;
  const taxOnService = r.serviceCharge > 0 && offWhole(taxWithService) <= offWhole(taxWithoutService);

  const draft: ReceiptDraft = {
    restaurantName: r.restaurantName?.trim() ?? '',
    items: mergeItems(
      r.lines
        .filter((l) => l.qty > 0 && l.lineTotal > 0)
        .map((l) => ({ name: l.name.trim(), price: Math.round(l.lineTotal / l.qty), maxQty: l.qty }))
    ),
    servicePct: round4(servicePct),
    taxPct: snapWhole(taxOnService ? taxWithService : taxWithoutService),
    taxOnService,
    total: r.total,
  };
  return draft;
}
