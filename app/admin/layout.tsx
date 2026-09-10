import Link from 'next/link';
import { isAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

/** Hrvatska množina: 1 narudžba čeka, 2-4 narudžbe čekaju, 5+ narudžbi čeka. */
function unconfirmedSentence(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (last === 1 && lastTwo !== 11) {
    return `${count} nepotvrđena narudžba čeka na obradu.`;
  }
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return `${count} nepotvrđene narudžbe čekaju na obradu.`;
  }
  return `${count} nepotvrđenih narudžbi čeka na obradu.`;
}

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  // Same stranice traže prijavu; ovdje samo ne brojimo tuđim posjetiteljima.
  if (!(await isAdmin())) return children;

  await connectDB();
  const unconfirmed = await Order.countDocuments({ status: 'nova' });

  return (
    <>
      {unconfirmed > 0 && (
        <div className="border-b border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-2">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              {unconfirmedSentence(unconfirmed)}
            </p>
            <Link
              href="/admin/narudzbe"
              className="shrink-0 text-sm font-medium text-amber-900 underline dark:text-amber-200"
            >
              Pogledaj
            </Link>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
