import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    // Naziv, veličinu i cijenu pamtimo kakvi su bili u trenutku narudžbe -
    // kasnija izmjena proizvoda ne smije promijeniti staru narudžbu.
    name: { type: String, required: true },
    size: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    note: { type: String },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['nova', 'potvrdena', 'preuzeta', 'otkazana'],
      default: 'nova',
    },
    // Je li zaliha ove narudžbe vraćena na stanje (otkazivanjem). Sprječava
    // dvostruko vraćanje i zna da kod ponovnog otvaranja treba skinuti opet.
    stockReturned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
