import type { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import { CharcoalView } from './themes/charcoal';
import { IvoryView } from './themes/ivory';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { restaurantName } = await getSettings();
  return { title: `${restaurantName} — Bill Split` };
}

export default async function POSPage() {
  const settings = await getSettings();
  const View = settings.theme === 'charcoal' ? CharcoalView : IvoryView;
  return <View settings={settings} />;
}
