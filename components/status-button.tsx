'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { updateOrderStatus } from '@/app/actions/orders';

/**
 * Promjena statusa je vlastita forma po gumbu, jer akcija može odbiti
 * promjenu (npr. otkazanu narudžbu ne možemo vratiti ako zalihe više nema),
 * pa razlog treba negdje prikazati.
 */
export default function StatusButton({
  orderId,
  status,
  label,
  variant = 'default',
}: {
  orderId: string;
  status: string;
  label: string;
  variant?: 'default' | 'outline';
}) {
  const [state, action, pending] = useActionState(updateOrderStatus, undefined);

  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="id" value={orderId} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={variant} disabled={pending}>
        {label}
      </Button>
      {state?.error && (
        <p className="text-destructive max-w-60 text-xs">{state.error}</p>
      )}
    </form>
  );
}
