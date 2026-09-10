export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import { isAdmin } from '@/lib/auth';
import Product from '@/models/Product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function Home() {
  await connectDB();
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  const admin = await isAdmin();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Proizvodi</h1>
        {admin && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">Administracija</Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <Link
            key={String(product._id)}
            href={`/proizvodi/${String(product._id)}`}
            className="focus-visible:ring-ring rounded-xl focus-visible:ring-2 focus-visible:outline-none"
          >
            <Card className="hover:border-foreground/20 h-full overflow-hidden pt-0 transition-colors">
              <div className="bg-muted text-muted-foreground flex h-48 items-center justify-center overflow-hidden">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm">Nema slike</span>
                )}
              </div>

              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-2">
                {product.description && (
                  <p className="text-muted-foreground text-sm">
                    {product.description}
                  </p>
                )}
                {product.sizes?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.sizes.map((size: string) => (
                      <Badge key={size} variant="outline">
                        {size}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="justify-between">
                <span className="font-bold">{product.price} €</span>
                {product.stock === 0 && (
                  <Badge variant="secondary">Rasprodano</Badge>
                )}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-muted-foreground">Trenutno nema proizvoda.</p>
      )}
    </main>
  );
}
