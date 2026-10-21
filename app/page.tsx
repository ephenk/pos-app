import type { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import { CharcoalView } from './themes/charcoal';
import { IvoryView } from './themes/ivory';
import { PadangView } from './themes/padang';

const views = { ivory: IvoryView, charcoal: CharcoalView, padang: PadangView };

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { restaurantName } = await getSettings();
  return { title: `${restaurantName} — Bill Split` };
}

export default async function POSPage() {
  const settings = await getSettings();
  const View = views[settings.theme] ?? IvoryView;
  return <View settings={settings} />;
}
