'use client';

import { useActionState } from 'react';

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
  image?: string;
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
  const inputClass = 'border rounded px-3 py-2 w-full';

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {product?._id && <input type="hidden" name="id" value={product._id} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Naziv *
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={product?.name}
          placeholder="npr. FESB Racing majica 2026"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Opis
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Cijena (€) *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium mb-1">
            Zaliha
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 0}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Kategorija
          </label>
          <input
            id="category"
            name="category"
            defaultValue={product?.category}
            placeholder="majice, hoodie, kape..."
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="sizes" className="block text-sm font-medium mb-1">
          Veličine
        </label>
        <input
          id="sizes"
          name="sizes"
          defaultValue={product?.sizes?.join(', ')}
          placeholder="S, M, L, XL"
          className={inputClass}
        />
        <p className="text-xs text-gray-500 mt-1">Odvoji zarezom.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="image" className="block text-sm font-medium mb-1">
            Slika (datoteka)
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="w-full text-sm"
          />
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
            ili adresa slike
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      </div>

      {product?.image && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name ?? ''}
            className="h-16 w-16 object-cover rounded border"
          />
          <p className="text-xs text-gray-500">
            Trenutna slika. Ostane ista ako ne odabereš novu.
          </p>
        </div>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-black text-white rounded px-4 py-2 self-start disabled:opacity-50"
      >
        {pending ? 'Spremanje...' : submitLabel}
      </button>
    </form>
  );
}
