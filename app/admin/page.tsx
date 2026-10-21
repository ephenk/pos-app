import type { Metadata } from 'next';
import { isAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { login } from './actions';
import { AdminPanel } from './admin-panel';

export const metadata: Metadata = { title: 'Admin — Bill Split', robots: { index: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) return <AdminPanel initial={await getSettings()} />;

  const { error } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center bg-white px-4 text-stone-900">
      <form action={login} className="w-full max-w-xs space-y-3">
        <h1 className="text-lg font-semibold">Admin</h1>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Password"
          required
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5"
        />
        {error && <p className="text-sm text-red-600">Wrong password.</p>}
        <button className="w-full rounded-lg bg-stone-900 py-2.5 font-medium text-white">Log in</button>
      </form>
    </main>
  );
}
