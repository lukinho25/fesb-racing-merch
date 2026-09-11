'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/components/cart';
import CartQuantity from '@/components/cart-quantity';

export default function CartPage() {
  const { items, total, setQuantity, removeItem, clear } = useCart();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="bg-brand h-6 w-1.5 rounded-full" aria-hidden />
        <h1 className="text-3xl font-bold">Košarica</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-muted-foreground">Košarica je prazna.</p>
          <Button asChild>
            <Link href="/">Pogledaj proizvode</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <Card
              key={`${item.id}-${item.size ?? ''}`}
              className="flex flex-row items-center gap-4 p-3"
            >
              <div className="bg-muted flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded p-1">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>

              <div className="min-w-0 grow">
                <Link
                  href={`/proizvodi/${item.id}`}
                  className="truncate font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-muted-foreground text-sm">
                  {item.price} €{item.size && ` · veličina ${item.size}`}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Smanji količinu"
                  onClick={() =>
                    setQuantity(item.id, item.size, item.quantity - 1)
                  }
                >
                  −
                </Button>
                <CartQuantity
                  quantity={item.quantity}
                  stock={item.stock}
                  onChange={(quantity) =>
                    setQuantity(item.id, item.size, quantity)
                  }
                />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Povećaj količinu"
                  disabled={
                    item.stock !== undefined && item.quantity >= item.stock
                  }
                  onClick={() =>
                    setQuantity(item.id, item.size, item.quantity + 1)
                  }
                >
                  +
                </Button>
              </div>

              <span className="w-20 text-right font-medium tabular-nums">
                {(item.price * item.quantity).toFixed(2)} €
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id, item.size)}
              >
                Ukloni
              </Button>
            </Card>
          ))}

          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="ghost" size="sm" onClick={clear}>
              Isprazni košaricu
            </Button>
            <p className="text-lg font-bold">
              Ukupno: <span className="text-brand">{total.toFixed(2)} €</span>
            </p>
          </div>

          <Button asChild className="self-end">
            <Link href="/blagajna">Nastavi na narudžbu</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
