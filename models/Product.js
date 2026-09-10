import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  // image je glavna slika; images drzi cijelu galeriju s glavnom na prvom
  // mjestu. image ostaje zbog vec spremljenih proizvoda i /api/products.
  image: { type: String },
  images: { type: [String], default: [] },
  sizes: { type: [String], default: [] },
  category: { type: String },
  stock: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);