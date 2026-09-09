import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  await connectDB();
  const products = await Product.find({});
  return Response.json(products);
}