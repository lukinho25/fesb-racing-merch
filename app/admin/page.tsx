import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { createProduct, deleteProduct } from '@/app/actions/products';
import { logout } from '@/app/actions/auth';
import ProductForm from './product-form';

export const metadata = {
  title: 'Admin | FESB Racing Merch',
};

export default async function AdminPage() {
  await requireAdmin();

  await connectDB();
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Administracija</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm underline">
            Pogledaj trgovinu
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm underline">
              Odjava
            </button>
          </form>
        </div>
      </div>

      <section className="border rounded-lg p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">Novi proizvod</h2>
        <ProductForm action={createProduct} submitLabel="Dodaj proizvod" />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Proizvodi ({products.length})
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500">Još nema proizvoda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {products.map((product) => (
              <li
                key={String(product._id)}
                className="border rounded-lg p-3 flex items-center gap-4"
              >
                <div className="h-14 w-14 shrink-0 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400">nema</span>
                  )}
                </div>

                <div className="grow min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.price} € · zaliha {product.stock}
                    {product.sizes?.length > 0 && ` · ${product.sizes.join(', ')}`}
                  </p>
                </div>

                <Link
                  href={`/admin/${String(product._id)}`}
                  className="text-sm underline shrink-0"
                >
                  Uredi
                </Link>

                <form action={deleteProduct} className="shrink-0">
                  <input type="hidden" name="id" value={String(product._id)} />
                  <button type="submit" className="text-sm text-red-600 underline">
                    Obriši
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
