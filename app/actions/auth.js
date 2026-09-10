'use server';

import { redirect } from 'next/navigation';
import { checkAdminPassword, createSession, deleteSession } from '@/lib/session';

export async function login(_prevState, formData) {
  const password = formData.get('password');

  if (typeof password !== 'string' || password.length === 0) {
    return { error: 'Unesi lozinku.' };
  }

  try {
    if (!checkAdminPassword(password)) {
      return { error: 'Pogrešna lozinka.' };
    }
    await createSession();
  } catch (err) {
    // Npr. varijable okoline nisu postavljene na serveru - pokaži poruku
    // umjesto da cijela stranica padne na 500.
    console.error('Prijava nije uspjela:', err);
    return { error: err.message ?? 'Prijava trenutno nije moguća.' };
  }

  redirect('/admin');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
