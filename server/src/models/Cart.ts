import { model, Schema } from 'mongoose';
const cartSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{ product: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, quantity: { type: Number, min: 1, required: true } }],
}, { timestamps: true, optimisticConcurrency: true });
export const CartModel = model('Cart', cartSchema);
