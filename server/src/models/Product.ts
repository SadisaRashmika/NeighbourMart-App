import { model, Schema, type InferSchemaType } from 'mongoose';

const productSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    available: { type: Boolean, default: true },
    imageUrl: { type: String, trim: true },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type Product = InferSchemaType<typeof productSchema>;
export const ProductModel = model('Product', productSchema);
