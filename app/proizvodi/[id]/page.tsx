import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import AddToCart from '@/components/add-to-cart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

async function getProduct(id: string) {
  await connectDB();
  return Product.findById(id)
    .lean()
    .catch(() => null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  return {
    title: product
      ? `${product.name} | FESB Racing Merch`
      : 'Proizvod | FESB Racing Merch',
    description: product?.description || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const sizes: string[] = product.sizes ?? [];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/">← Natrag na trgovinu</Link>
      </Button>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="bg-muted text-muted-foreground flex aspect-square items-center justify-center overflow-hidden rounded-lg border">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-sm">Nema slike</span>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {product.category && (
              <span className="text-muted-foreground text-sm">
                {product.category}
              </span>
            )}
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-semibold">{product.price} €</p>
            {product.stock > 0 ? (
              <Badge variant="secondary" className="w-fit">
                Na zalihi: {product.stock}
              </Badge>
            ) : (
              <Badge variant="outline" className="w-fit">
                Rasprodano
              </Badge>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          )}

          <AddToCart
            product={{
              id: String(product._id),
              name: product.name,
              price: product.price,
              image: product.image,
            }}
            sizes={sizes}
            stock={product.stock}
          />
        </div>
      </div>
    </main>
  );
}
