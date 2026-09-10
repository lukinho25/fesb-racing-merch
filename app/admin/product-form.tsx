'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type ProductFormState = { error?: string; success?: string } | undefined;

type ProductAction = (
  state: ProductFormState,
  formData: FormData
) => Promise<ProductFormState>;

export type ProductValues = {
  _id?: string;
  name?: string;
  description?: string;
  price?: number;
  images?: string[];
  sizes?: string[];
  category?: string;
  stock?: number;
};

export default function ProductForm({
  action,
  product,
  submitLabel = 'Spremi proizvod',
}: {
  action: ProductAction;
  product?: ProductValues;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const existing = product?.images ?? [];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {product?._id && <input type="hidden" name="id" value={product._id} />}

      <div className="grid gap-2">
        <Label htmlFor="name">Naziv *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={product?.name}
          placeholder="npr. FESB Racing majica 2026"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Opis</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="price">Cijena (€) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stock">Zaliha</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 0}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Kategorija</Label>
          <Input
            id="category"
            name="category"
            defaultValue={product?.category}
            placeholder="majice, hoodie, kape..."
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="sizes">Veličine</Label>
        <Input
          id="sizes"
          name="sizes"
          defaultValue={product?.sizes?.join(', ')}
          placeholder="S, M, L, XL"
        />
        <p className="text-xs text-muted-foreground">Odvoji zarezom.</p>
      </div>

      {existing.length > 0 && (
        <div className="grid gap-2">
          <Label>Slike proizvoda</Label>
          <div className="flex flex-wrap gap-4">
            {existing.map((url, index) => (
              <div key={url} className="flex w-28 flex-col gap-1">
                <div className="bg-muted flex h-28 items-center justify-center overflow-hidden rounded border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="radio"
                    name="mainImage"
                    value={url}
                    defaultChecked={index === 0}
                  />
                  Glavna
                </label>
                <label className="text-destructive flex items-center gap-1 text-xs">
                  <input type="checkbox" name="removeImages" value={url} />
                  Ukloni
                </label>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            Glavna slika se prikazuje u katalogu. Uklonjene se brišu tek kad
            spremiš.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="images">
            {existing.length > 0 ? 'Dodaj još slika' : 'Slike (datoteke)'}
          </Label>
          <Input
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
          />
          <p className="text-muted-foreground text-xs">
            Možeš odabrati više datoteka odjednom.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="imageUrl">ili adresa slike</Label>
          <Input id="imageUrl" name="imageUrl" placeholder="https://..." />
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-emerald-600">{state.success}</p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Spremanje...' : submitLabel}
      </Button>
    </form>
  );
}
