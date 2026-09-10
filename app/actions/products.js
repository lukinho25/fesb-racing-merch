'use server';

import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import { deleteImage, saveImage } from '@/lib/upload';
import Product from '@/models/Product';

function parseSizes(value) {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((size) => size.trim().toUpperCase())
    .filter(Boolean);
}

function readForm(formData) {
  const name = String(formData.get('name') ?? '').trim();
  const price = Number(formData.get('price'));
  const stock = Number(formData.get('stock') ?? 0);

  if (!name) return { error: 'Naziv proizvoda je obavezan.' };
  if (!Number.isFinite(price) || price < 0) {
    return { error: 'Cijena mora biti broj veći ili jednak 0.' };
  }
  if (!Number.isFinite(stock) || stock < 0) {
    return { error: 'Zaliha mora biti broj veći ili jednak 0.' };
  }

  return {
    data: {
      name,
      price,
      stock,
      description: String(formData.get('description') ?? '').trim(),
      category: String(formData.get('category') ?? '').trim(),
      sizes: parseSizes(formData.get('sizes')),
    },
  };
}

export async function createProduct(_prevState, formData) {
  await requireAdmin();

  const { data, error } = readForm(formData);
  if (error) return { error };

  try {
    const image = await saveImage(formData.get('image'));
    const imageUrl = String(formData.get('imageUrl') ?? '').trim();

    await connectDB();
    await Product.create({ ...data, image: image ?? imageUrl });
  } catch (err) {
    return { error: err.message ?? 'Spremanje proizvoda nije uspjelo.' };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: `Proizvod "${data.name}" je dodan.` };
}

export async function updateProduct(_prevState, formData) {
  await requireAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Nedostaje ID proizvoda.' };

  const { data, error } = readForm(formData);
  if (error) return { error };

  try {
    const image = await saveImage(formData.get('image'));
    const imageUrl = String(formData.get('imageUrl') ?? '').trim();
    const update = { ...data };

    // Sliku mijenjamo samo ako je poslana nova datoteka ili nova adresa.
    if (image) update.image = image;
    else if (imageUrl) update.image = imageUrl;

    await connectDB();
    const updated = await Product.findByIdAndUpdate(id, update);
    if (!updated) return { error: 'Proizvod nije pronađen.' };
  } catch (err) {
    return { error: err.message ?? 'Spremanje izmjena nije uspjelo.' };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath(`/proizvodi/${id}`);
  return { success: `Proizvod "${data.name}" je ažuriran.` };
}

export async function deleteProduct(formData) {
  await requireAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await connectDB();
  const deleted = await Product.findByIdAndDelete(id);
  await deleteImage(deleted?.image);

  revalidatePath('/');
  revalidatePath('/admin');
}
