import { model, Schema, type InferSchemaType } from 'mongoose';

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    substitutionPreference: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    items: { type: [orderItemSchema], required: true },
    pickupSlot: { type: Schema.Types.ObjectId, ref: 'PickupSlot' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'ready', 'picked-up', 'cancelled'],
      default: 'pending',
    },
    total: { type: Number, required: true, min: 0 },
    lastStatusUpdateAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type Order = InferSchemaType<typeof orderSchema>;
export const OrderModel = model('Order', orderSchema);
