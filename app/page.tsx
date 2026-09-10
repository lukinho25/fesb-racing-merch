export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { Badge } from '@/components/ui/badge';
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

  return (
    <main>
      {/* Hero: boja tima kao podloga, dijagonalne pruge kao uzorak. */}
      <section className="brand-surface relative overflow-hidden">
        <div className="brand-stripes absolute inset-0" aria-hidden />
        <div
          className="absolute inset-y-0 right-0 w-1/3 skew-x-12 bg-gradient-to-l from-[var(--brand)]/60 to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
          <p className="text-brand-accent mb-3 text-sm font-semibold tracking-[0.2em] uppercase">
            Formula Student · FESB Split
          </p>
          <h1 className="max-w-2xl text-4xl font-bold text-white sm:text-6xl">
            Nosi boje tima.
          </h1>
          <div className="brand-rule mt-5 h-1 w-24 rounded-full" aria-hidden />
          <p className="mt-3 max-w-xl text-white/70">
            Službeni merch FESB Racing tima. Odaberi veličinu, pošalji narudžbu,
            a za plaćanje i preuzimanje dogovorimo se osobno.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="bg-brand h-6 w-1.5 rounded-full" aria-hidden />
          <h2 className="text-2xl font-bold">Proizvodi</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <Link
            key={String(product._id)}
            href={`/proizvodi/${String(product._id)}`}
            className="focus-visible:ring-ring rounded-xl focus-visible:ring-2 focus-visible:outline-none"
          >
            <Card className="hover:border-brand group h-full overflow-hidden pt-0 transition-colors">
              <div className="bg-muted text-muted-foreground relative flex h-48 items-center justify-center overflow-hidden">
                <span
                  className="brand-rule absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform group-hover:scale-x-100"
                  aria-hidden
                />
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
                <span className="text-brand text-lg font-bold">
                  {product.price} €
                </span>
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
      </div>
    </main>
  );
}
