'use client';

import { useSyncExternalStore } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  size?: string;
  quantity: number;
};

const STORAGE_KEY = 'fesb-cart';
const EMPTY: CartItem[] = [];

/**
 * Košarica živi u localStorageu, a React je čita preko useSyncExternalStore.
 * Snimka mora biti referencijalno stabilna, pa parsirane stavke keširamo i
 * cache poništavamo tek kad se sadržaj promijeni (i u drugoj kartici).
 */
let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function readCart(): CartItem[] {
  if (cache) return cache;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    cache = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    // Neispravan JSON ili nedostupan localStorage (privatni način rada).
    cache = EMPTY;
  }
  return cache;
}

function writeCart(next: CartItem[]) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Bez pohrane košarica živi samo do osvježavanja stranice.
  }
  for (const listener of listeners) listener();
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  cache = null;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    window.addEventListener('storage', handleStorageEvent);
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('storage', handleStorageEvent);
    }
  };
}

/** Na serveru je košarica uvijek prazna - inače se hidracija ne bi poklopila. */
function getServerSnapshot() {
  return EMPTY;
}

/** Ista stavka = isti proizvod i ista veličina. */
function sameLine(line: CartItem, id: string, size: string | undefined) {
  return line.id === id && (line.size ?? '') === (size ?? '');
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, readCart, getServerSnapshot);

  return {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),

    addItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
      const current = readCart();
      const existing = current.find((line) => sameLine(line, item.id, item.size));

      writeCart(
        existing
          ? current.map((line) =>
              line === existing
                ? { ...line, quantity: line.quantity + quantity }
                : line
            )
          : [...current, { ...item, quantity }]
      );
    },

    setQuantity(id: string, size: string | undefined, quantity: number) {
      const current = readCart();
      writeCart(
        quantity <= 0
          ? current.filter((line) => !sameLine(line, id, size))
          : current.map((line) =>
              sameLine(line, id, size) ? { ...line, quantity } : line
            )
      );
    },

    removeItem(id: string, size: string | undefined) {
      writeCart(readCart().filter((line) => !sameLine(line, id, size)));
    },

    clear() {
      writeCart(EMPTY);
    },
  };
}
