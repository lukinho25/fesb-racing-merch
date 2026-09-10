'use client';

import { useEffect } from 'react';
import { useCart } from '@/components/cart';

/** Narudžba je spremljena, pa košarica na ovoj stranici više nema smisla. */
export default function ClearCartOnMount() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // Namjerno samo pri montiranju - clear se mijenja pri svakom renderu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
