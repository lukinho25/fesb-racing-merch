'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type Variant = { size: string; stock: number };

/** "S, M, L" -> ["S","M","L"], bez praznih i bez ponavljanja. */
function parseSizes(value: string) {
  const seen = new Set<string>();
  for (const part of value.split(',')) {
    const size = part.trim().toUpperCase();
    if (size) seen.add(size);
  }
  return [...seen];
}

/**
 * Veličine se upisuju kao popis, a za svaku upisanu odmah izraste polje za
 * zalihu. Zato zaliha po veličini radi i kod novog proizvoda, bez spremanja
 * pa ponovnog otvaranja.
 */
export default function SizeStockEditor({
  variants = [],
  stock = 0,
}: {
  variants?: Variant[];
  stock?: number;
}) {
  const [sizesText, setSizesText] = useState(
    variants.map((variant) => variant.size).join(', ')
  );
  const sizes = parseSizes(sizesText);

  const known = new Map(variants.map((variant) => [variant.size, variant.stock]));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="sizes">Veličine</Label>
        <Input
          id="sizes"
          name="sizes"
          value={sizesText}
          onChange={(event) => setSizesText(event.target.value)}
          placeholder="S, M, L, XL"
        />
        <p className="text-muted-foreground text-xs">
          Odvoji zarezom. Ostavi prazno ako proizvod nema veličine.
        </p>
      </div>

      {sizes.length > 0 ? (
        <div className="grid gap-2">
          <Label>Zaliha po veličini</Label>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => (
              <div key={size} className="grid w-24 gap-1">
                <Label
                  htmlFor={`stock-${size}`}
                  className="text-muted-foreground text-xs"
                >
                  {size}
                </Label>
                <Input
                  id={`stock-${size}`}
                  name={`stock_${size}`}
                  type="number"
                  min="0"
                  defaultValue={known.get(size) ?? 0}
                />
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            Ukupna zaliha je zbroj ovih brojeva.
          </p>
        </div>
      ) : (
        <div className="grid w-24 gap-2">
          <Label htmlFor="stock">Zaliha</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={stock}
          />
        </div>
      )}
    </div>
  );
}
