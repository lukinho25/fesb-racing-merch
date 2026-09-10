'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart, type CartItem } from '@/components/cart';

export default function AddToCart({
  product,
  sizes,
  stock,
}: {
  product: Omit<CartItem, 'quantity' | 'size' | 'stock'>;
  sizes: string[];
  stock: number;
}) {
  const { addItem, items } = useCart();
  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Vec u kosarici za ovu velicinu - vise od zalihe ne pustamo ni zbrojeno.
  const inCart =
    items.find(
      (line) => line.id === product.id && (line.size ?? '') === (size ?? '')
    )?.quantity ?? 0;
  const remaining = Math.max(0, stock - inCart);

  if (stock <= 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Proizvod trenutno nije na zalihi.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sizes.length > 0 && (
        <div className="grid gap-2">
          <Label>Veličina</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((option) => (
              <Button
                key={option}
                type="button"
                variant={option === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSize(option)}
                aria-pressed={option === size}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid w-24 gap-2">
        <Label htmlFor="quantity">Količina</Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          max={stock}
          value={quantity}
          onChange={(event) =>
            setQuantity(
              Math.min(stock, Math.max(1, Number(event.target.value) || 1))
            )
          }
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          disabled={remaining === 0}
          onClick={() => {
            addItem({ ...product, size, stock }, Math.min(quantity, remaining));
            setAdded(true);
          }}
        >
          Dodaj u košaricu
        </Button>
        {remaining === 0 ? (
          <p className="text-muted-foreground text-sm">
            Sve dostupne komade već imaš u košarici.
          </p>
        ) : (
          added && (
            <Link href="/kosarica" className="text-sm underline">
              Dodano — otvori košaricu
            </Link>
          )
        )}
      </div>
    </div>
  );
}
