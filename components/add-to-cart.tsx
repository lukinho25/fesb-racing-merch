'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart, type CartItem } from '@/components/cart';

export default function AddToCart({
  product,
  variants,
  stock,
}: {
  product: Omit<CartItem, 'quantity' | 'size' | 'stock'>;
  variants: { size: string; stock: number }[];
  stock: number;
}) {
  const { addItem, items } = useCart();
  // Krecemo od prve velicine koja je na zalihi.
  const [size, setSize] = useState<string | undefined>(
    variants.find((variant) => variant.stock > 0)?.size ?? variants[0]?.size
  );
  // Drzimo upisani tekst, ne broj: inace se jedinica ne moze obrisati pa se
  // dvoznamenkasta kolicina uopce ne moze utipkati.
  const [quantityText, setQuantityText] = useState('1');
  const [added, setAdded] = useState(false);

  // Vec u kosarici za ovu velicinu - vise od zalihe ne pustamo ni zbrojeno.
  const inCart =
    items.find(
      (line) => line.id === product.id && (line.size ?? '') === (size ?? '')
    )?.quantity ?? 0;
  // Zaliha odabrane velicine; bez velicina vrijedi ukupna.
  const sizeStock = size
    ? (variants.find((variant) => variant.size === size)?.stock ?? 0)
    : stock;
  const remaining = Math.max(0, sizeStock - inCart);

  const typed = Number.parseInt(quantityText, 10);
  const quantity = Math.min(
    Math.max(Number.isFinite(typed) ? typed : 1, 1),
    Math.max(remaining, 1)
  );

  if (stock <= 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Proizvod trenutno nije na zalihi.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {variants.length > 0 && (
        <div className="grid gap-2">
          <Label>Veličina</Label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <Button
                key={variant.size}
                type="button"
                variant={variant.size === size ? 'default' : 'outline'}
                size="sm"
                disabled={variant.stock === 0}
                title={variant.stock === 0 ? 'Rasprodano' : undefined}
                onClick={() => setSize(variant.size)}
                aria-pressed={variant.size === size}
              >
                {variant.size}
              </Button>
            ))}
          </div>
          {size && (
            <p className="text-muted-foreground text-xs">
              {sizeStock > 0
                ? `Na zalihi: ${sizeStock} kom veličine ${size}.`
                : `Veličina ${size} je rasprodana.`}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="quantity">Količina</Label>
        <Input
          id="quantity"
          type="number"
          inputMode="numeric"
          min={1}
          max={remaining}
          className="w-24"
          value={quantityText}
          // Dok tipka, sve prolazi - i prazno polje. Slazemo tek na izlasku.
          onChange={(event) => setQuantityText(event.target.value)}
          onBlur={() => setQuantityText(String(quantity))}
        />
        {typed > remaining && (
          <p className="text-muted-foreground text-xs">
            Na zalihi je {remaining}, pa toliko i dodajemo.
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          disabled={remaining === 0 || sizeStock === 0}
          onClick={() => {
            addItem({ ...product, size, stock: sizeStock }, quantity);
            setQuantityText(String(quantity));
            setAdded(true);
          }}
        >
          Dodaj u košaricu
        </Button>
        {remaining === 0 && sizeStock > 0 ? (
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
