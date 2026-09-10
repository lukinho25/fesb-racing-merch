export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import { isAdmin } from '@/lib/auth';
import Product from '@/models/Product';

export default async function Home() {
  await connectDB();
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  const admin = await isAdmin();

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">FESB Racing Merch</h1>
        <Link href={admin ? '/admin' : '/login'} className="text-sm underline">
          {admin ? 'Administracija' : 'Prijava'}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={String(product._id)} className="border rounded-lg p-4 shadow-sm">
            <div className="bg-gray-100 h-40 rounded mb-3 flex items-center justify-center text-gray-400 overflow-hidden">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image} alt={product.name} className="h-full object-cover" />
              ) : (
                'Nema slike'
              )}
            </div>
            <h2 className="font-semibold text-lg">{product.name}</h2>
            <p className="text-gray-500 text-sm mb-2">{product.description}</p>
            {product.sizes?.length > 0 && (
              <p className="text-gray-500 text-xs mb-2">
                Veličine: {product.sizes.join(', ')}
              </p>
            )}
            <p className="font-bold">{product.price} €</p>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-gray-400">Trenutno nema proizvoda.</p>
      )}
    </main>
  );
}
