import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { updateProduct } from '@/app/actions/products';
import ProductForm from '../product-form';

export const metadata = {
  title: 'Uredi proizvod | FESB Racing Merch',
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  await connectDB();
  const product = await Product.findById(id).lean().catch(() => null);
  if (!product) notFound();

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/admin" className="text-sm underline">
        ← Natrag na administraciju
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">Uredi proizvod</h1>

      <ProductForm
        action={updateProduct}
        submitLabel="Spremi izmjene"
        product={{
          _id: String(product._id),
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          sizes: product.sizes,
          category: product.category,
          stock: product.stock,
        }}
      />
    </main>
  );
}
