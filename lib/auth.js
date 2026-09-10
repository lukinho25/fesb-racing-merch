import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

/**
 * Sloj za pristup podacima: svaka stranica, akcija i API ruta koja mijenja
 * proizvode mora prvo pozvati ovo. Ako nema valjane admin sesije -> /login.
 */
export const requireAdmin = cache(async () => {
  const session = await getSession();

  if (session?.role !== 'admin') {
    redirect('/login');
  }

  return session;
});

/** Kao requireAdmin, ali samo javlja je li korisnik admin (bez preusmjeravanja). */
export const isAdmin = cache(async () => {
  const session = await getSession();
  return session?.role === 'admin';
});
