'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';

/**
 * Polje za količinu u košarici.
 *
 * Dok korisnik tipka, u stanju je njegov tekst - i prazan - pa se jedinica
 * može obrisati i utipkati npr. 50. Košaricu mijenjamo tek kad je upisano
 * nešto smisleno, a zaokruživanje na zalihu radimo na izlasku iz polja.
 */
export default function CartQuantity({
  quantity,
  stock,
  onChange,
}: {
  quantity: number;
  stock?: number;
  onChange: (quantity: number) => void;
}) {
  const [text, setText] = useState<string | null>(null);
  const max = stock ?? Number.MAX_SAFE_INTEGER;

  function clamp(value: number) {
    return Math.min(Math.max(value, 1), Math.max(max, 1));
  }

  return (
    <Input
      type="number"
      inputMode="numeric"
      min={1}
      max={stock}
      aria-label="Količina"
      className="w-16 text-center"
      value={text ?? String(quantity)}
      onChange={(event) => {
        const next = event.target.value;
        setText(next);

        const parsed = Number.parseInt(next, 10);
        if (Number.isFinite(parsed) && parsed >= 1) onChange(clamp(parsed));
      }}
      onBlur={() => setText(null)}
    />
  );
}
