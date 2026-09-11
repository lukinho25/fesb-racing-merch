import mongoose from 'mongoose';

/** Jedna veličina i njezina zaliha. */
const VariantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    // image je glavna slika; images drži cijelu galeriju s glavnom na prvom
    // mjestu. image ostaje zbog već spremljenih proizvoda i /api/products.
    image: { type: String },
    images: { type: [String], default: [] },
    // variants drži zalihu po veličini. sizes je izvedeni popis veličina i
    // stock zbroj njihovih zaliha; proizvod bez veličina (npr. kapa) koristi
    // samo stock.
    sizes: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },
    category: { type: String },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
