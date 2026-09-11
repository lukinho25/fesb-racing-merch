'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import { notifyNewOrder } from '@/lib/notify';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { stockForSize } from '@/lib/products';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readCustomer(formData) {
  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();

  if (!firstName || !lastName) return { error: 'Upiši ime i prezime.' };
  if (!EMAIL_PATTERN.test(email)) return { error: 'Upiši ispravnu e-mail adresu.' };

  return {
    customer: {
      firstName,
      lastName,
      email,
      phone: String(formData.get('phone') ?? '').trim(),
      note: String(formData.get('note') ?? '').trim(),
    },
  };
}

/** Košarica stiže s klijenta, pa iz nje uzimamo samo id, veličinu i količinu. */
function readCartLines(formData) {
  let parsed;
  try {
    parsed = JSON.parse(String(formData.get('items') ?? '[]'));
  } catch {
    return { error: 'Košarica je neispravna. Osvježi stranicu i pokušaj ponovno.' };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { error: 'Košarica je prazna.' };
  }

  const lines = [];
  for (const line of parsed) {
    const quantity = Number(line?.quantity);
    if (!line?.id || !Number.isInteger(quantity) || quantity < 1) {
      return { error: 'Košarica je neispravna. Osvježi stranicu i pokušaj ponovno.' };
    }
    lines.push({
      id: String(line.id),
      size: line.size ? String(line.size) : undefined,
      quantity,
    });
  }

  return { lines };
}

/** Proizvod s veličinama skida zalihu te veličine, ostali samo ukupnu. */
function hasVariants(line, byId) {
  return Boolean(line.size && byId.get(line.id)?.variants?.length);
}

/** Vraća zalihu jedne stavke na stanje. */
async function releaseLine(line, byId) {
  if (hasVariants(line, byId)) {
    await Product.updateOne(
      { _id: line.id, 'variants.size': line.size },
      { $inc: { 'variants.$.stock': line.quantity, stock: line.quantity } }
    );
  } else {
    await Product.updateOne({ _id: line.id }, { $inc: { stock: line.quantity } });
  }
}

/**
 * Skida zalihu samo ako je stvarno ima. Uvjet u upitu i $inc su jedna
 * atomarna operacija, pa dvije istovremene narudžbe ne mogu obje proći
 * kroz istu zadnju majicu.
 */
async function reserveStock(lines, byId) {
  const reserved = [];

  for (const line of lines) {
    const result = hasVariants(line, byId)
      ? await Product.updateOne(
          {
            _id: line.id,
            variants: {
              $elemMatch: { size: line.size, stock: { $gte: line.quantity } },
            },
          },
          { $inc: { 'variants.$.stock': -line.quantity, stock: -line.quantity } }
        )
      : await Product.updateOne(
          { _id: line.id, stock: { $gte: line.quantity } },
          { $inc: { stock: -line.quantity } }
        );

    if (result.modifiedCount !== 1) {
      // Vrati sve što je ova narudžba već skinula pa odustani.
      for (const done of reserved) await releaseLine(done, byId);
      return { failed: line };
    }

    reserved.push(line);
  }

  return { reserved };
}

/** Stavke narudžbe u obliku koji razumiju reserveStock i releaseLine. */
function orderLines(order) {
  return order.items.map((item) => ({
    id: String(item.product),
    size: item.size,
    quantity: item.quantity,
  }));
}

/** Proizvodi tih stavki, po id-u, da znamo idu li kroz varijante. */
async function productsForLines(lines) {
  const products = await Product.find({
    _id: { $in: lines.map((line) => line.id) },
  }).lean();
  return new Map(products.map((product) => [String(product._id), product]));
}

export async function createOrder(_prevState, formData) {
  const { customer, error: customerError } = readCustomer(formData);
  if (customerError) return { error: customerError };

  const { lines, error: cartError } = readCartLines(formData);
  if (cartError) return { error: cartError };

  await connectDB();

  // Cijene i nazive uzimamo iz baze - klijentu se ne vjeruje na riječ.
  const products = await Product.find({ _id: { $in: lines.map((l) => l.id) } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  for (const line of lines) {
    if (!byId.has(line.id)) {
      return { error: 'Neki proizvod iz košarice više ne postoji. Osvježi košaricu.' };
    }
  }

  const { failed } = await reserveStock(lines, byId);
  if (failed) {
    const product = byId.get(failed.id);
    const available = stockForSize(product, failed.size);
    const what = failed.size ? `"${product.name}" (${failed.size})` : `"${product.name}"`;
    return {
      error: `${what} nema dovoljno na zalihi (traženo ${failed.quantity}, dostupno ${available}). Smanji količinu.`,
    };
  }

  const items = lines.map((line) => {
    const product = byId.get(line.id);
    return {
      product: product._id,
      name: product.name,
      size: line.size,
      price: product.price,
      quantity: line.quantity,
    };
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let order;
  try {
    order = await Order.create({ ...customer, items, total });
  } catch (err) {
    // Zaliha je vec skinuta, a narudzbe nema - vrati je da ne nestane niotkuda.
    for (const line of lines) await releaseLine(line, byId);
    console.error('Spremanje narudžbe nije uspjelo:', err);
    return { error: 'Narudžba nije spremljena. Pokušaj ponovno.' };
  }

  await notifyNewOrder(order);

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/narudzbe');

  redirect(`/narudzba/${order._id}`);
}

/**
 * Mijenja status narudžbe i uz to vodi računa o zalihi:
 * otkazivanje vraća komade na stanje, a ponovno otvaranje otkazane
 * narudžbe ih mora skinuti natrag - ako ih u međuvremenu nema, status
 * ostaje neizmijenjen umjesto da zaliha padne u minus.
 */
export async function updateOrderStatus(_prevState, formData) {
  await requireAdmin();

  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!id || !['nova', 'potvrdena', 'preuzeta', 'otkazana'].includes(status)) {
    return { error: 'Neispravan zahtjev.' };
  }

  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) return { error: 'Narudžba nije pronađena.' };
  if (order.status === status) return;

  const lines = orderLines(order);
  const byId = await productsForLines(lines);
  let stockReturned = Boolean(order.stockReturned);

  if (status === 'otkazana' && !stockReturned) {
    for (const line of lines) await releaseLine(line, byId);
    stockReturned = true;
  } else if (status !== 'otkazana' && stockReturned) {
    const { failed } = await reserveStock(lines, byId);
    if (failed) {
      const product = byId.get(failed.id);
      const what = failed.size
        ? `${product?.name ?? 'Proizvod'} (${failed.size})`
        : (product?.name ?? 'Proizvod');
      return {
        error: `Nema dovoljno zalihe za ${what}, pa narudžba ostaje otkazana.`,
      };
    }
    stockReturned = false;
  }

  await Order.findByIdAndUpdate(id, { status, stockReturned });

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/narudzbe');
}

/**
 * Briše gotovu narudžbu. Nove i potvrđene ostaju - njih se prvo zatvori
 * (preuzeta ili otkazana), pa tek onda može nestati iz popisa.
 */
export async function deleteOrder(formData) {
  await requireAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) return;

  // Do ovdje se preko sucelja ne moze doci; gumb se nudi samo za gotove.
  if (!['preuzeta', 'otkazana'].includes(order.status)) {
    console.error('Odbijeno brisanje narudžbe koja nije gotova:', id);
    return;
  }

  await Order.findByIdAndDelete(id);
  revalidatePath('/admin/narudzbe');
}
