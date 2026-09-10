'use server';

import { redirect } from 'next/navigation';
import { checkAdminPassword, createSession, deleteSession } from '@/lib/session';

export async function login(_prevState, formData) {
  const password = formData.get('password');

  if (typeof password !== 'string' || password.length === 0) {
    return { error: 'Unesi lozinku.' };
  }

  if (!checkAdminPassword(password)) {
    return { error: 'Pogrešna lozinka.' };
  }

  await createSession();
  redirect('/admin');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
