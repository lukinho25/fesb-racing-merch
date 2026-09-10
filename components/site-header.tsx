'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart';

export default function SiteHeader() {
  const { count } = useCart();

  return (
    <header>
      {/* Traka je uvijek tamna - logo tima je zamisljen na crnom. */}
      <div className="brand-surface relative">
        <div className="brand-stripes absolute inset-0" aria-hidden />

        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="shrink-0">
            <Image
              src="/fesb-racing-logo-light.png"
              alt="FESB Racing"
              width={1600}
              height={383}
              priority
              className="h-8 w-auto sm:h-9"
            />
            <span className="sr-only">FESB Racing Merch</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              {/* /login preusmjeri na /admin ako je sesija vec aktivna. */}
              <Link href="/login">Admin</Link>
            </Button>

            <Button
              size="sm"
              asChild
              className="bg-brand hover:bg-brand-accent text-white"
            >
              <Link href="/kosarica">
                <ShoppingCart />
                Košarica
                {count > 0 && (
                  <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">
                    {count}
                  </span>
                )}
              </Link>
            </Button>
          </nav>
        </div>
      </div>

      {/* Potez boje tima + karo zastavica kao rub. */}
      <div className="brand-rule h-1" />
      <div className="brand-checker h-2" />
    </header>
  );
}
