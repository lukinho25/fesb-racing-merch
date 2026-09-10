import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import LoginForm from './login-form';

export const metadata = {
  title: 'Prijava | FESB Racing Merch',
};

export default async function LoginPage() {
  if (await isAdmin()) {
    redirect('/admin');
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-2">Administrator</h1>
      <p className="text-sm text-gray-500 mb-6">
        Prijavi se za uređivanje ponude proizvoda.
      </p>
      <LoginForm />
    </main>
  );
}
