'use server';

import { redirect } from 'next/navigation';
import { logIn, logOut, requireAdmin } from '@/lib/auth';
import { parseSettings } from '@/lib/bill';
import { readReceipt, type ReceiptDraft } from '@/lib/receipt';
import { saveSettings } from '@/lib/settings';

const MAX_PHOTOS = 10;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export async function login(formData: FormData) {
  const ok = await logIn(String(formData.get('password') ?? ''));
  redirect(ok ? '/admin' : '/admin?error=1');
}

export async function logout() {
  await logOut();
  redirect('/admin');
}

// Next masks thrown errors in production, so user-facing failures are returned instead.
export async function save(settings: unknown): Promise<{ error?: string }> {
  await requireAdmin();
  let parsed;
  try {
    parsed = parseSettings(settings);
  } catch {
    return {
      error:
        'Check the form: every item needs a unique name, a price and a quantity above 0, and each bank account needs all fields, a digits-only number, and no duplicates.',
    };
  }
  await saveSettings(parsed);
  return {};
}

export async function scanReceipt(
  formData: FormData
): Promise<{ draft: ReceiptDraft; error?: never } | { error: string; draft?: never }> {
  await requireAdmin();
  const photos = formData.getAll('photos').filter((p): p is File => p instanceof File);
  if (photos.length === 0 || photos.length > MAX_PHOTOS) {
    return { error: `Add between 1 and ${MAX_PHOTOS} photos.` };
  }
  const images = [];
  for (const photo of photos) {
    const mediaType = IMAGE_TYPES.find((t) => t === photo.type);
    if (!mediaType) return { error: `Unsupported photo type: ${photo.type || 'unknown'}.` };
    images.push({ mediaType, data: Buffer.from(await photo.arrayBuffer()).toString('base64') });
  }
  try {
    return { draft: await readReceipt(images) };
  } catch (error) {
    console.error('Reading receipt failed:', error);
    const detail = error instanceof Error ? error.message.slice(0, 200) : String(error);
    return { error: `Could not read the receipt (${detail}). Try clearer photos, or edit the items by hand.` };
  }
}
