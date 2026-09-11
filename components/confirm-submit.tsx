'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Gumb koji traži drugi klik. Brisanje je nepovratno, a narudžbe se briše
 * usput uz ostale gumbe, pa je lako promašiti.
 */
export default function ConfirmSubmit({
  label,
  confirmLabel,
}: {
  label: string;
  confirmLabel: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setArmed(true)}
      >
        {label}
      </Button>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <Button type="submit" variant="destructive" size="sm">
        {confirmLabel}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setArmed(false)}
      >
        Odustani
      </Button>
    </span>
  );
}
