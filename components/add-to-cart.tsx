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
  inStock,
}: {
  product: Omit<CartItem, 'quantity' | 'size'>;
  sizes: string[];
  inStock: boolean;
}) {
  const { addItem } = useCart();
  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!inStock) {
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
          value={quantity}
          onChange={(event) =>
            setQuantity(Math.max(1, Number(event.target.value) || 1))
          }
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={() => {
            addItem({ ...product, size }, quantity);
            setAdded(true);
          }}
        >
          Dodaj u košaricu
        </Button>
        {added && (
          <Link href="/kosarica" className="text-sm underline">
            Dodano — otvori košaricu
          </Link>
        )}
      </div>
    </div>
  );
}
