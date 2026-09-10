import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { updateProduct } from '@/app/actions/products';
import { productImages } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const product = await Product.findById(id)
    .lean()
    .catch(() => null);
  if (!product) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/admin">← Natrag na administraciju</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Uredi proizvod</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            action={updateProduct}
            submitLabel="Spremi izmjene"
            product={{
              _id: String(product._id),
              name: product.name,
              description: product.description,
              price: product.price,
              images: productImages(product),
              sizes: product.sizes,
              category: product.category,
              stock: product.stock,
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
