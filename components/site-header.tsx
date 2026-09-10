'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart';

export default function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold">
          FESB Racing Merch
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            {/* /login preusmjeri na /admin ako je sesija vec aktivna. */}
            <Link href="/login">Admin</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/kosarica">
              <ShoppingCart />
              Košarica
              {count > 0 && <Badge variant="secondary">{count}</Badge>}
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
