import { cache } from 'react';
import { getStore } from '@netlify/blobs';
import { defaultSettings, type Settings } from './bill';

const KEY = 'current';
const store = () => getStore({ name: 'settings', consistency: 'strong' });

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
