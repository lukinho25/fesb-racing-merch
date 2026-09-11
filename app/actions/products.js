'use server';

import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import { deleteImage, saveImages } from '@/lib/upload';
import Product from '@/models/Product';
import { productImages } from '@/lib/products';

function parseSizes(value) {
  if (typeof value !== 'string') return [];
  const seen = new Set();
  for (const part of value.split(',')) {
    const size = part.trim().toUpperCase();
    if (size) seen.add(size);
  }
  return [...seen];
}

function readForm(formData) {
  const name = String(formData.get('name') ?? '').trim();
  const price = Number(formData.get('price'));
  const sizes = parseSizes(formData.get('sizes'));

  if (!name) return { error: 'Naziv proizvoda je obavezan.' };
  if (!Number.isFinite(price) || price < 0) {
    return { error: 'Cijena mora biti broj veći ili jednak 0.' };
  }

  // Sa veličinama zaliha dolazi po veličini (stock_S, stock_M...), bez njih
  // je jedan broj. Ukupna zaliha je uvijek zbroj, pa katalog i dalje zna
  // je li proizvod rasprodan.
  const variants = [];
  for (const size of sizes) {
    const stock = Number(formData.get(`stock_${size}`) ?? 0);
    if (!Number.isFinite(stock) || stock < 0) {
      return { error: `Zaliha za veličinu ${size} mora biti broj 0 ili veći.` };
    }
    variants.push({ size, stock });
  }

  const plainStock = Number(formData.get('stock') ?? 0);
  if (sizes.length === 0 && (!Number.isFinite(plainStock) || plainStock < 0)) {
    return { error: 'Zaliha mora biti broj veći ili jednak 0.' };
  }

  return {
    data: {
      name,
      price,
      sizes,
      variants,
      stock: sizes.length
        ? variants.reduce((sum, variant) => sum + variant.stock, 0)
        : plainStock,
      description: String(formData.get('description') ?? '').trim(),
      category: String(formData.get('category') ?? '').trim(),
    },
  };
}

export async function createProduct(_prevState, formData) {
  await requireAdmin();

  const { data, error } = readForm(formData);
  if (error) return { error };

  try {
    const uploaded = await saveImages(formData.getAll('images'));
    const imageUrl = String(formData.get('imageUrl') ?? '').trim();
    // Prva slika je glavna: ona se vidi u katalogu.
    const images = [...uploaded, ...(imageUrl ? [imageUrl] : [])];

    await connectDB();
    await Product.create({ ...data, images, image: images[0] ?? '' });
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
    await connectDB();
    const existing = await Product.findById(id).lean();
    if (!existing) return { error: 'Proizvod nije pronađen.' };

    const removed = new Set(formData.getAll('removeImages').map(String));
    const kept = productImages(existing).filter((url) => !removed.has(url));

    const uploaded = await saveImages(formData.getAll('images'));
    const imageUrl = String(formData.get('imageUrl') ?? '').trim();
    const all = [...kept, ...uploaded, ...(imageUrl ? [imageUrl] : [])];

    // Glavna ide na prvo mjesto; ako je obrisana, glavna postaje prva preostala.
    const chosenMain = String(formData.get('mainImage') ?? '');
    const images = all.includes(chosenMain)
      ? [chosenMain, ...all.filter((url) => url !== chosenMain)]
      : all;

    await Product.findByIdAndUpdate(id, {
      ...data,
      images,
      image: images[0] ?? '',
    });

    // Datoteke brisemo tek kad je zapis spremljen.
    for (const url of removed) await deleteImage(url);
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
  if (deleted) {
    for (const url of productImages(deleted)) await deleteImage(url);
  }

  revalidatePath('/');
  revalidatePath('/admin');
}
