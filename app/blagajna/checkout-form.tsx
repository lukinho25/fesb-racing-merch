'use client';

import { useActionState } from 'react';
import { createOrder } from '@/app/actions/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/components/cart';

export default function CheckoutForm() {
  const { items, total } = useCart();
  const [state, action, pending] = useActionState(createOrder, undefined);

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">
        Košarica je prazna, nema se što naručiti.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {/* Server ionako ponovno cita cijene i zalihu iz baze. */}
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName">Ime *</Label>
          <Input id="firstName" name="firstName" required autoComplete="given-name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Prezime *</Label>
          <Input id="lastName" name="lastName" required autoComplete="family-name" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note">Napomena</Label>
        <Textarea
          id="note"
          name="note"
          rows={3}
          placeholder="npr. kad ti odgovara preuzimanje"
        />
      </div>

      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Šaljem...' : `Pošalji narudžbu (${total.toFixed(2)} €)`}
      </Button>

      <p className="text-muted-foreground text-xs">
        Narudžba se ne plaća preko stranice. Nakon slanja javljamo ti se na
        e-mail radi dogovora o plaćanju i preuzimanju.
      </p>
    </form>
  );
}
