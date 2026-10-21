import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'admin_session';
const MAX_AGE = 30 * 24 * 60 * 60;

function env(name: 'ADMIN_PASSWORD' | 'ADMIN_SECRET') {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

const sign = (exp: string) => createHmac('sha256', env('ADMIN_SECRET')).update(exp).digest('base64url');

// Hash both sides so timingSafeEqual gets equal-length buffers.
const same = (a: string, b: string) =>
  timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [exp, sig = ''] = value.split('.');
  return Number(exp) > Date.now() && same(sig, sign(exp));
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error('Unauthorized');
}

export async function logIn(password: string) {
  if (!same(password, env('ADMIN_PASSWORD'))) return false;
  const exp = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
  return true;
}

export async function logOut() {
  (await cookies()).delete(COOKIE);
}
