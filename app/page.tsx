import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export default async function Home() {
  await connectDB();
  const products = await Product.find({}).lean();

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">FESB Racing Merch</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="border rounded-lg p-4 shadow-sm">
            <div className="bg-gray-100 h-40 rounded mb-3 flex items-center justify-center text-gray-400">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full object-cover" />
              ) : (
                'Nema slike'
              )}
            </div>
            <h2 className="font-semibold text-lg">{product.name}</h2>
            <p className="text-gray-500 text-sm mb-2">{product.description}</p>
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