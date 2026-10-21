import { cache } from 'react';
import { getStore } from '@netlify/blobs';
import { defaultSettings, type Settings } from './bill';

const KEY = 'current';

// @netlify/blobs awaits `res.body.cancel()` on non-200 responses (e.g. the 404 before
// the first save), and on Netlify's Next runtime that promise never settles, hanging
// the request until the 30s gateway timeout. Buffering the body first avoids it.
const NULL_BODY = [101, 204, 205, 304];
const bufferedFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, init);
  if (res.status === 200) return res;
  const body = NULL_BODY.includes(res.status) ? null : await res.arrayBuffer();
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
};

const store = () => getStore({ name: 'settings', consistency: 'strong', fetch: bufferedFetch });

export const getSettings = cache(async (): Promise<Settings> => {
  try {
    const saved = (await store().get(KEY, { type: 'json' })) as Partial<Settings> | null;
    return saved ? { ...defaultSettings, ...saved } : defaultSettings;
  } catch (error) {
    // No Blobs context under plain `next dev`; use `netlify dev` to read real settings.
    console.error('Reading settings failed, using defaults:', error);
    return defaultSettings;
  }
});

export async function saveSettings(settings: Settings) {
  await store().setJSON(KEY, settings);
}
