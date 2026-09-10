'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/components/cart';

export default function CartSummary() {
  const { items, total } = useCart();

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sažetak</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={`${item.id}-${item.size ?? ''}`}
            className="flex justify-between text-sm"
          >
            <span>
              {item.name}
              {item.size && ` (${item.size})`} × {item.quantity}
            </span>
            <span className="tabular-nums">
              {(item.price * item.quantity).toFixed(2)} €
            </span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2 font-bold">
          <span>Ukupno</span>
          <span className="text-brand tabular-nums">{total.toFixed(2)} €</span>
        </div>
      </CardContent>
    </Card>
  );
}
