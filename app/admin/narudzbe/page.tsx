import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { updateOrderStatus } from '@/app/actions/orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Narudžbe | FESB Racing Merch',
};

const STATUS_LABELS: Record<string, string> = {
  nova: 'Nova',
  potvrdena: 'Potvrđena',
  preuzeta: 'Preuzeta',
  otkazana: 'Otkazana',
};

/** Sljedeći koraci koje nudimo za trenutni status. */
const NEXT_STATUSES: Record<string, string[]> = {
  nova: ['potvrdena', 'otkazana'],
  potvrdena: ['preuzeta', 'otkazana'],
  preuzeta: [],
  otkazana: ['nova'],
};

export default async function OrdersPage() {
  await requireAdmin();

  await connectDB();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
  const newCount = orders.filter((order) => order.status === 'nova').length;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Narudžbe</h1>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">← Proizvodi</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">Još nema narudžbi.</p>
      ) : (
        <>
          <p className="text-muted-foreground mb-4 text-sm">
            Ukupno {orders.length}, novih {newCount}.
          </p>

          <ul className="flex flex-col gap-4">
            {orders.map((order) => (
              <li key={String(order._id)}>
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle>
                        {order.firstName} {order.lastName}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        <a href={`mailto:${order.email}`} className="underline">
                          {order.email}
                        </a>
                        {order.phone && ` · ${order.phone}`}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleString('hr-HR')}
                      </p>
                    </div>
                    <Badge
                      variant={order.status === 'nova' ? 'default' : 'secondary'}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
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
                      <span className="tabular-nums">
                        {order.total.toFixed(2)} €
                      </span>
                    </div>

                    {order.note && (
                      <p className="text-muted-foreground text-sm">
                        Napomena: {order.note}
                      </p>
                    )}

                    {NEXT_STATUSES[order.status]?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {NEXT_STATUSES[order.status].map((status) => (
                          <form key={status} action={updateOrderStatus}>
                            <input
                              type="hidden"
                              name="id"
                              value={String(order._id)}
                            />
                            <input type="hidden" name="status" value={status} />
                            <Button
                              type="submit"
                              size="sm"
                              variant={
                                status === 'otkazana' ? 'outline' : 'default'
                              }
                            >
                              Označi kao {STATUS_LABELS[status].toLowerCase()}
                            </Button>
                          </form>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
