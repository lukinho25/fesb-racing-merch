import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { createProduct, deleteProduct } from '@/app/actions/products';
import { logout } from '@/app/actions/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductForm from './product-form';

export const metadata = {
  title: 'Admin | FESB Racing Merch',
};

export default async function AdminPage() {
  await requireAdmin();

  await connectDB();
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Administracija</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Pogledaj trgovinu</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/narudzbe">Narudžbe</Link>
          </Button>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Odjava
            </Button>
          </form>
        </div>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Novi proizvod</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm action={createProduct} submitLabel="Dodaj proizvod" />
        </CardContent>
      </Card>

      <h2 className="mb-4 text-xl font-semibold">
        Proizvodi ({products.length})
      </h2>

      {products.length === 0 ? (
        <p className="text-muted-foreground">Još nema proizvoda.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((product) => (
            <li key={String(product._id)}>
              <Card className="flex flex-row items-center gap-4 p-3">
                <div className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded p-1">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-muted-foreground text-[10px]">
                      nema
                    </span>
                  )}
                </div>

                <div className="min-w-0 grow">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {product.price} € · zaliha {product.stock}
                  </p>
                  {product.sizes?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {product.sizes.map((size: string) => (
                        <Badge key={size} variant="secondary">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/${String(product._id)}`}>Uredi</Link>
                </Button>

                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={String(product._id)} />
                  <Button variant="destructive" size="sm" type="submit">
                    Obriši
                  </Button>
                </form>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
