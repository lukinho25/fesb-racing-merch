import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import LoginForm from './login-form';

export const metadata = {
  title: 'Prijava | FESB Racing Merch',
};

export default async function LoginPage() {
  if (await isAdmin()) {
    redirect('/admin');
  }

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-20">
      <Card>
        <CardHeader>
          <CardTitle>Administrator</CardTitle>
          <CardDescription>
            Prijavi se za uređivanje ponude proizvoda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
