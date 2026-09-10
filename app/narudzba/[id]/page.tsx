import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ClearCartOnMount from './clear-cart';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Narudžba zaprimljena | FESB Racing Merch',
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await connectDB();
  const order = await Order.findById(id)
    .lean()
    .catch(() => null);
  if (!order) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <ClearCartOnMount />

      <h1 className="mb-2 text-3xl font-bold">Narudžba je zaprimljena</h1>
      <p className="text-muted-foreground mb-6">
        Hvala, {order.firstName}. Javljamo ti se na {order.email} radi dogovora
        o plaćanju i preuzimanju.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Broj narudžbe: {String(order._id).slice(-6)}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {order.items.map(
            (
              item: {
                name: string;
                size?: string;
                price: number;
                quantity: number;
              },
              index: number
            ) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.name}
                  {item.size && ` (${item.size})`} × {item.quantity}
                </span>
                <span className="tabular-nums">
                  {(item.price * item.quantity).toFixed(2)} €
                </span>
              </div>
            )
          )}
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>Ukupno</span>
            <span className="tabular-nums">{order.total.toFixed(2)} €</span>
          </div>
        </CardContent>
      </Card>

      <Button asChild variant="outline" className="mt-6">
        <Link href="/">Natrag na trgovinu</Link>
      </Button>
    </main>
  );
}
